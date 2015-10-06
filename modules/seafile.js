var config = require('../config');
var Seafile = require('seafile-api');
var Promise = require('promise');

var sf = new Seafile(config.seafile.url, config.seafile.token);


exports.createUser = function(user) {
    return new Promise(function(resolve, reject) {
        var email = user.username + config.seafile.usersuffix;
        var name = user.firstname + ' ' + user.lastname;

        //create user first
        sf.createAccount({
            email: email,
            password: user.password,
            is_staff: user.superuser
        }, function(err) {
            if (err) {
                console.log(err);
                reject();
                return;
            }

            //set name for user
            sf.updateAccount({
                email: email,
                name: name
            }, function(err) {
                if (err) {
                    console.log(err);
                    reject();
                    return;
                }

                resolve();
            });
        });

    });
}


exports.addToGroup = function(username, group){
    return new Promise(function(resolve, reject) {
        var email = username + config.seafile.usersuffix;

        //get seafile group ID for this group string
        var gid = config.seafile.groups[group];

        if(!gid){
            reject();
        }

        //add user to group
        sf.addGroupMember({
            user_name: email,
            group_id: gid,
        }, function(err) {
            if (err) {
                reject();
                return;
            }

            resolve();
        });

    });
}
