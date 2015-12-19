var ldapjs = require('ldapjs');
var ssha = require('ssha');
var smbhash = require('smbhash');
var moment = require('moment');
var Promise = require('promise');
var ldap = require('../modules/ldap');
var config = require('../config');
var seafile = require('../modules/seafile');


var userattrs = {
    //LDAPAttr : ClubAdminAttr
    'uid': 'username',
    'uidNumber': 'uidNumber',
    'sn': 'lastname',
    'givenName': 'firstname',
    'street': 'street',
    'postalCode': 'zip',
    'l': 'city',
    'mail': 'email',
    'telephoneNumber': 'tel',
    'loginShell': 'loginShell',
    'employeeType': 'role',
    'title': 'alias',
    'dialupAccess': 'birthday',
    'physicalDeliveryOfficeName': 'accessiondate'
}

//inverted set of "userattrs"
var ldapattrs = [];

//simple list of all ldap attributes for a user
var userldapattrs = [];

//fill  "userldapattrs" and "ldapattrs"
for (var k in userattrs) {
    userldapattrs.push(k);
    ldapattrs[userattrs[k]] = k;
}



/****************************************/




//check password for user (uid)
exports.checkpassword = function(uid, password, callback) {

    if (!password) {
        return callback(new Error('no password given'));
    }

    var opts = {
        'attributes': ['userPassword']
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res) {
        if (err) {
            return callback(err, false);
        }

        res.on('searchEntry', function(entry) {

            //verify password
            if (ssha.verify(password, entry.object.userPassword)) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        });

        res.on('error', function(err) {
            callback(err);
        });

        //return callback(null, false);
    });
}





//get one user by uid
exports.getUserByUid = function(uid, callback) {
    var opts = {
        'attributes': userldapattrs
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res) {
        if (err) {
            return callback(err);
        }

        res.on('searchEntry', function(entry) {
            var user = {};
            for (var key in userattrs) {
                user[userattrs[key]] = entry.object[key];
            }

            //get groups for user
            exports.getGroupsByUid(uid, function(err, groups) {

                //set flags according to groups user belongs to
                var groupsadd = [{
                    group: 'clubadmins',
                    key: 'superuser'
                }, {
                    group: 'clubformer',
                    key: 'former'
                }, {
                    group: 'clubhonorary',
                    key: 'honorary'
                }, {
                    group: 'clubapplicants',
                    key: 'applicant'
                }, {
                    group: 'clubexec',
                    key: 'executive'
                }, ];

                groupsadd.forEach(function(row) {
                    user[row.key] = (groups.indexOf(row.group) >= 0) ? true : false;
                });

                /**********/

                //sort into usertype groups
                if (groups.indexOf('clubmembers') >= 0) {
                    user.type = 'club';
                } else if (groups.indexOf('clubothers') >= 0) {
                    user.type = 'other';
                } else {
                    user.type = null;
                }

                //set key permissions
                user.keyPermissions = {};
                for (var i = 0; i < config.doorkeys.length; i++) {
                    user.keyPermissions[config.doorkeys[i]] = (groups.indexOf('door' + config.doorkeys[i]) >= 0) ? true : false;
                }

                //set privileges
                user.auth = {};
                for (var i = 0; i < config.authgroups.length; i++) {
                    user.auth[config.authgroups[i]] = (groups.indexOf('auth' + config.authgroups[i]) >= 0) ? true : false;
                }

                return callback(null, user);
            });
        });

        res.on('error', function(err) {
            callback(err);
        });

    });
}




