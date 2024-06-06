
const validateSignupRequest= require('./validateSignupRequest');
const validateSignupConfirmRequest =require('./validateSignupConfirmRequest');
const validateSigninRequest =require('./validateSigninRequest');
const validateAdvocate = require('./validationAdvocate')
const validateSignPetitions=require("./validateSignedPetitions")
const validateBookMarks=require("./validateBookMarks")
const validateCampaignImpact= require('./validateCampaignImpact')
module.exports=  {
  validateCampaignImpact,
  validateAdvocate,
  validateSignupRequest,
  validateSignupConfirmRequest,
  validateSigninRequest,
  validateBookMarks,
  validateSignPetitions
};
