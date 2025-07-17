const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router= express.Router();

/* this was just a test to render a template
router.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'cachirulo',
  });
});*/

//by putting first this use this is looged is is like we put that function in every route, so to avoid
//to rewrite the same for all the routes we set as use, note that if theres above more routes that dont have this 
//function in there
//but we will remove that because we have a '/me' that need to verify that only logged users can access
//so we have duplicate validation for '/me', authControler.isloggedin and authControler.protect
//so to avoid we will back and separate to treat each case individually
//router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug',authController.isLoggedIn, viewsController.getTour);
router.get('/login',authController.isLoggedIn, viewsController.getLogin);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', 
  //bookingController.createBookingCheckout,  //non secure way
  authController.protect, 
  viewsController.getMyTours);
router.post('/submit-user-data',authController.protect, viewsController.updateUserData);


module.exports = router;