//add a new user
exports.addUser = function(data, callback) {

    var hashes = ldaphashes(data.password);

    var user = {
        uid: data.username,
        cn: data.username,
        mail: data.email,
        givenName: data.firstname,
        sn: data.lastname,
        userPassword: hashes.userPassword,
        sambaNTPassword: hashes.sambaNTPassword,
        sambaLMPassword: hashes.sambaLMPassword,
        uidNumber: data.uidnumber,
        gidNumber: 100,
        homeDirectory: '/home/' + data.username,
        sambaSID: "S-1-0-0-" + (data.uidnumber * 2 + 5),
        objectClass: [
            'inetOrgPerson',
            'organizationalPerson',
            'person',
            'posixAccount',
            'radiusprofile',
            'sambaSamAccount',
            'top'
        ]
    };


    /*//loginShell for superusers only
    if (data.loginShell && data.superuser) {
        user[getLDAPAttrName('loginShell')] = data.loginShell;
    } else {
        user[getLDAPAttrName('loginShell')] = '/bin/false';
    }*/

    if (data.loginShell) {
        user[ldapattrs['loginShell']] = data.loginShell;
    }

    if (data.street) {
        user[ldapattrs['street']] = data.street;
    }

    if (data.zip) {
        user[ldapattrs['zip']] = data.zip;
    }

    if (data.city) {
        user[ldapattrs['city']] = data.city;
    }

    if (data.tel) {
        user[ldapattrs['tel']] = data.tel;
    }

    if (data.role) {
        user[ldapattrs['role']] = data.role;
    }

    if (data.alias) {
        user[ldapattrs['alias']] = data.alias;
    }

    if (data.birthday) {
        user[ldapattrs['birthday']] = data.birthday;
    }

    //accessiondate for clubmembers only
    if (data.accessiondate && data.type == 'club') {
        user[ldapattrs['accessiondate']] = data.accessiondate;
    }

    //add user to LDAP tree
    ldap.client.add(uidtodn(user.uid), user, function(err) {
        if (err) return callback(err);

        //add user to seafile
        seafile.createUser(data).then(function() {
            if (data.type == 'club') {
                //add club users to "allgemein" group, but not the applicants
                if (!data.applicant) seafile.addToGroup(data.username, 'allgemein');

                //add executives to all groups
                if (data.executive) seafile.addToAllGroups(data.username);

                //other users will have no pre-assigned groups
            }
        });



        //set groups
        if (data.superuser) {
            exports.addToGroup(data.username, 'clubadmins', function(err, success) {});
        }

        if (data.type == 'club') {

            //find groups to add user to
            var groupsadd = [{
                group: 'clubmembers'
            }, {
                group: 'clubformer',
                condition: data.former
            }, {
                group: 'clubhonorary',
                condition: data.honorary
            }, {
                group: 'clubapplicants',
                condition: data.applicant
            }, {
                group: 'clubexec',
                condition: data.executive
            }];

            groupsadd.forEach(function(row) {
                var action = 0;
                if (row.hasOwnProperty('condition')) {
                    if (row.condition) action = 1;
                } else {
                    action = 1;
                }
                if (action) exports.addToGroup(data.username, row.group, function(err, success) {});
            });

        } else { //other and undefined
            exports.addToGroup(data.username, 'clubothers', function(err, success) {});
        }

        //if no key permissions are set, at least use an empty object
        if (!data.hasOwnProperty('keyPermissions')) {
            data.keyPermissions = {};
        }

        for (var i = 0; i < config.doorkeys.length; i++) {
            if (data.type == 'club' && data.keyPermissions[config.doorkeys[i]]) { //if is clubmember and permissions for this key are set
                exports.addToGroup(data.username, 'door' + config.doorkeys[i], function(err, success) {});
            }
        }


        //add to auth groups
        if (!data.hasOwnProperty('auth')) {
            data.auth = {};
        }

        for (var i = 0; i < config.authgroups.length; i++) {
            if (data.auth[config.authgroups[i]]) { //if permissions for this group are set
                exports.addToGroup(data.username, 'auth' + config.authgroups[i], function(err, success) {});
            }
        }

        return callback(null, true);
    });
}




