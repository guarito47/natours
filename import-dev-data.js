const fs= require('fs');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const Tour= require('./models/tourModels');
dotEnv.config({path: './config.env'});



const BD= process.env.DATABASE
.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(BD, { //mongoose parameters, see doc
}).then(()=>{ console.log('db connection success');});

//read json file and convert into javascript object array using the JSON parser
const tours= JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));
//import data into db
const importData= async()=>{

    try {
        await Tour.create(tours);
        //console.log('data successfully loaded');
        
    } catch (error) {
        console.log(error);
    }
    process.exit();//in the terminal its like ctr+c
};
//delete all data from db/collection

const deleteData=async()=>{

    try {
        await Tour.deleteMany();
        console.log('data successfully deleted');
        
    } catch (error) {
        console.log(error);
    }
    process.exit();//in the terminal its like ctr+c
};
//running this line, you will see the arguments when run node import-dev-data.js
// in array list 0= node app, 1= file path and if we add --import , 2=--import
console.log(process.argv);
//now we can use this 3th [2] param to choose which method we will run
//so in the terminal we will run 'node import-de-data.js --import'
if(process.argv[2]==='--import'){
    importData();
}else if(process.argv[2]==='--delete'){
    deleteData();
}