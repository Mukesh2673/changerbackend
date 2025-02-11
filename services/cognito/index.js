const CognitoItentityMethods =require('./methods');



const poolData = {
  UserPoolId: process.env.AWS_COGNITOPOOL_ID,
  ClientId: process.env.AWS_COGNITO_CLIENT_ID,
};

/**
 * @param {{UserPoolId, ClientId, Paranoia }}
 *  The @param Paranoia setting helps to prevent accidental deletion of user accounts or other critical settings.
 */

class CognitoIdentityService {
  constructor() {
    this.poolData = poolData;
  }

  signup(body, callback) {
    return CognitoItentityMethods.signup(this.poolData, body, callback);
  }

  signupConfirm(body, callback) {
    return CognitoItentityMethods.signupConfirm(this.poolData, body, callback);
  }

  signin(body, callback) {
    return CognitoItentityMethods.signin(this.poolData, body, callback);
  }
}

module.exports= function Wrapper() {
  return new CognitoIdentityService();
}
