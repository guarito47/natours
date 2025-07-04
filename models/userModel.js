/**
 * @file userModel.js
 * @description creates the mongo document schema to modeling a User 
 * and their functions for passwords handling
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const crypto = require('crypto');
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  } 
});
/**
* a mongo middleware that triggers a pre saving function where we are encrypting the passwords
* before saving in the db, so we dont need to code outhere like a store procedure
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

//this middleware is execute before making save operation, we will validate is its a password saving operation
//if its the case we willl set password change at field calculated in our model and not in the code

userSchema.pre('save', function(next) {
  //if in the payload dont apeears the password and is not the new document creation we dont need to to nothing
  if (!this.isModified('password') || this.isNew) return next();
//but if appears a new password in the payload then we will save a new pasw
// so we need to set the passwordChangedAt as well, giving 1 sec delay to dont be in conflict with JWT creating date
  this.passwordChangedAt = Date.now() - 1000;
  next();
});


//to dont process users inactives (deleteds) we need to skip the ones that are inactive(false)
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  //this will filter first all inactive user NotEqual to false after any find operation 
  this.find({ active: { $ne: false } });
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


//the passwsord reset token is not a JWT token is a random string but at the same time need to be 
//cryptographically strong as the password hash se wi will use a simple random bytes function from
//the node js built-in crypto module
userSchema.methods.createPasswordResetToken = function() {
  //32 is the  number of characters, and 'hex' to convert to an hex to be letters numbers special characters
  const resetToken = crypto.randomBytes(32).toString('hex');
  //now we encrypt the random string
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  //we are giving 10 mins to change their password number min x sec x milisec to sec
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //IMPORTANT: we are sending unincrypted token bye email, the encrypted version is only for the DB 
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;