/**
 * @file server.js
 * @description this controller handle all about authorization, givin access tokens and bypass authenticated users .
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */

const mongoose = require('mongoose');
const dotEnv = require('dotenv');
const mySqlPool= require('./utils/dbMysql');
const azGetSecret= require('./utils/azureKeyVault');
const logger = require('./utils/logger');

//and all the rest means syncronus we need to handle here like division/0 

/**
 * overrites the process when uncaught errors was not handle by our errors handlers
 * @param {Object} err the uncaught global error 
 */

process.on('uncaughtException', err=>{
  console.log('NATOURS UNCAUGHT 💥 EXCEPTION! SHUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);  
});


dotEnv.config({path: './config.env'});
const app = require('./app');


/*azGetSecret(process.env.KEY_VAULT_SECRET_DB)
.then((secret)=>{
  logger.error(`az get secret for db mongo: ${secret.value}`);
  mongoose.connect(process.env.DATABASE.replace('<PASSWORD>', secret.value), { })
  .then(()=>{ console.log('mongo db connection success');});
}).catch((error)=>{
  logger.error(`az get secret error for db mongo: ${error}`);
});*/

const BD= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(BD, { 
}).then(()=>{ console.log('moongo db connection success');});

/*mySqlPool.query('SELECT 1001')
         .then(()=>{
  logger.error('mysql connection success');
  console.log('conecction to mysql succeeded');
}).catch((error)=>{
  logger.error(`error mysql connection:${error}`);
  console.log(error);
});*/

const port = process.env.PORT || 8080;
const server=app.listen(port, ()=>{
  console.log(`guaritorus working on port:${port}`);
});

/**
* for all asynchronous promises that we dont catch in a try section will fall here 
* to handle global unhandled promises /rejections we will use this listener when 
* raise an hunhandled promise like a db conection fail
* @param {Object} err the unhandled promise rejection error 
*/
process.on('unhandledRejection', err=>{
  console.log('NATOURS UNHANDLER REJECTION! SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(()=>{    
    process.exit(1);
  });
});

//if you are in a hosting, due for many reasons the web app will be shutdown abrut, 
//if we dont hanbdle this shutdwon our app can we stopped abrut when a booking is in progress, 
//causing errors in the app, to solve this we need to handle the sigterm signal that is and advice to shutdown
process.on('SIGTERM', ()=>{//we do not receive an error is a signal so that why is empty the ()=>
  console.log('Sigterm received, shutting down gracefully!☺');
  //server.close() will close the server, will not receive more request while finish the current request
  server.close(()=>{
    console.log('proccess terminated by sigterm!');
    //no need to call process.exit(1) because the hosting will cause the application to shutdown
  });
});