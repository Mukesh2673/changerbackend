
const validateSignupRequest= require('./validateSignupRequest');
const validateSignupConfirmRequest =require('./validateSignupConfirmRequest');
const validateSigninRequest =require('./validateSigninRequest');
const validateAdvocate = require('./validationAdvocate')
module.exports=  {
  validateAdvocate,
  validateSignupRequest,
  validateSignupConfirmRequest,
  validateSigninRequest,
};
