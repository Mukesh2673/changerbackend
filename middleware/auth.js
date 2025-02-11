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

const validateToken = async (req, res, next) => {
  try {

    if (!req.headers.authorization) {
      const respData = {
        status: 403,
        success: false,
        message:  res.__("NO_AUTHORIZATION"),
      };
  
      return res.status(403).json(respData);
    }
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    let decoded=await validateCognitoToken(accessToken)
    req.body.decoded=decoded;
    const user = await User.findOne({cognitoUsername:decoded.username});
    if (!user)
    {
      let respData = {
        success: false,
        message: res.__("USER_NOT_FOUND_IN_TOKEN"),
        status: 400
      };
      return res.status(400).json(respData);
    }
     if (
      (!decoded || decoded.token_use !== 'access' || decoded.iss !== cognitoIssuer) ||
      !user
    ) {
      let respData = {
        success: false,
        message: res.__("INVALID_ACCESS_TOKEN"),
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
      message:  res.__("INVALID_ACCESS_TOKEN"),
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
        message: res.__("ACTION_TOKEN_RETERIVED"),
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken || refreshToken, // Use the old refresh token if a new one isn't provided
        sucess:true
      });
      } else {
      res.status(400).json({ error:  res.__("INVALID_ACCESS_TOKEN"), success: false });
    }
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    res.status(500).json({ error: 'Error refreshing tokens' });
  }
};

const cognitoUserDetails=async (req, res, next)=>{
  try {

    if (!req.headers.authorization) {
      const respData = {
        status: 403,
        success: false,
        message: res.__("NO_AUTHORIZATION"),
      };
  
      return res.status(403).json(respData);
    }
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    let decoded=await validateCognitoToken(accessToken)
    if (
      (!decoded || decoded.token_use !== 'access' || decoded.iss !== cognitoIssuer)) 
      {
      let respData = {
        success: false,
        message: res.__("INVALID_ACCESS_TOKEN"),
        status: 401
      };
      return res.status(401).json(respData);
     } 
    
    //const user = await User.findOne({cognitoUsername:decoded.username});
    let respData = {
      success: false,
      message: res.__("COGNITO_USER_RECORDS_RETRIEVED"),
      data: decoded,
      status: 200
    };
    return res.status(401).json(respData);;
  } catch (error) {
    console.log(error);
    let respData = {
      success: false,
      message: res.__("INVALID_ACCESS_TOKEN"),
      error:error.name,
      status:401
    };
    return res.status(401).json(respData);
  }
};

//get user Info by not require token middleware
const userInfoToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      console.log("ahiasdfasfd")
      next();
      return

    }
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    let decoded=await validateCognitoToken(accessToken)
    req.body.decoded=decoded;
    const user = await User.findOne({cognitoUsername:decoded.username});
    if (!user)
    {
      let respData = {
        success: false,
        message: res.__("USER_NOT_FOUND_IN_TOKEN"),
        status: 400
      };
      return res.status(400).json(respData);
    }
     if (
      (!decoded || decoded.token_use !== 'access' || decoded.iss !== cognitoIssuer) ||
      !user
    ) {
      let respData = {
        success: false,
        message: res.__("INVALID_ACCESS_TOKEN"),
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
      message:  res.__("INVALID_ACCESS_TOKEN"),
      error:error.name,
      status:401
    };
    return res.status(401).json(respData);
  }
};

module.exports = { validateToken, accessToken, cognitoUserDetails, userInfoToken };