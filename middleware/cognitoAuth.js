const jwt = require("jsonwebtoken");
const jwkToPem = require('jwk-to-pem');
const Axios=require('axios')
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env["AWS_REGION"] });
const cognitoPoolId=process.env["AWS_COGNITOPOOL_ID"]

//const cognitoPoolId = "us-east-2_ZgoWAopWn";
const cognitoIssuer = `https://cognito-idp.us-east-2.amazonaws.com/${cognitoPoolId}`;
let cacheKeys
const getPublicKeys = async () => {
    if (!cacheKeys) {
      const url = `${cognitoIssuer}/.well-known/jwks.json`;
      const publicKeys = await Axios.default.get(url);
      cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
        const pem = jwkToPem(current);
        agg[current.kid] = { instance: current, pem };
        return agg;
      });
      return cacheKeys;
    } else {
      return cacheKeys;
    }
  };
const getJwkByKid = async (kid)=> {
    const keys = await getPublicKeys();
    const publicKey = keys[kid];
  
    // if the public key is missing reload cache and try one more time
    // https://forums.aws.amazon.com/message.jspa?messageID=747599
    if (!publicKey) {
      cacheKeys = undefined;
      const keys2 = await getPublicKeys();
      const publicKey2 = keys2[kid];
      if (!publicKey2) {
        return null;
      }
      return publicKey2.instance;
    }
    return publicKey.instance;
  }
exports.validateCognitoToken = async (authToken1) => {
    try {
      const jwtDecoded = jwt.decode(authToken1, { complete: true });
      const jwk = await getJwkByKid(jwtDecoded.header.kid);
      if (jwk === null) {
        throw new Error("unable to validate token");
      }
      const pem = jwkToPem(jwk);
      return new Promise((resolve, reject) => {       
        try {        
          let data=jwt.verify(authToken1, pem, { algorithms: ['RS256'] }, (err, decoded) => {  
            return decoded
    1      });
          resolve(data);
        } catch (err) {
          console.log("erroris", err);
          reject(err)
        }
      });
    } catch (error) {
     return error
    }
  };
