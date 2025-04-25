
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const mySqlPool= require('./config/dbMysql');
const winston = require('winston');

//and all the rest means syncronus we need to handle here like division/0 
process.on('uncaughtException', err=>{
  console.log('NATOURS UNCAUGHT EXCEPTION! SHUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);  
});

dotEnv.config({path: './config.env'});
const app = require('./app');


//to start handling the database first lets get the connection string replaced with the password
const BD= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
//now we have our conection string lets connect and pass some option in object format
mongoose.connect(BD, { //the parameter are not longer needing in the latest versions
  //useNewUrlParser:true,
  //useCreateIndex:true,
  //useUnifiedTopology: true,
  //useFindAndModify:false
}).then(()=>{ console.log('moongo db connection success');});
//check all their mongoose methods 


/*mySqlPool.query('SELECT 1001')
         .then(()=>{
  console.log('conecction to mysql succeeded');
}).catch((error)=>{
  console.log(error);
});*/

const port = process.env.PORT || 8080;
const server=app.listen(port, ()=>{
  console.log(`guaritorus working on port:${port}`);
  winston.info('message from winston');

});
//all asunchronous promises that we dont ctach in a try section fails will here
//to handle global unhandled promises /rejections we will use a listener when 
//raise an hunhanlded primise like a db conectrion fail
process.on('unhandledRejection', err=>{
  console.log('NATOURS UNHANDLER REJECTION! SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(()=>{    
    process.exit(1);
  });
});

