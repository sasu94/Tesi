
var mysql = require('mysql');

var connection = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'ngs1',
  database: 'varHunter',
  waitForConnections: 30000
});

//var connection = mysql.createPool({
//    host: '10.170.0.22',
//    user: 'root',
//    password: 'ngs1',
//    database: 'prova'
//});

module.exports = connection;
