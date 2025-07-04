const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');
//const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');


exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;//getting from protect middleware
  next();
};

exports.getAllReviews = factory.getAll(Review);
/*
//works for get all the reviews and also for getting all the reviews of a specific tour
exports.getAllReviews = catchAsync(async (req, res, next) => {
  // will keep empty if we want to get all reviews
  let filter = {};
  // if the request has a tourId in the params, we will filter the reviews by that tourId
  // if theres tourid then filter will have a a tour id just to filter that specific tour reviews
  if (req.params.tourId) 
    filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});
*/


exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

//the code below if before we used the handler factory methods, and because this particular one 
// need to grab tourId and UserID, we will take out this steps and move to an middleware that we will
//call in the riview router before calling createOne, so we will have the same functionality using handlrefactory
/*
exports.createReview = catchAsync(async (req, res, next) => {
//we will apply 2 ways to get the tour Id, first from body payload and second from the URL params  
//in case there no tour Id in the payload we will use the tourId from the URL params same for User Id
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;//getting from protect middleware

  const newReview = await Review.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
*/

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
