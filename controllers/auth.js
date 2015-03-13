var config = require('../config');
var userservice = require('../services/userservice');
var moment = require('moment');
var jwt = require('jwt-simple');


exports.login = function(req, res, next){

    //error if uid or password not set
    if (!req.body.username || !req.body.password){
        res.send(null, 401);
    }

	

    //login user
    userservice.checkpassword(req.body.username, req.body.password, function(err, success){
        //error if login failed or error occured
        if(err || !success){
            res.send(null, 401);
            return;
        }

        //get user
        userservice.getUserByUid(req.body.username, function(err, user){
            if(err || !user){
                res.send(null, 401);
            }

            //user is authenticated and fetched --> send token
            var expires = moment().add('days', 7).valueOf()
            var token = jwt.encode(
                {
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
