const mysql = require('mysql2/promise');
//const fs = require('fs');

const mySqlPool= mysql.createPool({
  host: 'natoursmysql.mysql.database.azure.com',
  port: 3306,
  user: 'rootNatoursmysql',
  password: 'Pa$$w0rd',
  database:'natoursmysql'
  /*ssl:{
    rejectUnauthorized: true,
    ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem", "utf-8")}*/
});

module.exports = mySqlPool;
