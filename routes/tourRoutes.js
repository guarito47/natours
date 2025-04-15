const express = require('express');
const tourController = require('../controllers/tourController');
const tourController4MySql = require('../controllers/tourController4Mysql');
//or using decontruction to get all the functions
//const {getAllTours, ..}
const toursRouter= express.Router();


//3, ROUTES
//old way to handle route
//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
//app.get('/api/v1/tours/:id',getTour );
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id',deleteTour);
//new way to handle routes

//toursRouter.param('id', tourController.checkId);

//to handle mask urls in this case top-5-cheap, that wants to show the 5 most rated and cheapest
// tours available, to do that we will set the url to /tours?limit=5&sort=-ratingsAverage,price
//-rating means descending(major to minor), price ascending (minor to major)
//to set this url we need a middleware we will call 

toursRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

toursRouter
    .route('/tour-stats')
    .get(tourController.getTourStats);
toursRouter
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

toursRouter
    .route('/')
    //.get(tourController.getAllTours)
    .get(tourController4MySql.getAllTours)
    .post(tourController.createTour);    

toursRouter
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports= toursRouter;