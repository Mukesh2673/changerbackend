
const validateSignupRequest= require('./validateSignupRequest');
const validateSignupConfirmRequest =require('./validateSignupConfirmRequest');
const validateSigninRequest =require('./validateSigninRequest');
const validateAdvocate = require('./advocate/validationAdvocate')
const validateSignPetitions=require("./validateSignedPetitions")
const validateBookMarks=require("./validateBookMarks")
const validateCampaignImpact= require('./campaign/validateCampaignImpact')
const ValidateCampaign=require('./campaign/validateCampaign')
const validateReport= require('./validateReport')
const validateCampaignMessages= require('./campaign/validateMessages')
const validateVolunteering = require('./campaign/volunteering')
const validateCampaignId= require('./campaign/validateCampaignId')
const validateAdvocateId= require('./advocate/validateAdvocateId')
const validateDonation = require('./campaign/validateDonation')
const validateIssue=require('./issue/validateIssue')
const validateIssueId= require('./issue/validateIssueId')
const validateIssueMessages = require('./issue/validateMessages')
const validateUpdateIssue = require('./issue/validateUpdateIssue')
module.exports=  {
  validation: {
    validateIssueId,
    validateSignupRequest,
    validateSignupConfirmRequest,
    validateSigninRequest,
    validateAdvocate,
    validateSignPetitions,
    validateBookMarks,
    validateCampaignImpact,
    ValidateCampaign,
    validateReport,
    validateCampaignMessages,
    validateVolunteering,
    validateCampaignId,
    validateAdvocateId,
    validateDonation,
    validateIssue,
    validateIssueId,
    validateIssueMessages,
    validateUpdateIssue
  }
};