//edit a user (uid)
exports.editUser = function(uid, data, callback) {

    //error if no UID given
    if (!uid) {
        return callback(new Error('uid missing'));
    }

    //I will go through all sent data now and see whether I find those attributes in the 'userattr' object of allowed user attributes.
    //After this I will get the correct LDAP attribute name (from 'userattr') and build an array of change objects I commit to the server.


    //this will contain all my changes objects
    var changes = [];

    //go through sent data
    for (var key in data) {
        //find LDAP key name
        var ldapattr = ldapattrs[key];
        if (!ldapattr) continue;

        //modification
        var mod = {};
        if (!data[key]) data[key] = []; //make empty array of empty string
        mod[ldapattr] = data[key];


        //create and push change object
        changes.push(new ldapjs.Change({
            operation: 'replace',
            modification: mod
        }));
    }

    //error if there are no attributes to change
    if (changes.length == 0) {
        return callback(new Error('no attributes to change'));
    }

    //commit changes to the server
    ldap.client.modify(uidtodn(uid), changes, function(err) {
        if (err) return callback(err);

        //update seafile user
        var sfupdate = {};
        sfupdate.name = (data.firstname && data.lastname) ? data.firstname + ' ' + data.lastname : null;
        sfupdate.is_active = (data.former) ? 0 : 1; //deactivate former users
        sfupdate.is_staff = (data.superuser) ? 1 : 0;

        seafile.updateUser(uid, sfupdate);

        if (data.type == 'club') {
            //add club users to "allgemein" group, but not the applicants
            if (!data.applicant) seafile.addToGroup(uid, 'allgemein');

            //add executives to all groups / remove non-executives from "vorstand" group
            if (data.executive) seafile.addToAllGroups(uid);
            else seafile.removeFromGroup(uid, 'vorstand');

            //other users have no pre-assigned groups and thus, will not be changed
        }



        //set groups: add user to given group but also remove them from the other groups
        if ('superuser' in data) {
            if (data.superuser) {
                exports.addToGroup(uid, 'clubadmins', function(err, success) {});
            } else {
                exports.removeFromGroup(uid, 'clubadmins', function(err, success) {});
            }
        }

        if ('type' in data) {
            if (data.type == 'club') {
                //general club group
                exports.addToGroup(uid, 'clubmembers', function(err, success) {});
                exports.removeFromGroup(uid, 'clubothers', function(err, success) {});

                //optional groups
                var groupsopt = [{
                    group: 'clubformer',
                    condition: data.former
                }, {
                    group: 'clubhonorary',
                    condition: data.honorary
                }, {
                    group: 'clubapplicants',
                    condition: data.applicant
                }, {
                    group: 'clubexec',
                    condition: data.executive
                }];

                groupsopt.forEach(function(row) {
                    if (row.condition) exports.addToGroup(uid, row.group, function(err, success) {});
                    else exports.removeFromGroup(uid, row.group, function(err, success) {});
                });



            } else { //others and undefined
                exports.addToGroup(uid, 'clubothers', function(err, success) {});
                var groupsremove = ['clubmembers', 'clubformer', 'clubhonorary', 'clubexec', 'clubapplicants'];

                groupsremove.forEach(function(row) {
                    exports.removeFromGroup(uid, row, function(err, success) {});
                });
            }
        }

        if ('keyPermissions' in data) {
            for (var i = 0; i < config.doorkeys.length; i++) {
                if (data.type == 'club' && data.keyPermissions[config.doorkeys[i]]) { //if is clubmember and permissions for this key are set
                    exports.addToGroup(uid, 'door' + config.doorkeys[i], function(err, success) {});
                } else { //if no clubmember or permissions not set
                    exports.removeFromGroup(uid, 'door' + config.doorkeys[i], function(err, success) {});
                }
            }
        }


        if ('auth' in data) {
            for (var i = 0; i < config.authgroups.length; i++) {
                if (data.auth[config.authgroups[i]]) { //if permissions for this group are set
                    exports.addToGroup(uid, 'auth' + config.authgroups[i], function(err, success) {});
                } else { //if no permissions for this group
                    exports.removeFromGroup(uid, 'auth' + config.authgroups[i], function(err, success) {});
                }
            }
        }



        return callback(null, true);
    });

}




