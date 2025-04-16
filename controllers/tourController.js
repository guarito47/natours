const Tour = require('../models/tourModels');
const APIFeatures= require('../utils/apiFeatures');

exports.aliasTopTours=(req, res, next)=>{
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	//console.log('alias top cheap');
	//console.log(req.query);
	next();
};



exports.getAllTours= async(req, res)=>{
    
    try{        			
       
    //EXECUTE THE QUERY
		const features= new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate()
		//const tours = await queryDBFields;
		const tours = await features.mongoQueryObj;
		//SEND THE RESPONSE
		
    res
    .status(200)
    .json({
        status:'success',
    
        results: tours.length,
        data: {
            tours: tours
        }
    });
    } catch(err){
        res
        .status(404)
        .json({
            status:'fail',        
            message:err
        });
    }    
};

exports.getTour= async(req, res)=>{
    
    try{
        //Tour.findOne({_id: req.params.id})
        const tourFinded= await Tour.findById(req.params.id);
        res.status(200).json(
            {
                status:'success azure update v2',
                data: {
                    tourFinded
                }
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
    //this is the old way to create new row/document in the db
    //const newTour= new Tour({sampleDataHere});
    //newTour.save();

    try{
    //newest way to create/store new row/document in the db
    //directly calling a method from the model squema, while the older way
    //creates an instance and as a document object uses the method save to do the exact task 
    //intead to use the then() to get the result obj we upgrate to async function
    //so we can use await to get the result in a more secuence running way
    const newTour=  await Tour.create(req.body);

    res
    .status(201)
    .json(
        {
            status:'success',
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



