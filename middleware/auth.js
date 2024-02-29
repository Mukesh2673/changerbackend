//https://gist.github.com/fourgates/92dc769468497863168417c3524e24dd
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const cognitoIssuer = `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_ZgoWAopWn`;
const {validateCognitoToken}=require("./cognitoAuth")
const   validateToken = async (req, res, next) => {
  try {

    if (!req.headers.authorization) {
      const respData = {
        success: false,
        message: "No Authorization Token",
      };
  
      return res.status(403).json(respData);
    }
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    let decoded=await validateCognitoToken(accessToken)
    if(!decoded && decoded?.token_use !== 'access' || decoded?.iss !== cognitoIssuer  ) {
      let respData = {
        success: false,
        message: "Invalid Access Token",
      };
      return res.status(401).json(respData);  
    }
    next();
  } catch (error) {
    console.log(error);
    let respData = {
      success: false,
      message: "Invalid Access Token",
    };
    return res.status(401).json(respData);
  }
};

module.exports = { validateToken };