//delete a user (uid)
exports.deleteUser = function(uid, callback) {
    if (!uid) {
        var err = new Error('uid missing');
        err.status = 400;
        return callback(err);
    }

    //remove user from LDAP tree
    ldap.client.del(uidtodn(uid), function(err) {
        if (err) return callback(err);

        //remove user from groups
        var groupsremove = ['clubmembers', 'clubothers', 'clubadmins', 'clubformer', 'clubhonorary', 'clubexec', 'clubapplicants'];

        //remove from authgroups
        groupsremove = groupsremove.concat(config.authgroups);

        //remove from key permission groups
        for (var i = 0; i < config.doorkeys.length; i++) {
            groupsremove.push('door' + config.doorkeys[i]);
        }

        //finally REMOVE from all those groups
        groupsremove.forEach(function(row) {
            exports.removeFromGroup(uid, row, function(err, success) {});
        });



        //remove user from seafile
        seafile.deleteUser(uid);

        return callback();
    });
}



//set new password for user (uid)
exports.setPassword = function(uid, password, callback) {

    //build change objects for each of the three hash attributes
    var hashes = ldaphashes(password);
    var changes = [];
    for (var key in hashes) {
        var mod = {};
        mod[key] = hashes[key];

        changes.push(new ldapjs.Change({
            operation: 'replace',
            modification: mod
        }));
    }


    ldap.client.modify(uidtodn(uid), changes, function(err) {
        if (err) return callback(err);

        //edit seafile user
        seafile.updateUser(uid, { password: password });

        return callback();
    });
}





//get all users
exports.getUsers = function(callback) {
    //get all groups and their members - we will need all these data to assign it to the users later
    exports.getGroups(function(err, groups) {
        if (err) return callback(err);

        var opts = {
            'attributes': userldapattrs,
            'scope': 'one'
        };

        //get all users
        ldap.client.search(config.ldap.userbase + ',' + config.ldap.basedn, opts, function(err, res) {
            if (err) callback(err);

            var users = [];

            res.on('searchEntry', function(entry) {
                //rewrite attribute names
                var user = {};
                for (var key in userattrs) {
                    user[userattrs[key]] = entry.object[key];
                }

                //negative default values for groups
                user.superuser = false;
                user.type = 'other';
                user.keyPermissions = {};
                user.auth = {};

                //go through groups and assign params to user
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].memberUid.indexOf(entry.object.uid) >= 0) { //if user is group member

                        //set params for user
                        if (groups[i].cn == 'clubadmins') {
                            user.superuser = true;
                        } else if (groups[i].cn == 'clubmembers') {
                            user.type = 'club';

                        } else if (groups[i].cn == 'clubothers') {
                            user.type = 'other';

                        } else if (groups[i].cn == 'clubformer') {
                            user.former = true;

                        } else if (groups[i].cn == 'clubhonorary') {
                            user.honorary = true;

                        } else if (groups[i].cn == 'clubapplicants') {
                            user.applicant = true;

                        } else if (groups[i].cn == 'clubexec') {
                            user.executive = true;
                        }


                        for (var k = 0; k < config.doorkeys.length; k++) {
                            var val;
                            if (groups[i].cn == ('door' + config.doorkeys[k])) {
                                 val = true;
                            }else{
                                val = false;
                            }

                            user.keyPermissions[config.doorkeys[k]] = val;
                        }


                        for (var k = 0; k < config.authgroups.length; k++) {
                            var val;
                            if (groups[i].cn == ('auth' + config.authgroups[k])) {
                                val = true;
                            }else{
                                val = false;
                            }

                            user.auth[config.authgroups[k]] = val;
                        }
                    }
                }

                //and finally submit this user object
                users.push(user);

            });

            //return user list
            res.on('end', function(result) {
                return callback(null, users);
            });

            res.on('error', function(err) {
                callback(err);
            });

        });

    });
}




//get all groups for a user (uid)
exports.getGroupsByUid = function(uid, callback) {
    var opts = {
        'attributes': ['cn'],
        'scope': 'one',
        'filter': '(memberUid=' + uid + ')'
    };

    //get groups
    ldap.client.search(config.ldap.groupbase + ',' + config.ldap.basedn, opts, function(err, res) {
        if (err) return callback(err);

        var groups = [];

        res.on('searchEntry', function(entry) {
            groups.push(entry.object.cn);
        });

        //return group list
        res.on('end', function(result) {
            return callback(null, groups);
        });

        res.on('error', function(err) {
            callback(err);
        });

    });
}



