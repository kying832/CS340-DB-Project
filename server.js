var express = require('express');
var mysql = require('./localdb.js');    //DB CONFIG FILE NAME HERE
var bodyParser = require('body-parser');

var app = express();
var router = express.Router();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var tools = require('./tools.js');
tools();

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', 3000);      //PORT NUMBER HERE!!!
app.set('mysql', mysql);
app.use('/', router);
app.use('/student', router);
app.use('/addremove', router);
//simple main page for now, only selects all tutors currently in DB, prints name, etc.
router.get('/', function (req, res) {
	var callbackCount = 0;
	var context = {};
	getTutorInfo(res, mysql, context, complete);
	getSubjectList(res, mysql, context, complete);
	getTimeSlots(res, mysql, context, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3)
			res.render('mainpage', context);
	}
});
//set viewer for student data in DB prints all parameters
router.get('/student', function (req, res) {
	var callbackCount = 0;
	var context = {};
	getStudentInfo(res, mysql, context, complete);
	getSubjectList(res, mysql, context, complete);
	getTimeSlots(res, mysql, context, complete);
	getStudentTutorPairings(res, mysql, context, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 4)
			res.render('student', context);
	}
});
router.get('/addremove', function(req, res){
	var callbackCount = 0;
	var context = {};
	getTutorSubject(res, mysql, context, complete);
	getAllTutors(res, mysql, context ,complete);
	getAllSubjects(res, mysql, context ,complete);

	function complete(){
		callbackCount++;
		if(callbackCount >= 3)
			res.render('AddRemove', context);
	}
	

});
router.post('/addremove', function(req, res){
	var qStr = 'INSERT INTO tutor_subject(tutor_id, subject_id) VALUES (?,?);';
	var inserts = [req.body.tutor, req.body.subject];
	mysql.pool.query(qStr, inserts, function(error, results, fields){
		if(error){
			res.write(JSON.stringify(error));
			res.end();
		}
		else{
			res.redirect('AddRemove');
		}
		
	});
});
router.delete('/addremove', function(req, res){
	var qStr = 'DELETE FROM tutor_subject WHERE tutor_id = ? AND subject_id = ?;';
	var inserts = [req.body.tutor, req.body.subject];
	//console.log(inserts);
	mysql.pool.query(qStr, inserts, function(error, results, fields){
		if(error){
			res.write(JSON.stringify.error);
			res.end();
		}
		else{
			res.status(202).end();
		}
	});

});
//handler for adding new students to DB
router.post('/student', function (req, res) {
	var callbackCount = 0;
	var insertResult = insertStudentData(req.body, mysql, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			req.method = 'GET';
			res.redirect('/student');
		}
	}
});

router.delete('/student/:id', function (req, res) {
	console.log('Deleting....');
	var qStr = 'DELETE from STUDENT where student.student_id = ?';
	var inserts = [req.params.id];
	mysql.pool.query(qStr, inserts, function (error, results, fields) {
		if (error) {
			console.log(JSON.stringify(error));
			res.status(400);
			res.end;
		}
		else {
			res.status(202).end();
		}
	});
});
router.get('/subject', function(req, res){
	var context = {};
	var callbackCount = 0;
	getAllSubjects(res, mysql, context, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 1)
		{
			res.render('subjects', context);
		}
	}
});
router.post('/subject', function(req, res){
	var context = {};
	var callbackCount = 0;
	var qStr= 'SELECT tutor_name FROM tutor INNER JOIN tutor_subject TS ON tutor.tutor_id = TS.tutor_id WHERE TS.subject_id = ?';
	var insert = [req.body.subject];
	var qStr2 = 'SELECT subject_name AS search_name FROM subject WHERE subject_id = ?';
	function complete(){
		callbackCount++;
		if(callbackCount >= 1)
		{
			res.render('subjects', context);
		}
	}
	
	mysql.pool.query(qStr, insert, function(error, results, fields){
		if(error){
			res.write(JSON.stringify(error));
			res.end();
		}
		else{
			context.tutor = results;
			mysql.pool.query(qStr2, insert, function(error, results, fields){
				if(error){
					res.write(JSON.stringify(error));
					res.end();
				}
				else{
					context.search_name = results[0];
				
					getAllSubjects(res, mysql, context, complete);
				}

			});
		}

	});
});
router.post('/subject/add', function(req, res){
	var qStr = 'INSERT INTO subject(subject_name) VALUES (?);';
	var insert = [req.body.subject_name];
	mysql.pool.query(qStr, insert, function(error, results, fields){
		if(error){
			res.write(JSON.stringify(error));
			res.end();
		}
		else{
			res.redirect('/subject');
		}
	})
});

//handler for UPDATE page request
router.get('/:id', function (req, res) {
	var callbackCount = 0;
	var context = {};

	getOneTutorData(req.params.id, mysql, context, complete);
	getSubjectList(res, mysql, context, complete);
	getTimeSlots(res, mysql, context, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			//		console.log(context);
			res.render('update', context);
		}
	}
});

//handler for STUDENT UPDATE prompt
router.get('/student/:id', function (req, res) {
	var callbackCount = 0;
	var context = {};

	getOneStudentData(req.params.id, mysql, context, complete);
	getSubjectList(res, mysql, context, complete);
	getTimeSlots(res, mysql, context, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			console.log('Student prefilled data: ');
			console.log(context);
			res.render('updateStudent', context);
		}
	}
});


