var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var userservice = require('../services/userservice');
var jwtblacklist = require('../modules/jwtblacklist');



exports.login = function(req, res, next) {

    //error if uid or password not set
    if (!req.body.username || !req.body.password) {
        res.send(null, 400);
        return;
    }

    //login user
    userservice.checkpassword(req.body.username, req.body.password, function(err, success) {
        //error if login failed or error occured
        if (err || !success) {
            console.log(new Date() + ' FAIL User Login: ' + req.body.username);
            return res.send(null, 401);
        }

        console.log(new Date() + ' SUCCESS User Login: ' + req.body.username);

        //get user
        userservice.getUserByUid(req.body.username, function(err, user) {
            if (err || !user) {
                res.send(null, 401);
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
        res.send(null, 400);
        return;
    }


    //login user
    userservice.checkpassword(req.body.username, req.body.password, function(err, success) {
        //error if login failed or error occured
        if (err || !success) {
            console.log(new Date() + ' FAIL External Auth: ' + req.body.username);
            res.send('failed', 401);
            return;
        }

        console.log(new Date() + ' SUCCESS External Auth: ' + req.body.username);

        //get user
        userservice.getUserByUid(req.body.username, function(err, user) {
            if (err || !user) {
                res.send('could not find user', 401);
                return;
            }

            //if not all types are allowed and user is not of allowed type
            if (req.params.type != 'all' && user.type != req.params.type) {
                res.send('user type is not allowed', 401);
                return;
            }

            res.send('success', 200);
            return;

        });
    });
}
