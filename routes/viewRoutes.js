const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
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
router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);
module.exports = router;