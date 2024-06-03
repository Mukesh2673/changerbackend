const {CognitoUserPool, CognitoUser}=require('amazon-cognito-identity-js')

/**
 * Confirm the signup action
 * @param {*} poolData
 * @param {{username, confirmationCode}} body
 * @param {*} callback
 */

const signupConfirm = (poolData, body, callback) => {
  const userPool = new CognitoUserPool(poolData);

  const { username, confirmationCode } = body;

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);
  cognitoUser.confirmRegistration(confirmationCode, true, (err, res) =>
  callback(err, res)
  );
};
module.exports=signupConfirm;