//handler that performs the query to update the students
router.post('/student/:id', function (req, res) {
	//   console.log('Data to Update:');
	//   console.log(req.body);
	//   console.log(req.params.id);
	qStr = 'UPDATE student SET student.student_fname = ?, student.student_lname = ? WHERE student.student_id = ?';
	insert1 = [req.body.student_fname, req.body.student_lname, req.body.student_id];

	qStr2 = 'UPDATE student_subject SET subject_id = ? WHERE student_id = ? AND subject_id = ?';
	insert2 = [req.body.subject, req.body.student_id, req.body.old_subject];

	qStr3 = 'UPDATE student_time SET time_id = ? WHERE student_id = ? AND time_id = ?';
	insert3 = [req.body.time_slot, req.body.student_id, req.body.old_time];

	mysql.pool.query(qStr, insert1, function (error, results, fields) {
		if (error) {
			console.log(JSON.stringify(error));
			res.end();
		}
		else {
			mysql.pool.query(qStr2, insert2, function (error, results, fields) {
				if (error) {
					console.log(JSON.stringify(error));
					res.end();
				}
				else {
					mysql.pool.query(qStr3, insert3, function (error, results, fields) {
						if (error) {
							console.log(JSON.stringify(error));
							res.end();
						}
						else {
							console.log('update successful');
							res.redirect('/student');
						}
					});
				}

			});


		}
	});


});
router.post('/:id', function (req, res) {
	//   console.log('Data to Update:');
	//   console.log(req.body);
	//   console.log(req.params.id);
	qStr = 'UPDATE tutor SET tutor_name = ? WHERE tutor_id = ?';
	insert1 = [req.body.tutor_name, req.body.tutor_id];

	qStr2 = 'UPDATE tutor_subject SET subject_id = ? WHERE tutor_id = ? AND subject_id = ?';
	insert2 = [req.body.subject, req.body.tutor_id, req.body.old_subject];

	qStr3 = 'UPDATE tutor_time SET time_id = ? WHERE tutor_id = ? AND time_id = ?';
	insert3 = [req.body.time_slot, req.body.tutor_id, req.body.old_time];

	mysql.pool.query(qStr, insert1, function (error, results, fields) {
		if (error) {
			console.log(JSON.stringify(error));
			res.end();
		}
		else {
			mysql.pool.query(qStr2, insert2, function (error, results, fields) {
				if (error) {
					console.log(JSON.stringify(error));
					res.end();
				}
				else {
					mysql.pool.query(qStr3, insert3, function (error, results, fields) {
						if (error) {
							console.log(JSON.stringify(error));
							res.end();
						}
						else {
							console.log('update successful');
							res.redirect('/');
						}
					});
				}

			});


		}
	});


});

//handler for POST requests to add new tutors to the DB
router.post('/', function (req, res) {
	//console.log(req.body);

	var callbackCount = 0;
	var insertResult = insertTutorData(req.body, mysql, complete);
	/*
	if(insertResult != 0)
	{
        //res.write(insertResult);
        console.log('ERROR!');
		res.end();
	}
	else{
    */
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			req.method = 'GET';
			res.redirect('/');
		}

	}

	// }
});


router.delete('/:id', function (req, res) {
	//console.log('deleting from tutor....')
	var qStr = 'DELETE FROM tutor WHERE tutor_id = ?';
	var insert = [req.params.id];
	mysql.pool.query(qStr, insert, function (error, results, fields) {
		if (error) {
			console.log(JSON.stringify(error));
			res.status(400);
			res.end;
		}
		else {
			res.status(202).end();
		}

	});
});


app.use(function (req, res) {

	res.status(404);
	res.render('404');
});

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function () {
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

function getTutorInfo(res, mysql, context, complete) {
	var qString = 'SELECT tutor_name, subject_name AS subject, time_slot, tutor.tutor_id AS id FROM tutor ' +
		'INNER JOIN tutor_subject TS on tutor.tutor_id = TS.tutor_id ' +
		'INNER JOIN subject ON TS.subject_id = subject.subject_id ' +
		'INNER JOIN tutor_time TT ON tutor.tutor_id = TT.tutor_id ' +
		'INNER JOIN time ON TT.time_id = time.time_id;';
	mysql.pool.query(qString, function (error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.tutor = results;
		//	console.log(context);
		complete();
	});

}

function getStudentInfo(res, mysql, context, complete) {
	var qStr = 'SELECT student_fname AS fname, student_lname AS lname, subject_name AS subject, time_slot, student.student_id AS id from student ' +
		'INNER JOIN student_subject SS ON student.student_id = SS.student_id ' +
		'INNER JOIN subject ON SS.subject_id = subject.subject_id ' +
		'INNER JOIN student_time ST ON student.student_id = ST.student_id ' +
		'INNER JOIN time ON ST.time_id = time.time_id;';
	mysql.pool.query(qStr, function (error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.student = results;
		complete();
	});
}

function getSubjectList(res, mysql, context, complete) {
	var qString = 'SELECT subject_name, subject_id FROM subject';
	mysql.pool.query(qString, function (error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.subject = results;
		//	console.log(context);
		complete();
	});
}
function getTimeSlots(res, mysql, context, complete) {
	var qString = 'SELECT time_slot, time_id FROM time';
	mysql.pool.query(qString, function (error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.time_slot = results;
		//	console.log(context);
		complete();
	});
}

