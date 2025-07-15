const mongoose = require('mongoose');
//const Tour = require('./tourModel');
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key

const bookingSchema = new mongoose.Schema({
    tour: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Tour', 
      required: [true, 'Booking must belong to a tour']      
    },
    user: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'User', 
      required: [true, 'Booking must belong to a user'] 
    },    
    price: { 
      type: Number, 
      required: [true, 'Booking must have a price'] 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    paid: { 
      type: Boolean, 
      default: true 
    }
    //stripeSessionId: { type: String, required: true }
  });

  //this query middleware will populate the user and tour fields in the booking document
  bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({path: 'tour', select: 'name'});
    next();
  });
      
    

  const Booking = mongoose.model('Booking', bookingSchema);
  module.exports = Booking;