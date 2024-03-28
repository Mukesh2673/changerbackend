const jwt = require("jsonwebtoken");
const jwkToPem = require('jwk-to-pem');
const Axios=require('axios')
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env["AWS_REGION"] });
const cognitoPoolId=process.env["AWS_COGNITOPOOL_ID"]
const jwks=require('../constants/ jwks')

let cacheKeys
const getPublicKeys = async () => {
    if (!cacheKeys) {
      //get jwks.json data by below url and save it to the jwks.json file
      //https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json
      const publicKeys=jwks.jwks
      cacheKeys = publicKeys.keys.reduce((agg, current) => {
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
            if(err)
            {
              reject(err)
            }
            return decoded

    1      });
          
          resolve(data);
        } catch (err) {
          reject(err)
        }
      });
    } catch (error) {
     return error
    }
  };
