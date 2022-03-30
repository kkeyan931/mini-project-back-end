const express = require("express");
const redis = require("redis");

const pool = require("./db");
const app = express();

const REDIS_PORT = process.env.REDIS_PORT || 6379;

let client;

(async () => {
  client = redis.createClient(REDIS_PORT);
  await client.connect();
  console.log("connected");
})();

app.use(express.json());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

app.delete("/subjects/:id", async (req, res) => {
  let { id } = req.params;

  try {
    await pool.query("DELETE FROM subjects WHERE id = $1", [id]);

    let subjectJson = await getAllSubjects();

    console.log("fetched from the api");

    // Set data to Redis
    await client.json.set("subjects", ".", subjectJson);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    throw Error("Unable to delete");
  }
});

app.put("/subjects/:id", async (req, res) => {
  let { id } = req.params;

  const newSubject = req.body;

  try {
    let addedSubject = await pool.query(
      "UPDATE subjects SET subjectCode = $1, subjectTitle=$2, credits=$3, maxMarks=$4, semester=$5 WHERE id=$6",
      [
        newSubject.subjectCode,
        newSubject.subjectTitle,
        newSubject.credits,
        newSubject.maxMarks,
        newSubject.semester,
        id,
      ]
    );
    newSubject.id = id;
    let subjectJson = await getAllSubjects();

    console.log("fetched from the api");

    // Set data to Redis
    await client.json.set("subjects", ".", subjectJson);

    res.status(200).json(newSubject);
  } catch (error) {
    console.log(error);
    throw Error("Unable to update");
  }
});

app.post("/subjects", async (req, res) => {
  const newSubject = req.body;

  try {
    let addedSubject = await pool.query(
      "INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [
        newSubject.subjectCode,
        newSubject.subjectTitle,
        newSubject.credits,
        newSubject.maxMarks,
        newSubject.semester,
      ]
    );
    newSubject.id = addedSubject.rows[0].id;
    let subjectJson = await getAllSubjects();

    console.log("fetched from the api");

    // Set data to Redis
    await client.json.set("subjects", ".", subjectJson);

    res.status(201).json(newSubject);
  } catch (error) {
    console.log(error);
    throw Error("Unable to update");
  }
});

async function getAllSubjects() {
  try {
    const allSubjects = await pool.query("SELECT * FROM subjects");

    let subjectsStructured = {};

    for (subject of allSubjects.rows) {
      if (subjectsStructured[subject.id] == undefined) {
        subjectsStructured[subject.id] = {};
      }
      subjectsStructured[subject.id].id = subject.id;
      subjectsStructured[subject.id].subjectCode = subject.subjectcode;
      subjectsStructured[subject.id].subjectTitle = subject.subjecttitle;
      subjectsStructured[subject.id].credits = subject.credits;
      subjectsStructured[subject.id].maxMarks = subject.maxmarks;
      subjectsStructured[subject.id].semester = subject.semester;
    }

    let subjectJson = [];
    let keys = Object.keys(subjectsStructured);
    for (let index = 0; index < keys.length; ++index) {
      subjectJson.push(subjectsStructured[keys[index]]);
    }

    return subjectJson;
  } catch (error) {
    console.log(error);
    throw Error("Unable to fetch");
  }
}

app.get("/subjects", cache("subjects"), async (req, res) => {
  let subjectJson = await getAllSubjects();
  res.json(subjectJson);

  console.log("fetched from the api");

  // Set data to Redis
  await client.json.set("subjects", ".", subjectJson);
});

app.delete("/students/:id", async (req, res) => {
  let { id } = req.params;

  try {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);

    let studentJson = await getAllStudents();

    console.log("fetched from the api");

    await client.json.set("students", ".", studentJson);

    res.status(200).json();
  } catch (error) {
    console.log(error);
    throw Error("Unable to delete");
  }
});

app.put("/students/:id", async (req, res) => {
  let { id } = req.params;

  const newStudent = req.body;

  try {
    let addedStudent = await pool.query(
      "UPDATE students SET rollNumber = $1, email=$2, department=$3, fullName=$4, phone=$5 WHERE id=$6",
      [
        newStudent.rollNumber,
        newStudent.email,
        newStudent.department,
        newStudent.fullName,
        newStudent.phone,
        id,
      ]
    );

    await pool.query("DELETE FROM marks WHERE studentId=$1", [id]);

    for (let index = 0; index < newStudent.enrolledSubjects.length; ++index) {
      let subjectId = await pool.query(
        "SELECT id from subjects where subjecttitle=$1",
        [newStudent.enrolledSubjects[index]]
      );
      subjectId = subjectId.rows[0].id;
      await pool.query(
        "INSERT INTO marks(studentId,subjectId,marks) VALUES($1,$2,$3)",
        [id, subjectId, newStudent.marks[newStudent.enrolledSubjects[index]]]
      );
    }

    let studentJson = await getAllStudents();

    await client.json.set("students", ".", studentJson);
    console.log("fetched from the api");

    res.status(200).json(newStudent);
  } catch (error) {
    console.log(error);
    throw Error("Unable to update");
  }
});

