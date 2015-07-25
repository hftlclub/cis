var jwt = require('jwt-simple');
var config = require('../config');
var userservice = require('../services/userservice');
var jwtblacklist = require('../modules/jwtblacklist');

module.exports = function(req, res, next) {
    var token = req.headers['x-access-token'];

    //error if no token set
    if (!token) {
        return next();
    }

    //error if token is blacklisted
    if (jwtblacklist.find(token)) {
        res.send('Access token has been invalidated', 400);
    }

    try {
        var decoded = jwt.decode(token, config.tokensecret);

        if (decoded.exp <= Date.now()) {
            res.send('Access token has expired', 400);
        }

        userservice.getUserByUid(decoded.uid, function(err, user) {
            if (err || !user) {
                return next();
            }

            req.user = user;
            return next();
        });

    } catch (err) {
        return next();
    }
}
