const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const Bookings = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

exports.alerts=  (req, res, next)=>{
  const {alert}= req.query; //this will grab the alert parameter from the url
  if(alert==='booking')
    res.locals.alert = "Your booking was successful, please check your email for a confirmation. If your booking doesn't shop up here inmediatly, please come back later"; 
  next();
};

exports.getOverview= catchAsync(async (req, res, next) => {
  // 1 gest all tours from DB
  const tours = await Tour.find();
  // 2 build template
  // 3 render that template using the data from 1
  res.status(200).render('overview', {
    tittle: 'All Tours',
    tours
  });
});

exports.getTour= catchAsync( async(req, res, next) => {
  // 1 get the data from the tour finding by the slug url and also pupulate the reviews
  const tour= await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user photo'
  });
  // 2 build template
  // 3 render template using the data from 1
  if(!tour){
    return next(new appError("There's no tour with that name.", 404));
  }

  res
  .status(200)
  .render('tour', {
    tittle: `${tour.name} Tour`,
    tour
  });
});

//if theres no third resources to request no need "async/await" and by this case no need "next"
exports.getLogin = (req, res)=>{
  res.status(200)
  .render('login', {
    title: 'LOg into your Account'
  });
};


exports.getAccount = (req, res)=>{
  //as same of login no need to query the DB because this is only for logged users 
  //so the user info is already in res.locals.user, so we need to render the page with that user info
  res.status(200)
  .render('account', {
    title: 'Your acoount'
  });
};

exports.getMyTours = catchAsync(async(req, res, next)=>{
  //1 get all tours that the user booked
  const bookings = await Bookings.find({ user: req.user.id });
  //2 get the tours from the bookings, map will create another array based on the callback function
  //that we pass to it, in this case we want to get the tour id from each booking 'el.tour' in fact is the id
  const tourIds = bookings.map(el => el.tour);
  //we cant use findById because we have an array of ids, so we use find with the $in operator inside
  //what means find by the id field whay we have in the tourIds array
  const tours = await Tour.find({ _id: { $in: tourIds } });

  //3 render the my-tours page with the tours that we found
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(async(req, res, next)=>{
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    //req.body is the url ecoded that we enable to read when its html request, calling with the
    //property name that we specify in the html, this case name, and email
    name: req.body.name,
    email: req.body.email
  }, {
    new: true, //tell mongo that we want as response the updated document
    runValidators: true
  });

  //after execute and successfully recive the updated user , we need to render the account page again
  //but with the actual info, so we need to update the user that is stored in protect and isLoggedIn mdlwr
  res.status(200)
    .render('account', {
    title: 'Your acoount',
    //we also need to send the updated user because the template account grab the info from thi user
    // that we are sending here, also will be updated in our global res, and re users
    user: updatedUser
  });
  //the bad thing with this html request is when occours an error and we show the proper error page
  // the url still keep the origin url this case ../submit-order-data and not a error url page
});