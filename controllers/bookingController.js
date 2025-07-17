//to have the object already setup with secret key send this as parameter in the require
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const { model } = require('mongoose');
/**
 * stripe works as follow, 
 * A. client side with their public stripe key send a request to pay a tour, 
 * B. server recieve the request and creates a stripe session and send back to client, 
 * C. client redirects to stripe checkout page,(stripe pages/server) so we dont process any payment info in our server,
 * D. client pays the tour, and stripe redirects to our server with the payment info so we can process the booking,
 */
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session // npm i stripe
  // (B) till here we receive the request from the client (A) now we prepare the info to request the session
  // like the amount, currency, and the success and cancel urls
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // we accept card payments
    //no secure way, exposing the url for create bookings without confirm payment
    //success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, // we redirect home after success
    success_url: `${req.protocol}://${req.get('host')}/my-tours/`, // we redirect to my-tours page
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // we redirect to tourId page after cancel
    customer_email: req.user.email, // we send the user email to stripe
    client_reference_id: req.params.tourId, // we send the tourId to stripe
    mode: 'payment', // we set the mode to payment
    line_items: [//this is an array of items to pay, in this case just one tour
      {
        price_data: { // we send the price data to stripe
          product_data: { // we send the product data to stripe
            name: `${tour.name} Tour`, // we send the tour name to stripe
            description: tour.summary, // we send the tour summary to stripe
            //a sample of a image of the product, we will use a static image for testing because nee to be on the web
            //images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`], // we send the tour cover image to stripe
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`], // we send the tour cover image to stripe
          },
          unit_amount: tour.price * 100, // we send the tour price to stripe in cents
          currency: 'usd', // we set the currency to usd
        },
        quantity: 1 // we set the quantity to 1
      }
    ]
  });  
  // 3) Create session and response
  res.status(200).json({
    status: 'success',
    session // we send the session to the client
  });
});

//NON SECURE WAY middleware to save in DB the tour purchased
/*exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary, because it's an unprotected route, means if someone knows this route
  // anyone can create a booking without paying, so we will remove this later
  const { tour, user, price } = req.query;  
// If there is no tour, user or price, we do want to create a booking just want to go overview page
  //because without that parameters the url look just 127.0.0.1:3000/ and that is the overview page
// so that why we call next that in the rout is the middleware is loggedIn
  if (!tour || !user || !price) return next();

  // in we reach here, we are pretty sure that we want to create a booking
  await Booking.create({ tour, user, price });

  // if we do next directly we will go to the next middleware that is the authController.isLoggedIn
  // but with the tour user and prce in teh url, so for security we will rem,ove those and only redirect to 
  // the initial page that is overview page, and to do that we use the redirect method , 
  // that will create another new fresh request without the query parameters
  //res.redirect(req.protocol + '://' + req.get('host') + '/');//IA suggestion
  res.redirect(req.originalUrl.split('?')[0]); // this will remove the query parameters from the url
});*/

const createBookingCheckout= async (session) =>{
  console.log('joins createBookingCheckout');
  const tour = session.client_reference_id; //as we store in that variable the tour id in getCheckoutSession
  const user = (User.findOne({email: session.customer_email})).id;
  const price = session.amount_total/1000;
  console.log(tour, user, price);
  await Booking.create({ tour, user, price });
  console.log('after cresting booking');
};


//this will be called from the global route 'webhook-checkout' in app.js that calls controller.webhookCheckout
exports.webhookChekout = (req, res, next)=>{
  console.log('join webhookCheckout')
  const signature = req.headers['stripe-signature'];
  console.log("req.headers['stripe-signature']");
  console.log(req.headers['stripe-signature']);
  let event;
  try {
      event = stripe.webhooks.constructEvent(
      req.body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET
    );  
  } catch (error) {
    return res.status(400).send(`webhook error: ${err.message}`)
  }
  console.log("event.type");
  console.log(event.type);

  if(event.type ==='checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({received: true});

};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
