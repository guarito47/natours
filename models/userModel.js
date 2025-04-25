/**
 * @file userModel.js
 * @description creates the mongo document schema to modeling a User 
 * and their functions for passwords handling
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

/**
 * User schema fore mongo db, 
 * @param {string} name name of the user
 * @param {string} email the user email
 * @param {string} photo the user photo system path
 * @param {string} password the user photo system path
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this only works on create and save!!
      validator: function(el){
        return el===this.password;
      },
      message: 'Passwords doesnt match!'
    }

  },
  passwordChangedAt: Date,

});
/**
* a mongo middleware that triggers a pre saving function where we are encrypting the passwords
* @param {string} save the built in mongo operation to call on pre statement 
* @param {Object} next the global object to continue the next middleware
*/
userSchema.pre('save', async function(next){
  
  if(!this.isModified('password')) return next();

  //if skip the if, that means that is saving for the first time,
  this.password = await bcrypt.hash(this.password, 12);
  //we will avoid to save password confirm, because is only for comparing porpuses, 
  // even if it appears in the model we can skip to save just by giving undefined
  this.passwordConfirm = undefined;
  next();
   
});

/**
 * this function creates a Json Web Token with given user Id and Secret for token creation
 * @param {string} candidatePsw the plain text user password from client browser
 * @param {string} userPsw the encrypted DB user password to decrypt to compare
 * @returns {boolean} if candidatePsw and userPsw are equal
 */
userSchema.methods.correctPassword = async function(candidatePsw, userPsw){
  
  return await bcrypt.compare(candidatePsw, userPsw)
}

/**
 * verify if a given Jwt token date was issued before a password change to attemp
 * given access by a expired token by password change
 * @param {string} JWTTimestamp the plain text user password from client browser
 * @returns {boolean} if token date was issued after the last password change
 */
userSchema.methods.changedPswAfter = function (JWTTimestamp){
  //if the password existr means that was updated at least one
  
  if(this.passwordChangedAt){
    
    const changedTimeStamp =parseInt( this.passwordChangedAt.getTime()/1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;