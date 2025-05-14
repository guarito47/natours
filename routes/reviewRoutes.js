const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//as review routes are a child of tour routes in order to pull the tour id from the url 
//we need to merge the params of the parent route with the child route
//so we can use the tour id in the review routes
//this is done by passing the option { mergeParams: true } to the express.Router() method
const router = express.Router({ mergeParams: true });

//router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    //reviewController.setTourUserIds,
    reviewController.createReview
  );

router.route('/:id').delete(reviewController.deleteReview);
  //.get(reviewController.getReview)
  //.patch(
    //authController.restrictTo('user', 'admin'),
    //reviewController.updateReview
  //)
  
    //authController.restrictTo('user', 'admin'),
    

module.exports = router;
