CREATE TABLE tutor (
  tutor_id int AUTO_INCREMENT PRIMARY KEY,
  tutor_name VARCHAR(255) NOT NULL,
  UNIQUE KEY(`tutor_name`)
);

CREATE TABLE subject(
  subject_id int AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  UNIQUE KEY(`subject_name`)
);

CREATE TABLE student(
  student_id int AUTO_INCREMENT PRIMARY KEY,
  student_fname VARCHAR(255) NOT NULL,
  student_lname VARCHAR(255) NOT NULL,
  UNIQUE KEY(`student_fname`, `student_lname`)
);

CREATE TABLE time(
  time_id int AUTO_INCREMENT PRIMARY KEY,
  time_slot VARCHAR(255) NOT NULL,
  UNIQUE KEY(`time_slot`)
);

CREATE TABLE tutor_subject(
  tutor_id int,
  subject_id int, 
  FOREIGN KEY(tutor_id) REFERENCES tutor(tutor_id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
  PRIMARY KEY(`tutor_id`, `subject_id`)
);

CREATE TABLE student_subject(
  student_id int,
  subject_id int, 
  FOREIGN KEY(student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
  PRIMARY KEY(`student_id`, `subject_id`)
);

CREATE TABLE tutor_time(
  tutor_id int,
  time_id int,
  FOREIGN KEY(tutor_id) REFERENCES tutor(tutor_id) ON DELETE CASCADE,
  FOREIGN KEY(time_id) REFERENCES time(time_id) ON DELETE CASCADE,
  PRIMARY KEY(`tutor_id`, `time_id`)
);

CREATE TABLE student_time(
  student_id int,
  time_id int,
  FOREIGN KEY(student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY(time_id) REFERENCES time(time_id) ON DELETE CASCADE,
  PRIMARY KEY(`student_id`, `time_id`)
);

INSERT INTO tutor (tutor_name) VALUES('Kevin');
INSERT INTO subject (subject_name) VALUES ('Math');
INSERT INTO subject (subject_name) VALUES ('Chemistry');
INSERT INTO subject (subject_name) VALUES ('Physics');
INSERT INTO subject (subject_name) VALUES ('Biology');
INSERT INTO subject (subject_name) VALUES ('Computer Science');

INSERT INTO student (student_fname, student_lname) VALUES ('John', 'Smith');
INSERT INTO time (time_slot) VALUES ('10:00 - 11:00');
INSERT INTO time (time_slot) VALUES ('11:00 - 12:00');
INSERT INTO time (time_slot) VALUES ('12:00 - 1:00');
INSERT INTO time (time_slot) VALUES ('1:00 - 2:00');
INSERT INTO time (time_slot) VALUES ('2:00 - 3:00');
INSERT INTO time (time_slot) VALUES ('3:00 - 4:00');
INSERT INTO time (time_slot) VALUES ('4:00 - 5:00');
INSERT INTO time (time_slot) VALUES ('5:00 - 6:00');
INSERT INTO time (time_slot) VALUES ('6:00 - 7:00');

INSERT INTO tutor_subject VALUES ((SELECT tutor_id FROM tutor WHERE tutor_name = 'Kevin'), 
	(SELECT subject_id FROM subject WHERE subject_name = 'Math'));
	
INSERT INTO student_subject VALUES ((SELECT student_id FROM student WHERE student_fname = 'John' AND student_lname  = 'Smith'),
	(SELECT subject_id FROM subject WHERE subject_name = 'Math'));
	
INSERT INTO tutor_time VALUES ((SELECT tutor_id FROM tutor wHERE tutor_name = 'Kevin'), (SELECT time_id FROM time WHERE time_slot = '2:00 - 3:00'));
INSERT INTO student_time VALUES ((SELECT student_id FROM student wHERE student_fname = 'John' AND student_lname = "Smith"), (SELECT time_id FROM time WHERE time_slot = '2:00 - 3:00'));

--query to match up tutors and students at all time slots.
--select tutor_name, student_fname, student_lname, time_slot FROM tutor T
--INNER JOIN tutor_time TT ON T.tutor_id = TT.tutor_id
--INNER JOIN time ON TT.time_id =  time.time_id
--INNER JOIN student_time ST ON time.time_id = ST.time_id
--INNER JOIN student S ON ST.student_id = S.student_id