//get all groups and their members
exports.getGroups = function(callback) {
    var opts = {
        'attributes': ['cn', 'memberUid'],
        'scope': 'one',
        'filter': '(memberUid=*)' //only groups with members
    };


    ldap.client.search(config.ldap.groupbase + ',' + config.ldap.basedn, opts, function(err, res) {
        if (err) return callback(err);

        var groups = [];

        res.on('searchEntry', function(entry) {

            groups.push({
                cn: entry.object.cn,
                memberUid: entry.object.memberUid
            });

        });

        //return group list
        res.on('end', function(result) {
            return callback(null, groups);
        });

        res.on('error', function(err) {
            callback(err);
        });

    });
}




//get all members of a group (gid)
exports.getGroupMembers = function(gid, callback) {
    var opts = {
        'attributes': ['memberUid'],
    };

    var groupdn = 'cn=' + gid + ',' + config.ldap.groupbase + ',' + config.ldap.basedn

    ldap.client.search(groupdn, opts, function(err, res) {
        if (err) return callback(err);

        var members = [];

        res.on('searchEntry', function(entry) {

            //if value is just one string, push it to array
            if (typeof entry.object.memberUid === "string") {
                members.push(entry.object.memberUid);

                //if value is an array/object, use this as array
            } else if (typeof entry.object.memberUid === "object") {
                members = entry.object.memberUid;
            }
        });

        //member list is completed
        res.on('end', function(result) {
            return callback(null, members, groupdn);
        });

        res.on('error', function(err) {
            callback(err);
        });

    });
}








//add user (uid) to a group (gid)
exports.addToGroup = function(uid, gid, callback) {

    exports.getGroupMembers(gid, function(err, members, groupdn) {
        if (err) return callback(err);

        //check whether user is already member of this group
        if (members.indexOf(uid) >= 0) {
            return callback(null, true); //is already member: finish here

        } else {
            //not a member: add
            members.push(uid);

            //write new row to LDAP
            var change = new ldapjs.Change({
                operation: 'replace',
                modification: {
                    memberUid: members
                }
            });

            ldap.client.modify(groupdn, change, function(err) {
                if (err) return callback(err);

                return callback(null, true);
            });
        }
    });

}


//remove user (uid) from a group (gid)
exports.removeFromGroup = function(uid, gid, callback) {

    exports.getGroupMembers(gid, function(err, members, groupdn) {
        if (err) return callback(err);

        //check whether user is member of this group
        if (members.indexOf(uid) >= 0) {
            //remove element from array
            members.splice(members.indexOf(uid), 1);

            //write new row to LDAP
            var change = new ldapjs.Change({
                operation: 'replace',
                modification: {
                    memberUid: members
                }
            });

            ldap.client.modify(groupdn, change, function(err) {
                if (err) return callback(err);

                return callback(null, true);
            });

        } else {
            return callback(null, true); //is already member: finish here
        }
    });

}



exports.nextFreeUnixID = function(increment, callback) {
    var nfuidn = 'cn=NextFreeUnixId,' + config.ldap.basedn;

    ldap.client.search(nfuidn, function(err, res) {
        if (err) callback(err);

        res.on('searchEntry', function(entry) {
            var uidNumber = parseInt(entry.object.uidNumber);

            //do not increment, just return uidNumber
            if (!increment) {
                return callback(null, uidNumber);
            }

            //increment uidNumber
            var change = new ldapjs.Change({
                operation: 'replace',
                modification: {
                    uidNumber: (uidNumber + 1)
                }
            });

            ldap.client.modify(nfuidn, change, function(err) {
                //and return OLD uidNumber
                return callback(null, uidNumber);
            });
        });

        res.on('error', function(err) {
            callback(err);
        });

    });
}




function uidtodn(uid) {
    return 'uid=' + uid + ',' + config.ldap.userbase + ',' + config.ldap.basedn;
}


function ldaphashes(cleartext) {
    return {
        'userPassword': ssha.create(cleartext),
        'sambaNTPassword': smbhash.nthash(cleartext),
        'sambaLMPassword': smbhash.lmhash(cleartext)
    };
}
