/**
 * @file tourController.js
 * @description handle tour CRUD operations, also retrieve tours by given filters
 * and generate report info
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');
//const APIFeatures= require('../utils/apiFeatures');
const AppError = require('../utils/appError');

/**
 * give the top 5 tours with highest rating and ordered by price from mongo DB
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.aliasTopTours=(req, res, next)=>{
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

/**
 * retrieve all the tours in the mongo DB
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getAllTours= factory.getAll(Tour);
// code bellow is before using handlerfactory
/*
exports.getAllTours= catchAsync( async(req, res, next)=>{              			
       
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
});
*/

/**
 * retrieve a specific tour by their id from mongo DB
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getTour = factory.getOne(Tour, {path:'reviews'});
// code bellow is before using handlerfactory
/*
exports.getTour = catchAsync( async(req, res, next)=>{
    //Tour.findOne({_id: req.params.id})        
    //we use the populate method to get the reviews info in the output, 
    // as we have the reference as virtual field
    const tourFinded= await Tour.findById(req.params.id).populate('reviews');
    //we will move this populate method to their proper tour model midleware funtion
    
    //.populate({
    //    path:'guides', 
    //    select:'-__v -passwordChangedAt -passwordResetToken -passwordResetExpires -active'});
    //we will handle the case that theres no tour means null    
    if(!tourFinded){
        return next(new AppError('theres no tour with that id', 404));
    }
    res.status(200).json(
        {
            status:'success',
            data: {
                tour: tourFinded
            }
        }
    );        
});
*/
/**
 * creates a new tour in the mongo db
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.createTour= factory.createOne(Tour);
// code bellow is before using handlerfactory
/*
exports.createTour= catchAsync( async(req, res, next)=>{
    
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
});
*/
/**
 * updates a existing tour in the mongo db
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.updateTour= factory.updateOne(Tour);
//code bellow is the after using handlerfactory
/*
exports.updateTour= catchAsync( async (req, res, next)=>{    
        // some options to add are 
        const updatedTour= await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new:true,//to return the updated document
            runValidators:true //this allows to run max length, min length
        } );

        if(!updatedTour){
            return next(new AppError('theres no tour with that id', 404));
        }
        res.status(200).json(
            {
                status:'success',
                data: {
                    tour: updatedTour
                }
            }
        );  
});
*/
/**
 * deletes a tour by their id in the mongo db
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
//instead to use a specific function for each crud operation fo each model we use a global function
// and we pass the model as a parameter 
exports.deleteTour= factory.deleteOne(Tour);
// function after using handlerfactory 
/*exports.deleteTour= catchAsync( async(req, res, next)=>{     
        // some options to add are 
        const deletedTour= await Tour.findByIdAndDelete(req.params.id);
        //console.log('tour deleted');
        if(!deletedTour){
            return next(new AppError('theres no tour with that id', 404));
        }
        
        res.status(200).json(
            {
                status:'success',
                data: {
                    tour: deletedTour
                }
            }
        );    
});
*/


/**
 * categorize the current tours by their difficulty , with average for each category
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getTourStats= catchAsync(async(req, res, next)=>{	
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
                status:'success',
                data: {
                    stats: stats
                }
            }
        );
});

/**
 * report the month with more tours by month in a specific year
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getMonthlyPlan= catchAsync( async(req, res, next)=>{
	//this function get the month with more tours in that month in a specific year
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
});

// /tours-within/:distance/center/:latlng/unit/:unit
// //tours-within/233/center/40.712856,-74.006056/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    // Extract parameters from the url by deconstructing the req.params object
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');//to get the latitude and longitude from the latlng string

    // Convert distance to radians as mongoDB uses radians for geo queries
    // 1 mile = 3963.2 miles radius of the earth and 1 km = 6378.1 km radius of the earth
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    //lets make sure that lat and lng are in the correct formad separated by coma
    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    //console.log(`Searching for tours within ${distance} ${unit} of point (${lat}, ${lng}) with radius ${radius} radians.`);
    // Find tours within the specified distance
    
    const tours = await Tour.find({
        //startLocation is the point that we want to search around
        //the $geoWithin operator will find all the documents that are within the $centerSphere (coordinates)
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});



exports.getDistances = catchAsync(async (req, res, next) => {
    // Extract parameters from the url by deconstructing the req.params object
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Convert lat and lng to numbers
    const latitude = +lat;
    const longitude = +lng;

    // Find distances from the specified point
    const distances = await Tour.aggregate([
        {//for all mongoDB aggregation pipelines that uses geospatial queries, 
        // this stage must be the first one in the pipeline always
            $geoNear: {// uses a geospacial index field in our case we have already startLocation field indexed as 2dsphere
                // so automatically geoNear will use that index, if theres many of those we need to use keys parameters
                near: {
                    type: 'Point',
                    coordinates: [longitude, latitude] // Note: MongoDB uses [lng, lat]
                },
                distanceField: 'distance',
                spherical: true,
                // Convert distance to the specified unit miles or kilometers
                distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001 // 1 meter to miles or kilometers
            }
        },//till this tage we have the arrays of tours with a extra field on it, that we call 'distance' 
        // 'distance' has the distance from their own startLocation to the specified coordinates in the url
        {//this stage only keep the data that we are interestd to look, and removes the rest of the fields
            $project: {
                name: 1,
                distance: 1
            }
        } 
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            distances
        }
    });
});
