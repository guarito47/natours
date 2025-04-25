/**
 * @file tourController4Mysql.js
 * @description handle tour CRUD operations in the Mysql Azure DB
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const Tour = require('../models/tourModels');
const mySqlDb = require("../config/dbMysql");

/**
 * retrieve all the tours in the mysql db 
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 */
exports.getAllTours= async(req, res)=>{
    
    try{
        //Tour.findOne({_id: req.params.id})
        
        //const [rows]= await mySqlDb.query('SELECT * FROM tour')
        const data= await mySqlDb.query('SELECT * FROM tour');

        res.status(200).json(
            {
                status:'succes 16/4',                
                //the retrieve data comes with junk data from mysql, to avoid to show that we ill only reffer to 
        //the position [0] where is nested all the records of our query
                totalRecords: data[0].length,
                data: data[0]                
            }
        );
    } catch(err){
        res
        .status(400)
        .json({
            status:'fail',        
            message:err
        });
    }
    
};

/**
 * retrieve a specific tour bye their id from the mysql db 
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 */
exports.getTour= async(req, res)=>{
    
    try{
        //Tour.findOne({_id: req.params.id})
        const tourbyId= await mySqlDb.query(`select * from tour where tour.idTour= ${req.params.id}`);
        res.status(200).json(
            {
                status:'succes 16/4 azure',
                data:tourbyId[0]
                
            }
        );
    } catch(err){
        res
        .status(400)
        .json({
            status:'fail',        
            message:err
        });
    }    
};

/**
 * creates a new tour in the mysql db 
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 */
exports.createTour=async(req, res)=>{

    try{
    const {idtour,name,duration,difficulty,price,summary,imageCover}=  req.body;
    const newTour= await mySqlDb.query(`INSERT INTO tour (idtour,name,duration,difficulty,price,summary,imageCover) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [idtour, name, duration, difficulty, price, summary, imageCover]);
    res
    .status(201)
    .json(
        {
            status:'success on azure v2',
            data:{
                tour: newTour
            } 
        }
    );  
    } catch(err){
        console.log(`error create tour:${err}`);
        res.status(400)
        .json({
            status:'fail',
            message: 'invalid data sent from create tour'
        });
    } 
};



