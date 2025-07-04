const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//as review routes are a child of tour routes in order to pull the tour id from the url 
//we need to merge the params of the parent route with the child route
//so we can use the tour id in the review routes
//this is done by passing the option { mergeParams: true } to the express.Router() method
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
//from this point all the methods are protected and require authentication
//setting the userRouter to use the authController.protect will achieve that functionality
//all the routes below this line will require authentication, 
//that why we removed the protect middleware from each route

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    //authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds, //this middleware will set the tour and user ids in the request body    
    reviewController.createReview
  );

router.route('/:id')
  .get(reviewController.getReview)
  .patch(//only user can edit their own review, admin can edit any review, but guides , would affect reputation
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

    

module.exports = router;
