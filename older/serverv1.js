const mongoose = require('mongoose');
const dotEnv = require('dotenv');

dotEnv.config({path: './config.env'});
const app = require('./app');

//to start handling the database first lets get the connection string replaced with the password
const BD= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
//now we have our conection string lets connect and pass some option in object format
mongoose.connect(BD, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false
}).then(()=>{ console.log('db connection success');});
//initial structure that we will improve with detail options for each field
/*const tourSchema = new mongoose.Schema({
  name:String,
  rating: Number,
  price: Number
});*/
const tourSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, 'A tour must have name'],
    unique:true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: true
  }
});

const Tour = mongoose.model('Tour',tourSchema);


//environment variables from express
//console.log(app.get('env'));
//envireonment variables from nodejs
//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`guaritorus working on port:${port}`);
});
