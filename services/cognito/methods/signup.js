  const { CognitoUserPool,CognitoUserAttribute, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
  const attributes = (key, value) => ({
    Name: key,
    Value: value,
  });
  
  /**
   * Signup user
   *
   * @param {poolData} poolData
   * @param {{ username: string, password: string, givenname: string, familyname: string, }} body
   * @param {*} callback
   */
  
  const signup = (poolData, body, callback) => {
    const userPool = new CognitoUserPool(poolData);
    const { Username, Password} = body;
    userPool.signUp(
      Username,
      Password,
      null,
      null,
      (err, res) => {
        if (err) {
          callback(err);
          return;
        }
        const data = {
          user_id: res.userSub,
          email: res.username,
          user_confirmed: res.userConfirmed,
        };  
        callback(null, data);
      }
    );
  };
  
  module.exports=  signup;
  