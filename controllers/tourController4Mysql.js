const Tour = require('../models/tourModels');
//const APIFeatures= require('../utils/apiFeatures');

const mySqlDb = require("../config/dbMysql");


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

exports.updateTour= async (req, res)=>{

    try {
        // some options to add are 
        const updatedTour= await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new:true,//to return the updated document
            runValidators:true //this allows to run max length, min length
        } )
        res.status(200).json(
            {
                status:'succes',
                data: {
                    tour: updatedTour
                }
            }
        );
    } catch (error) {
        res.status(400)
        .json({
            status:'fail',
            message: error
        });
    }
    
};
exports.deleteTour= async(req, res)=>{ 
    try {
        // some options to add are 
        const deletedTour= await Tour.findByIdAndDelete(req.params.id);
        console.log('tour deleted');
        res.status(200).json(
            {
                status:'succes',
                data: {
                    tour: deletedTour
                }
            }
        );
    } catch (error) {
        res.status(400)
        .json({
            status:'fail',
            message: error
        });
    }
};

exports.getTourStats= async(req, res)=>{
	try {

        //agregate is a pomise that returns an agregatte object so we need to await
		const stats= await Tour.aggregate([
            {
                $match: { 
									ratingsAverage: {$gte:4.5}
								}
            },
            {
                $group: { 
                    //_id: null,//null means will work the entire collection
                    //_id: '$difficulty',//will group by this difficulty category (easy, medium, difficult)
                    _id:{$toUpper: '$difficulty'} ,//will upercase the text EASY, ...
                    numTours: {$sum: 1},//sum: 1 means that for each doc, 1 will be added to numTours
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg : '$price'},
                    minPrice: {$min:'$price'},
                    maxPrice: {$max:'$price'}
                 },								 
            },
						{
							//this stage works based on the result(fieldNames) of the previous stages                 
							$sort: {
								avgPrice: 1  
							}//1 means ascending
						},
						//we can repeat stages over the results, in this case $ne means not equal
						/*{
							$match: {_id: {$ne:'EASY'}}
						}*/
			
		]);	
        
        res.status(200).json(
            {
                status:'succes',
                data: {
                    stats: stats
                }
            }
        );
	} catch (error) {
		res.status(400)
					.json({
							status:'fail',
							message: error
					});
	}

};

exports.getMonthlyPlan= async(req, res)=>{
	try {//this function get the month with more tours in that month in a specific year
		const year= req.params.year*1;//2021

		const plan=  await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
			{
				$match: {
					startDates: {//to limit our scope of that year we will start from january 1, till december 31
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)
					}

				}
			},
			{
				$group: {
					_id: {$month: '$startDates'},
					numTourStarts: {$sum: 1},
					tours: {$push: '$name'}//create an array with the names of eah occur
				}
			},
			{
				$addFields: {
					month: '$_id'//creates another field with a copy if the current id just to label
				}
			},
			{//project is to remove fields 0 means hide
				$project: {_id:0}
			},
			{//sort by the month that has more tours on that month in- 1 descending way
				$sort:{numTourStarts:-1}				
			},
			{
				$limit: 12
			}
			
		]);	
        
        res.status(200).json(
            {
                status:'success',
                data: {
                    stats: plan
                }
            }
        );
	} catch (error) {
		res.status(400)
					.json({
							status:'fail',
							message: error
					});
	}

};



