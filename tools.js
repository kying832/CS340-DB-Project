module.exports = function () {
	this.insertTutorData = function (body, mysql, complete) {
		console.log('inserting tutor data...');
		var duplicateQ = 'SELECT EXISTS (SELECT * FROM tutor WHERE tutor_name = ?) AS DUP';
		var qStr1 = 'INSERT INTO tutor(tutor_name) VALUES (?)';
		var insert1 = [body.tutor_name];

		var qStr2 = 'INSERT INTO tutor_subject(tutor_id, subject_id) VALUES ((SELECT tutor_id FROM tutor WHERE tutor_name = ?), ?)';
		var insert2 = [body.tutor_name, body.subject];

		var qStr3 = 'INSERT INTO tutor_time(tutor_id, time_id) VALUES ((SELECT tutor_id FROM tutor WHERE tutor_name = ?), ?)';
		var insert3 = [body.tutor_name, body.time_slot];
        
        
		console.log('adding tutor data');
		mysql.pool.query(duplicateQ, insert1, function(error, results, fields){
			if(error){
				console.log(JSON.stringify(error));
				return JSON.stringify(error);
			}
			else {
                
				var isDuplicate = results[0].DUP;
				console.log(isDuplicate);
				if(isDuplicate == 0) {
					mysql.pool.query(qStr1, insert1, function (error, results, fields) {
						if(error){ 
							console.log(JSON.stringify(error));
							return JSON.stringify(error);
						}
						else {
							complete();
							console.log('adding to other tables');
							mysql.pool.query(qStr2, insert2, function (error, results, fields) {
								if(error){ 
									console.log(JSON.stringify(error));
									return JSON.stringify(error);
								}
								else{
									complete();
								}
							});
                        
                    
							mysql.pool.query(qStr3, insert3, function (error, results, fields) {
								if(error){ 
									console.log(JSON.stringify(error));
									return JSON.stringify(error);
								}
								else{
									complete();
								}
							});
						}
					});
				}
			}
		});
		return 0;
	};
	this.insertStudentData = function(body, mysql, complete) {
		console.log('inserting student data...');
		var duplicateQ = 'SELECT EXISTS (SELECT * FROM student WHERE student.student_fname = ? && student.student_lname = ?) AS DUP';
		var qStr1 = 'INSERT INTO student(student_fname, student_lname) VALUES (?, ?)';
		var insert1 = [body.student_fname, body.student_lname];

		var qStr2 = 'INSERT INTO student_subject(student_id, subject_id) VALUES ((SELECT student_id FROM student WHERE student_fname = ? && student_lname = ?), ?)';
		var insert2 = [body.student_fname, body.student_lname, body.subject];

		var qStr3 = 'INSERT INTO student_time(student_id, time_id) VALUES ((SELECT student_id FROM student WHERE student_fname = ? && student_lname = ?), ?)';
		var insert3 = [body.student_fname, body.student_lname, body.time_slot];
        
        
		console.log('adding student data');
		mysql.pool.query(duplicateQ, insert1, function(error, results, fields){
			if(error){
				console.log(JSON.stringify(error));
				return JSON.stringify(error);
			}
			else {
                
				var isDuplicate = results[0].DUP;
				console.log(isDuplicate);
				if(isDuplicate != 0) return 1;
				if(isDuplicate == 0) {
					mysql.pool.query(qStr1, insert1, function (error, results, fields) {
						if(error){ 
							console.log(JSON.stringify(error));
							return JSON.stringify(error);
						}
						else {
							complete();
							console.log('adding to other tables');
							mysql.pool.query(qStr2, insert2, function (error, results, fields) {
								if(error){ 
									console.log(JSON.stringify(error));
									return JSON.stringify(error);
								}
								else{
									complete();
								}
							});
                        
                    
							mysql.pool.query(qStr3, insert3, function (error, results, fields) {
								if(error){ 
									console.log(JSON.stringify(error));
									return JSON.stringify(error);
								}
								else{
									complete();
								}
							});
						}
					});
				}
			}
		});
		return 0;
	};
    
	this.getOneTutorData = function(id, mysql, context, complete){
		var qStr = 'SELECT tutor.tutor_id, tutor_name, SUB.subject_id, time.time_id FROM tutor INNER JOIN tutor_subject TS ON TS.tutor_id = tutor.tutor_id INNER JOIN subject SUB ON SUB.subject_id = TS.subject_id '
		+ 'INNER JOIN tutor_time TT ON tutor.tutor_id = TT.tutor_id INNER JOIN time ON time.time_id = TT.time_id WHERE tutor.tutor_id = ?';
	//	console.log('tutor query id: ');
	//	console.log(id);
		var insert = [id];
		mysql.pool.query(qStr, insert, function(error, results, fields){
			if(error)
				console.log(JSON.stringify(error));
			else{
				context.tutor = results[0];
				complete();
			}
		});
	};
	this.getOneStudentData = function(id, mysql ,context, complete){
		var qStr = 'SELECT student.student_id, student.student_fname, student.student_lname, SUB.subject_id, time.time_id FROM student ' +
			'INNER JOIN student_subject SS ON SS.student_id = student.student_id INNER JOIN subject SUB ON SUB.subject_id = SS.subject_id ' +
			'INNER JOIN student_time ST ON ST.student_id = student.student_id INNER JOIN time on time.time_id = ST.time_id WHERE student.student_id = ?;';
		var insert = [id];
		mysql.pool.query(qStr, insert, function(error, results, fields){
			if(error)
				console.log(JSON.stringify(error));
			else{
				context.student = results[0];
				//console.log('Query Results:');
				//console.log(results[0]);
				complete();
			}
		});
	};
	this.getStudentTutorPairings = function(res, mysql, context, complete){
		var qStr = 'SELECT student_fname, student_lname, tutor_name, subject_name AS subject, time_slot FROM `student` INNER JOIN student_time ST ON ST.student_id =  student.student_id '+
		'INNER JOIN time ON time.time_id = ST.time_id ' +
		'INNER JOIN tutor_time TT ON time.time_id  = TT.time_id ' +
		'INNER JOIN tutor ON TT.tutor_id = tutor.tutor_id ' +
		'INNER JOIN tutor_subject TS ON TS.tutor_id = tutor.tutor_id ' +
		'INNER JOIN subject SUB ON SUB.subject_id = TS.subject_id ' +
		'INNER JOIN student_subject SS ON SS.subject_id = SUB.subject_id AND SS.student_id = student.student_id ';

		mysql.pool.query(qStr, function(error, results, fields){
			if(error){
				res.write(JSON.stringify(error));
				res.end();
			}
			else{
				context.pairing  = results;
				complete();
			}
		});
	};

	this.getTutorSubject = function(res, mysql, context, complete){
		var qStr = 'SELECT tutor.tutor_name, SUB.subject_name AS subject, tutor.tutor_id, SUB.subject_id FROM tutor_subject TS INNER JOIN subject SUB ON TS.subject_id = SUB.subject_id INNER JOIN tutor ON TS.tutor_id = tutor.tutor_id;';
		mysql.pool.query(qStr, function(error, results, fields){
			if(error){
				res.write(JSON.stringify(error));
				res.end();
			}
			else{
				context.tutor_subject = results;
				complete();
			}
		});
	};
	this.getAllTutors = function(res, mysql, context, complete){
		var qStr = 'SELECT tutor_name, tutor_id FROM tutor';
		mysql.pool.query(qStr, function(error, results, fields){
			if(error){
				res.write(JSON.stringify(error));
				res.end();
			}
			else{
				context.tutor = results;
				complete();
			}
		});
	};
	this.getAllSubjects = function(res, mysql, context, complete){
		var qStr = 'SELECT subject_name, subject_id FROM subject';
		mysql.pool.query(qStr, function(error, results, fields){
			if(error){
				res.write(JSON.stringify(error));
				res.end();
			}
			else{
				context.subject = results;
				complete();
			}
		});
	};
	

};

