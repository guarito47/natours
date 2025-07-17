const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect); // this will run for all the routes in this file that need a session
//this receive a request to pay and book a tour
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
// from here with this middleware, we only have this options for admins, and lead guides the control 
// of watch, create, update the bookings of a users, by example when pay in cash we need to create 
// the booking manually
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
