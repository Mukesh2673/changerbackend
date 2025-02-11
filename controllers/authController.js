const  CognitoIdentity =require('../services/cognito');
const CognitoIdentityService = CognitoIdentity();

const signup = async (req, res) => {
  const { email, password} = req.body;
  const cognitoParams = {
    Username: email,
    Password: password ,
  };
  try {
    const cognitoUser = await new Promise((resolve, reject) => {
      CognitoIdentityService.signup(cognitoParams, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });

    res.status(200).send({
      success: true,
      message: `${res.__("CONFIRMATION_CODE")} ${email}`,
      user: cognitoUser,
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message, error });
  }
};

const signupConfirm = async (req, res) => {
  const { email, code } = req.body;
  const cognitoParams = {
    username: email,
    confirmationCode: code,
  };
  try {
    await new Promise((resolve, reject) => {
      CognitoIdentityService.signupConfirm(cognitoParams, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
    res.status(200).send({
      success: true,
      message: res.__("EMAIL_CONFIRMED"),
      user: {
        user_confirmed: true,
      },
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message, error });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const cognitoParams = {
    username: email,
    password,
  };

  try {
    const cognitoUser = await new Promise((resolve, reject) => {
      CognitoIdentityService.signin(cognitoParams, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
    res.status(200).send({
      success: true,
      message:  res.__("USER_LOGIN"),
      user: cognitoUser,
    });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message, error });
  }
};

module.exports= {signin, signup,signupConfirm};
