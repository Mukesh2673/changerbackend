const AWS = require('aws-sdk');
AWS.config.update({
  region:  process.env["AWS_REGION"], // e.g., 'us-west-2'
  secretAccessKey: process.env["AWS_SECRET_KEY"],
  accessKeyId: process.env["AWS_ACCESS_KEY"],
});

const cognitoISP = new AWS.CognitoIdentityServiceProvider();
const cognitoIssuer = `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_ZgoWAopWn`;
const {validateCognitoToken}=require("./cognitoAuth")
const { User} = require("../models");

const   validateToken = async (req, res, next) => {
  try {

    if (!req.headers.authorization) {
      const respData = {
        status: 403,
        success: false,
        message: "No Authorization Token",
      };
  
      return res.status(403).json(respData);
    }
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    let decoded=await validateCognitoToken(accessToken)
    req.body.decoded=decoded;
    const user = await User.findOne({cognitoUsername:decoded.username});
    if (
      (!decoded || decoded.token_use !== 'access' || decoded.iss !== cognitoIssuer) ||
      !user
    ) {
      let respData = {
        success: false,
        message: "Invalid Access Token",
        status: 401
      };
      return res.status(401).json(respData);
    }
    req.user=user._id
    next();
  } catch (error) {
    console.log(error);
    let respData = {
      success: false,
      message: "Invalid Access Token",
      error:error.name,
      status:401
    };
    return res.status(401).json(respData);
  }
};

const accessToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers.authorization.replace("Bearer ", "");
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.AWS_COGNITO_CLIENT_ID, // Your Cognito App Client ID
      AuthParameters: {
        'REFRESH_TOKEN': refreshToken, // The refresh token value
      },
    };
    const response = await cognitoISP.initiateAuth(params).promise();
    if (response && response.AuthenticationResult) {
      res.status(200).json({
        message:'Access token has been retrieved successfully',
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken || refreshToken, // Use the old refresh token if a new one isn't provided
        sucess:true
      });
      } else {
      res.status(400).json({ error: 'Invalid token response', success: false });
    }
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    res.status(500).json({ error: 'Error refreshing tokens' });
  }
};

module.exports = { validateToken, accessToken };