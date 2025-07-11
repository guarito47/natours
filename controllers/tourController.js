/**
 * @file tourController.js
 * @description handle tour CRUD operations, also retrieve tours by given filters
 * and generate report info
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
// multer is a middleware for handling multipart/form-data used for uploading files
// so to update the user photo in our API not from raw json , but by form-data 
const multer = require('multer');
const sharp = require('sharp'); //sharp is a library to resize images
const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
//const APIFeatures= require('../utils/apiFeatures');
const AppError = require('../utils/appError');


// because diskStorage save in the disk but we are not taking care about the image resizing first,
// we will use memoryStorage to save the file in memory, so we can resize first and then save it to disk
// this is useful to avoid saving the original file to disk, and then resizing it
const multerStorage = multer.memoryStorage();

//this is to dont allow to upload files that arnot images, so we will use a filter
const multerFilter = (req, file, cb) => {
    //we will check if the file is an image, if not we will reject it
    if (file.mimetype.startsWith('image')) {
        //if the file is an image we will accept it
        cb(null, true);
    } else {
        //if the file is not an image we will reject it
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

//upload is the multer instance but with a specific configuration thanks to multerStorage and multerFilter
const upload = multer({
    storage: multerStorage, //set the storage to the multerStorage we created
    fileFilter: multerFilter //set the filter to the multerFilter we created
 });

//upload.single('photo'); for 1 single photo
//upload.array('images', 3); for multiple photos
//upload.fields(.. for mix of both, single and multiple photos
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 }, //maxCount is to limit the number of files to upload in this field
    { name: 'images', maxCount: 3 } //this time we limit to 3
]);


exports.resizeTourImages = catchAsync( async (req, res, next)=>{
    //console.log('resizeTourImages called');
    //console.log(req.files);
        /*
    [Object: null prototype] {
  imageCover: [
    {
      fieldname: 'imageCover',
      originalname: 'new-tour-1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 ...
    */
    //if theres no images files uploaded, then only want to update data and not images, so lets move to next()
    if (!req.files.imageCover || !req.files.images) return next();
    //1) Cover image
    //if exist images files then lets create a unique filename for the cover image,
    // based on the tour id that we have already in url as parameter and current timestamp
    //then we set a i n req a variable called imageCover (exact name as in our tour model) 
    //that updateTour by handlerFactory as updateOne will grab this field as filled parameter tu update
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;    
    //as you saw in console log imageCover is an array, so we take the first element
    await sharp(req.files.imageCover[0].buffer) //we will use the buffer of the imageCover file
            .resize(2000, 1333) //width, height
            .toFormat('jpeg') //we will save the image in jpeg format
            .jpeg({ quality: 90 }) //we will set the quality to 90% when compressed
            .toFile(`public/img/tours/${req.body.imageCover}`); //we will setup the file dest in the disk;    

    // 2) tour images

    req.body.images = [];//we prepare and declare as array a variable called images into req
    //this header of loop is not correct for calling multiple async/awaits, because it will not wait for 
    //the async function to finish, but will continue to the next iteration        
    //req.files.images.forEach( async(photo, i) => {
    //the solution is having a map collection, wrap into a Promise.all that will wait till all promises in the map
    //as executed successfull
    await Promise.all(
        req.files.images.map( async(photo, i) => {
            const photoFilename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

            //await sharp(req.files.images[i].buffer) //we will use the buffer of the imageCover file
            await sharp(photo.buffer) //this also can work as well the code above
                //we can use the photoFilename as the name of the file, so we can save
                .resize(2000, 1333) //width, height
                .toFormat('jpeg') //we will save the image in jpeg format
                .jpeg({ quality: 90 }) //we will set the quality to 90% when compressed
                .toFile(`public/img/tours/${photoFilename}`); //we will setup the file dest in the disk;

            req.body.images.push(photoFilename); //we push the filename to the images array
    }));

    console.log(req.body.images);
    next();
});
    


exports.aliasTopTours=(req, res, next)=>{
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours= factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {path:'reviews'});

exports.createTour= factory.createOne(Tour);

exports.updateTour= factory.updateOne(Tour);

//instead to use a specific function for each crud operation fo each model we use a global function
// and we pass the model as a parameter 
exports.deleteTour= factory.deleteOne(Tour);

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
