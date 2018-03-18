var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit : 10,
	host            : 'localhost',
	user            : 'root',
	password        : 'root',
	socket:           '/Applications/MAMP/tmp/mysql/mysql.sock',
	database: 'local_testing',
	port: 3306,
	multipleStatements: true,
});
module.exports.pool = pool;