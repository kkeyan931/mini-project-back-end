const cron = require("node-cron");
const pool = require("./db");

cron.schedule("* * * * *", async function () {
  try {
    let marks = await pool.query("SELECT marks from MARKS");

    let totalMarks = 0;
    let count = 0;
    for (let row of marks.rows) {
      if (row.marks != "") {
        totalMarks += Number(row.marks);
        count++;
      }
    }
    let distictSubjectId = await pool.query(
      "SELECT DISTINCT subjectid FROM marks"
    );

    let averageMarksOfStudent = totalMarks / count;
    let averageMarksOfSubject = {};

    for (let row of distictSubjectId.rows) {
      let marksForSubject = await pool.query(
        "SELECT marks FROM marks WHERE subjectid=$1",
        [row.subjectid]
      );

      let count = 0;
      let totalMarks = 0;

      for (let mark of marksForSubject.rows) {
        if (mark.marks != "") {
          totalMarks += Number(mark.marks);
          count++;
        }
      }

      let subjectTitle = await pool.query(
        "SELECT subjecttitle FROM subjects WHERE id=$1",
        [row.subjectid]
      );

      averageMarksOfSubject[subjectTitle.rows[0].subjecttitle] =
        totalMarks / count;
    }

    console.log(averageMarksOfStudent, averageMarksOfSubject);

    await pool.query(
      "INSERT INTO average (title,averagemarks) VALUES ($1,$2) ON CONFLICT (title) DO UPDATE SET averagemarks = $3",
      ["student", averageMarksOfStudent, averageMarksOfStudent]
    );

    let keys = Object.keys(averageMarksOfSubject);
    for (let subject of keys) {
      await pool.query(
        "INSERT INTO average (title,averagemarks) VALUES ($1,$2) ON CONFLICT (title) DO UPDATE SET averagemarks = $3",
        [
          subject,
          averageMarksOfSubject[subject],
          averageMarksOfSubject[subject],
        ]
      );
    }
  } catch (error) {
    console.log(error);
  }
});
