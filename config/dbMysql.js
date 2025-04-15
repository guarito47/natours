const mysql = require('mysql2/promise');

const mySqlPool= mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Pa$$w0rd',
  database:'natoursmysql'

});

module.exports = mySqlPool;