app.post("/students", async (req, res) => {
  const newStudent = req.body;

  try {
    let addedStudent = await pool.query(
      "INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [
        newStudent.rollNumber,
        newStudent.email,
        newStudent.department,
        newStudent.fullName,
        newStudent.phone,
      ]
    );

    for (let index = 0; index < newStudent.enrolledSubjects.length; ++index) {
      let subjectId = await pool.query(
        "SELECT id from subjects where subjecttitle=$1",
        [newStudent.enrolledSubjects[index]]
      );
      subjectId = subjectId.rows[0].id;
      await pool.query(
        "INSERT INTO marks(studentId,subjectId,marks) VALUES($1,$2,$3)",
        [addedStudent.rows[0].id, subjectId, ""]
      );
    }

    let studentJson = await getAllStudents();
    console.log("fetched from the api");

    await client.json.set("students", ".", studentJson);

    newStudent.id = addedStudent.rows[0].id;
    res.status(201).json(newStudent);
  } catch (error) {
    console.log(error);
    throw Error("Unable to update");
  }
});

async function getAllStudents() {
  try {
    const allStudents = await pool.query(
      "SELECT S.id,S.rollnumber,S.email,S.department,S.fullname,S.phone,M.subjectid,M.marks,Sub.subjecttitle FROM students AS S JOIN marks AS M ON S.id = M.studentid JOIN subjects AS Sub ON M.subjectid = Sub.id ORDER BY S.id ASC"
    );

    let studentsStructured = {};

    for (student of allStudents.rows) {
      if (studentsStructured[student.id] == undefined) {
        studentsStructured[student.id] = {};
      }
      studentsStructured[student.id].id = student.id;
      studentsStructured[student.id].rollNumber = student.rollnumber;
      studentsStructured[student.id].email = student.email;
      studentsStructured[student.id].department = student.department;
      studentsStructured[student.id].fullName = student.fullname;
      studentsStructured[student.id].phone = student.phone;
      if (studentsStructured[student.id].marks == undefined) {
        studentsStructured[student.id].marks = {};
      }
      studentsStructured[student.id].marks[student.subjecttitle] =
        student.marks;

      if (studentsStructured[student.id].enrolledSubjects == undefined) {
        studentsStructured[student.id].enrolledSubjects = [];
      }

      studentsStructured[student.id].enrolledSubjects.push(
        student.subjecttitle
      );

      //   let marks = {};
      //   marks.subjectID = student.subjectid;
      //   marks.subjectTitle = student.subjecttitle;
      //   marks.marks = student.marks;
      //   studentsStructured[student.id].marks.push(marks);
    }

    let studentJson = [];
    let keys = Object.keys(studentsStructured);
    for (let index = 0; index < keys.length; ++index) {
      studentJson.push(studentsStructured[keys[index]]);
    }
    console.log("fetched from the api");

    return studentJson;
  } catch (error) {
    console.log(error);
    throw Error("Unable to fetch");
  }
}

app.get("/students", cache("students"), async (req, res) => {
  let studentJson = await getAllStudents();
  res.json(studentJson);

  console.log("fetched from the api");

  // Set data to Redis
  await client.json.set("students", ".", studentJson);
});

app.get("/average", cache("average"), async (req, res) => {
  try {
    let averageRows = await pool.query("SELECT * FROM average");

    let averageJson = {};

    for (let row of averageRows.rows) {
      averageJson[row.title] = row.averagemarks;
    }
    console.log("fetched from the api");

    await client.json.set("average", ".", averageJson);
    await client.expire("average",60);

    res.json(averageJson);
  } catch (error) {
    console.log(error);
    throw Error("Unable to fetch");
  }
});

function cache(dataKey) {
  return async function cache(req, res, next) {
    const data = await client.json.get(dataKey);

    if (data != null) {
      res.json(data);
      console.log("cached data sent");
    } else {
      next();
    }
  };
}

// Cache middleware

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
