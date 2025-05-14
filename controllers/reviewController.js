const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {

  // To allow for nested GET reviews on tour (hack)
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {

  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
/*
exports.deleteReview= catchAsync( async(req, res, next)=>{     
        // some options to add are 
        console.log('join delete review 2');
        const deletedReview= await Review.findByIdAndDelete(req.params.id).then(
            (doc)=>{
                console.log('deleted review', doc);
                return doc;
            }
        );
        
        console.log('review deleted');
        if(!deletedReview){
            return next(new AppError('theres no review with that id', 404));
        }
        
        res.status(200).json(
            {
                status:'success',
                data: {
                    tour: deletedReview
                }
            }
        );    
});
*/
exports.deleteReview = factory.deleteOne(Review);
/*
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);

*/