const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

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
  //so the user info is already in res.locals.user, so we need to render the page with user info
  res.status(200)
  .render('account', {
    title: 'Your acoount'
  });
};