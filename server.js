
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const mySqlPool= require('./config/dbMysql');

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


mySqlPool.query('SELECT 1001')
         .then(()=>{
  console.log('conecction to mysql succeeded');
}).catch((error)=>{
  console.log(error);
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`guaritorus working on port:${port}`);
});

