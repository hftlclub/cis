var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var userservice = require('../services/userservice');
var jwtblacklist = require('../modules/jwtblacklist');
var log = require('../modules/log');



exports.login = function(req, res, next) {

    //error if uid or password not set
    if (!req.body.username || !req.body.password) {
        res.status(400).send(null);
        return;
    }

    //login user
    userservice.checkpassword(req.body.username, req.body.password, function(err, success) {
        //error if login failed or error occured
        if (err || !success) {
            log.info('FAIL User Login: ' + req.body.username);
            return res.status(401).send(null);
        }

        //get user
        userservice.getUserByUid(req.body.username, function(err, user) {
            if (err || !user) {
                res.status(401).send(null);
                return;
            }

            //user is authenticated and fetched --> send token
            var expires = moment().add('days', 7).valueOf()
            var token = jwt.encode({
                    uid: user.username,
                    exp: expires
                },
                config.tokensecret
            );

            log.info('SUCCESS User Login: ' + req.body.username);

            res.json({
                token: token,
                expires: expires,
                username: user.username
            });

        });
    });
}




exports.logout = function(req, res, next) {
    var token = req.headers['x-access-token'];

    //error if no token set
    if (!token) {
        return next();
    }

    jwtblacklist.add(token);

    res.send();
}





exports.externallogin = function(req, res, next) {
    //error if uid or password not set
    if (!req.body.username || !req.body.password) {
        res.status(400).send(null);
        return;
    }


    //login user
    userservice.checkpassword(req.body.username, req.body.password, function(err, success) {
        //error if login failed or error occured
        if (err || !success) {
            log.info('FAIL External Auth: ' + req.body.username);
            res.status(401).send('failed');
            return;
        }

        //get user
        userservice.getUserByUid(req.body.username, function(err, user) {
            if (err || !user) {
                res.status(401).send('could not find user');
                return;
            }

            //if not all types are allowed and user is not of allowed type
            if (req.params.type != 'all' && user.type != req.params.type) {
                res.status(401).send('user type is not allowed');
                return;
            }

            log.info('SUCCESS External Auth: ' + req.body.username);

            res.send('success');
            return;

        });
    });
}
