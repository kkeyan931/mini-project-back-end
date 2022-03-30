CREATE TABLE students(
    id SERIAL PRIMARY KEY,
    rollNumber VARCHAR(50),
    email VARCHAR(255),
    department VARCHAR(50),
    fullName VARCHAR(255),
    phone VARCHAR(15)
);

CREATE TABLE subjects(
    id SERIAL PRIMARY KEY,
    subjectCode VARCHAR(10),
    subjectTitle VARCHAR(50),
    credits VARCHAR(10),
    maxMarks VARCHAR(5),
    semester VARCHAR(2)
);



CREATE TABLE marks(
    id SERIAL PRIMARY KEY,
    studentID INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subjectID INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    marks VARCHAR(5)
);


INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES('2018103549','kkeyan931@gmail.com','CSE','karthikeyan K','8220578186');

INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES('2018103543','jim@gmail.com','CSE','Jim Tony','8220578186');

INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES('2018103519','bharath@gmail.com','CSE','Bharth','8220578186');

INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES('2018103501','athiban@gmail.com','CSE','Athiban T','13245555626');

INSERT INTO students(rollNumber,email,department,fullName,phone) VALUES('2018103013','dhanush@gmail.com','CSE','Dhanush Kumar','1374959149');



SELECT * FROM students;


INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES('CS1033','OS','6','100','2');

INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES('CS1032','CN','6','100','3');

INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES('CS1034','DBMS','6','100','5');

INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES('CS1035','CD','5','100','3');

INSERT INTO subjects(subjectCode,subjectTitle,credits,maxMarks,semester) VALUES('CS1036','ML','7','100','7');



SELECT * FROM subjects;

SELECT * from subjects;


INSERT INTO marks(studentId,subjectId,marks) VALUES('22','7','99');

INSERT INTO marks(studentId,subjectId,marks) VALUES('22','7','90');

INSERT INTO marks(studentId,subjectId,marks) VALUES('22','8','88');

INSERT INTO marks(studentId,subjectId,marks) VALUES('23','10','100');

INSERT INTO marks(studentId,subjectId,marks) VALUES('23','9','78');

INSERT INTO marks(studentId,subjectId,marks) VALUES('23','7','80');

INSERT INTO marks(studentId,subjectId,marks) VALUES('24','8','90');

INSERT INTO marks(studentId,subjectId,marks) VALUES('24','9','92');

INSERT INTO marks(studentId,subjectId,marks) VALUES('25','11','44');

INSERT INTO marks(studentId,subjectId,marks) VALUES('25','11','53');


INSERT INTO marks(studentId,subjectId,marks) VALUES('26','8','52');


INSERT INTO marks(studentId,subjectId,marks) VALUES('26','7','');


INSERT INTO marks(studentId,subjectId,marks) VALUES('26','9','');



SELECT * FROM marks;

SELECT * FROM students;



SELECT S.id,S.rollnumber,S.email,S.department,S.fullname,S.phone,M.subjectid,M.marks,Sub.subjecttitle 
FROM 
students AS S 
JOIN 
marks AS M
ON S.id = M.studentid 
JOIN
subjects AS Sub
ON
M.subjectid = Sub.id
ORDER BY
S.id ASC;


DELETE FROM students WHERE rollNumber='2018103542';


DELETE FROM marks WHERE id=13;


DELETE FROM students;
DELETE FROM subjects;
DELETE FROM marks;

DROP table average;


CREATE TABLE average(
	title VARCHAR(100) PRIMARY KEY,
	averageMarks VARCHAR(100) 
	
);

SELECT * FROM average;a

SELECT DISTINCT subjectid FROM marks;



