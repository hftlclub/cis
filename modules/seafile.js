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
            password: user.password
        }, function(err, body) {
            if (err) {
                console.log(err, body);
                reject();
                return;
            }

            sf.updateAccount({
                email: email,
                name: name,
                is_active: !user.former, //former users are inactive
                is_staff: user.superuser
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



exports.updateUser = function(username, update) {
    return new Promise(function(resolve, reject) {
        update.email = username + config.seafile.usersuffix;

        sf.updateAccount(update, function(err) {
            if (err) {
                console.log(err);
                reject();
                return;
            }

            resolve();
        });
    });

}





exports.deleteUser = function(username) {
    return new Promise(function(resolve, reject) {
        var email = username + config.seafile.usersuffix;

        exports.removeFromAllGroups(username).then(function() {
            sf.deleteAccount(email, function(err) {
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



exports.removeFromAllGroups = function(username) {
    return new Promise(function(resolve, reject) {
        var proms = [];
        for (var key in config.seafile.groups) {
            proms.push(exports.removeFromGroup(username, key));
        }
        Promise.all(proms).then(resolve).catch(reject);
    });
}



exports.addToAllGroups = function(username) {
    return new Promise(function(resolve, reject) {
        var proms = [];
        for (var key in config.seafile.groups) {
            proms.push(exports.addToGroup(username, key));
        }
        Promise.all(proms).then(resolve).catch(reject);
    });
}



exports.addToGroup = function(username, group) {
    return new Promise(function(resolve, reject) {
        var email = username + config.seafile.usersuffix;

        //get seafile group ID for this group string
        var gid = config.seafile.groups[group];

        if (!gid) {
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




exports.removeFromGroup = function(username, group) {
    return new Promise(function(resolve, reject) {
        var email = username + config.seafile.usersuffix;

        //get seafile group ID for this group string
        var gid = config.seafile.groups[group];

        if (!gid) {
            reject();
        }

        //add user to group
        sf.deleteGroupMember({
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
