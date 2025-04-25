class AppError extends Error {

  constructor(message, statusCode){
    //why we dont use thi.message to  keep assigning, because we need to create the error object first
    //and we uase the constructor that at the same time recievces a messages so we do 2 tasks at  the same time
    super(message);
    this.statusCode=statusCode;
    //here converts the statuscode to string and compare if starts with code 4.. if yes is a fail 
    //if not that means is 5.. code then is a server error, so we sned error text
    this.status= `${statusCode}`.startsWith('4')?'fail':'error';
    //to handle as well operational errors, like dont send correct fields, programing errors, bugs
    //all the error that we can spect means made from our code, and this paramneter will bne used
    //at the time to show error details when its on development stage or in prodcution (less info)
    this.isOperational= true;
    //to assign the stackTrace (path and line of code where trigger de error)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports= AppError;