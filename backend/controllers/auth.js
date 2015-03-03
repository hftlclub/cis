var config = require('../config');
var ldap = require('../ldap');
var moment = require('moment');
var jwt = require('jwt-simple');


exports.login = function(req, res, next){

    //error if uid or password not set
    if (!req.body.uid || !req.body.password){
        res.send(null, 401);
    }

    //login user
    ldap.userlogin(req.body.uid, req.body.password, function(err, success){
        //error if login failed or error occured
        if(err || !success){
            res.send(null, 401);
            return;
        }

        //get user
        ldap.getUserByUid(req.body.uid, function(err, user){
            if(err || !user){
                res.send(null, 401);
            }

            //user is authenticated and fetched --> send token now
            var expires = moment().add('days', 7).valueOf()
            var token = jwt.encode(
                {
                    uid: user.uid,
                    exp: expires
                },
                config.tokensecret
            );
            res.json({
                token: token,
                expires: expires,
                uid: user.uid
            });

        });
    });
}
