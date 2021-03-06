var ldapjs = require('ldapjs');
var ssha = require('ssha');
var smbhash = require('smbhash');
var moment = require('moment');
var Promise = require('promise');
var ldap = require('../modules/ldap');
var config = require('../config');

var userattrs = {
    //LDAPAttr : ClubAdminAttr
    'uid': 'username',
    'sn': 'lastname',
    'givenName': 'firstname',
    'displayName': 'displayname',
    'street': 'street',
    'postalCode': 'zip',
    'l': 'city',
    'mail': 'email',
    'telephoneNumber': 'tel',
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
                }, {
                    group: 'clubonleave',
                    key: 'onleave'
                } , {
                    group: 'accesscloud',
                    key: 'accesscloud'
                } , {
                    group: 'accesswifi',
                    key: 'accesswifi'
                } ];

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
        displayName: data.firstname + ' ' + data.lastname,
        userPassword: hashes.userPassword,
        sambaNTPassword: hashes.sambaNTPassword,
        sambaLMPassword: hashes.sambaLMPassword,
        sambaSID: 'S-1-0-0-100',
        objectClass: [
            'inetOrgPerson',
            'organizationalPerson',
            'person',
            'radiusprofile',
            'sambaSamAccount',
            'top'
        ]
    };


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

    console.log('add', user)

    //add user to LDAP tree
    ldap.client.add(uidtodn(user.uid), user, function(err) {
        if (err) return callback(err);

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
            }, {
                group: 'clubonleave',
                condition: data.onleave
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
        
        if (data.accesscloud) {
            exports.addToGroup(data.username, 'accesscloud', function(err, success) {});
        }
        if (data.accesswifi) {
            exports.addToGroup(data.username, 'accesswifi', function(err, success) {});
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
                }, {
                    group: 'clubonleave',
                    condition: data.onleave
                }];

                groupsopt.forEach(function(row) {
                    if (row.condition) exports.addToGroup(uid, row.group, function(err, success) {});
                    else exports.removeFromGroup(uid, row.group, function(err, success) {});
                });



            } else { //others and undefined
                exports.addToGroup(uid, 'clubothers', function(err, success) {});

                //user has to be removed from all club groups
                var groupsremove = ['clubmembers', 'clubformer', 'clubhonorary', 'clubexec', 'clubapplicants', 'clubonleave'];
                groupsremove.forEach(function(row) {
                    exports.removeFromGroup(uid, row, function(err, success) {});
                });
            }

            if (data.accesscloud) {
                exports.addToGroup(uid, 'accesscloud', function(err, success) {});
            } else {
                exports.removeFromGroup(uid, 'accesscloud', function(err, success) {});
            }

            if (data.accesswifi) {
                exports.addToGroup(uid, 'accesswifi', function(err, success) {});
            } else {
                exports.removeFromGroup(uid, 'accesswifi', function(err, success) {});
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
        var groupsremove = ['clubmembers', 'clubothers', 'clubadmins', 'clubformer', 'clubhonorary', 'clubexec', 'clubapplicants', 'clubonleave', 'accesscloud', 'accesswifi'];

        groupsremove.forEach(function(row) {
            exports.removeFromGroup(uid, row, function(err, success) {});
        });

        for (var i = 0; i < config.doorkeys.length; i++) {
            exports.removeFromGroup(uid, 'door' + config.doorkeys[i], function(err, success) {});
        }

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

                //go through groups and assign params to user
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].uniqueMember.indexOf(uidtodn(entry.object.uid)) >= 0) { //if user is group member

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

                        } else if (groups[i].cn == 'clubonleave') {
                            user.onleave = true;
                        
                        } else if (groups[i].cn == 'accesscloud') {
                            user.accesscloud = true;
                        
                        } else if (groups[i].cn == 'accesswifi') {
                            user.accesswifi = true;
                        }

                        for (var k = 0; k < config.doorkeys.length; k++) {
                            if (groups[i].cn == ('door' + config.doorkeys[k])) {
                                user.keyPermissions[config.doorkeys[k]] = true;
                            }
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
        'filter': '(uniqueMember=' + uidtodn(uid) + ')'
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
        'attributes': ['cn', 'uniqueMember'],
        'scope': 'one',
        'filter': '(uniqueMember=*)' //only groups with members
    };


    ldap.client.search(config.ldap.groupbase + ',' + config.ldap.basedn, opts, function(err, res) {
        if (err) return callback(err);

        var groups = [];

        res.on('searchEntry', function(entry) {

            groups.push({
                cn: entry.object.cn,
                uniqueMember: entry.object.uniqueMember
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
        'attributes': ['uniqueMember'],
    };

    var groupdn = 'cn=' + gid + ',' + config.ldap.groupbase + ',' + config.ldap.basedn

    ldap.client.search(groupdn, opts, function(err, res) {
        if (err) return callback(err);

        var members = [];

        res.on('searchEntry', function(entry) {

            //if value is just one string, push it to array
            if (typeof entry.object.uniqueMember === "string") {
                members.push(entry.object.uniqueMember);

                //if value is an array/object, use this as array
            } else if (typeof entry.object.uniqueMember === "object") {
                members = entry.object.uniqueMember;
            }
        });

        //member list is completed
        res.on('end', function(result) {
            members = members.map(dntouid);
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
                    uniqueMember: members.map(uidtodn)
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
                    uniqueMember: members.map(uidtodn)
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

function uidtodn(uid) {
    if (uid.substr(0, 8) === 'cn=admin') { return uid; }
    return 'uid=' + uid + ',' + config.ldap.userbase + ',' + config.ldap.basedn;
}

function dntouid(dn) {
    if (dn.substr(0, 8) === 'cn=admin') { return dn; }
    return dn.split(',')[0].split('=')[1];
}


function ldaphashes(cleartext) {
    return {
        'userPassword': ssha.create(cleartext),
        'sambaNTPassword': smbhash.nthash(cleartext),
        'sambaLMPassword': smbhash.lmhash(cleartext)
    };
}
