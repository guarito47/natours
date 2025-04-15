module.exports= (err, req, res, next)=>{
  //to assing status code number just in case if we dont have predefined one (replace if)
  err.statusCode= err.statusCode || 500;
  //to assing status text related just in case if we dont have predefined one 
  err.status= err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};