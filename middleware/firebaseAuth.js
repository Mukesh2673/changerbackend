const admin = require('../config/firebase-config');
const {User} = require("../models");

class FirebaseAuthMiddleware {
    async decodeToken(req, res, next) {

        if (!req.user) {
            if (!!req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];

                if (!!token) {
                    try {
                        const firebaseUser = await admin.auth().verifyIdToken(token);
                        if (firebaseUser) {
                            req.user = await User.findOne({uid: firebaseUser.uid});
                        }
                    } catch (e) { }
                }
            }
        }

        return next();
    }

    authCheck(req, res, next) {
        if (!req.user) {
            return res.status(403).send("Access denied.");
        }

        return next();
    }
}

module.exports = new FirebaseAuthMiddleware();
