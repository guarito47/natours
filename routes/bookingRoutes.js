const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect); // this will run for all the routes in this file that need a session

router.get('/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);
// will run from routes above this line for thsi routes
router.use(authController.restrictTo('admin', 'lead-guide')); 

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
