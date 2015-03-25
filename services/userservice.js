var ldapjs = require('ldapjs');
var ssha = require('ssha');
var smbhash = require('smbhash');
var ldap = require('../modules/ldap');
var config = require('../config');



var userattrs = {
	//LDAPAttr : ClubAdminAttr
	'uid'              : 'username',
	'uidNumber'        : 'uidNumber',
	'sn'               : 'lastname',
	'givenName'        : 'firstname',
	'street'           : 'street',
	'postalCode'       : 'zip',
	'l'                : 'city',
	'mail'             : 'email',
	'telephoneNumber'  : 'tel',
	'loginShell'       : 'loginShell',
	'registeredAddress': 'teamdrive',
	'employeeType'     : 'role'
}


//returns all ldap attributes for a user
function userLDAPAttrs(){
	var keys = [];
	for(var k in userattrs) keys.push(k);

	return keys;
}

//get LDAP attribute name for club admin attribute name
function getLDAPAttrName(clubadminattr){
    for(var attr in userattrs) {
		if(userattrs.hasOwnProperty(attr)){
			if(userattrs[attr] === clubadminattr){
				return attr;
        	}
        }
	}
	return false;
}




//check password for user (uid)
exports.checkpassword = function(uid, password, callback){
	
	if(!password){
		return callback(new Error('no password given'));
	}
	
	var opts = {
        'attributes': ['userPassword']
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res){
        if(err) callback(err, false);

        res.on('searchEntry', function(entry){

			//verify password
			if(ssha.verify(password, entry.object.userPassword)){
				return callback(null, true);
			}else{
				return callback(null, false);
			}
        });
    });
}


//get one user by uid
exports.getUserByUid = function(uid, callback){
    var opts = {
        'attributes': userLDAPAttrs()
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res){
        if(err) return callback(err);

        res.on('searchEntry', function(entry){
            var user = {};
            for(var key in userattrs){
				user[userattrs[key]] = entry.object[key];
            }


            //get groups for user
            exports.getGroupsByUid(uid, function(err, groups){

				user.superuser = (groups.indexOf('clubadmins') >= 0) ? true : false;
				if(groups.indexOf('clubmembers') >= 0){
					user.type = 'club';
				}else if(groups.indexOf('clubothers') >= 0){
					user.type = 'other';
				}else{
					user.type = null;
				}

				return callback(null, user);
			});
        });
    });
}


//add a new user
exports.addUser = function(data, callback){

	var hashes = ldaphashes(data.password);

	var user = {
		uid: data.username,
		cn: data.username,
		mail: data.email,
		givenName: data.firstname,
		sn: data.lastname,
		loginShell: data.loginShell,
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
	
	//set optional attributes
	if(data.street){
		user.street = data.street;
	}

	if(data.zip){
		user.postalCode = data.zip;
	}
	
	if(data.city){
		user.l = data.city;
	}
	
	if(data.tel){
		user.telephoneNumber = data.tel;
	}
	
	if(data.teamdrive){
		user.registeredAddress = data.teamdrive;
	}
	
	if(data.role){
		user.employeeType = data.role;
	}



	//add user to LDAP tree
	ldap.client.add(uidtodn(user.uid), user, function(err) {
		if(err) return callback(err);


		//set groups
		if(data.superuser){
			exports.addToGroup(data.username, 'clubadmins', function(err, success){});
		}

		if(data.type == 'club'){
			exports.addToGroup(data.username, 'clubmembers', function(err, success){});
		}else if(data.type == 'other'){
			exports.addToGroup(data.username, 'clubothers', function(err, success){});
		}else{
			exports.addToGroup(data.username, 'clubothers', function(err, success){});
		}


		return callback(null, true);
	});
}




//edit a user (uid)
exports.editUser = function(uid, data, callback){
	
	//error if no UID given
	if(!uid){
		return callback(new Error('uid missing'));
	}
	
	//I will go through all sent data now and see whether I find those attributes in the 'userattr' object of allowed user attributes.
	//After this I will get the correct LDAP attribute name (from 'userattr') and build an array of change objects I commit to the server.


	//this will contain all my changes objects
	var changes = [];

	//go through sent data
	for(var key in data){
		//find LDAP key name
		var ldapattr = getLDAPAttrName(key);
		if(!ldapattr) continue;
		
		//modification
		var mod = {};
		if(!data[key]) data[key] = []; //make empty array of empty string
		mod[ldapattr] = data[key];

			
		//create and push change object
		changes.push(new ldapjs.Change({
			operation: 'replace',
			modification: mod
		}));
	}
	
	//error if there are no attributes to change
	if(changes.length == 0){
		return callback(new Error('no attributes to change'));
	}

	//commit changes to the server
	ldap.client.modify(uidtodn(uid), changes, function(err) {
		if(err) return callback(err);

		//set groups: add user to given group but also remove them from the other groups
		if('superuser' in data){
			if(data.superuser){
				exports.addToGroup(uid, 'clubadmins', function(err, success){});
			}else{
				exports.removeFromGroup(uid, 'clubadmins', function(err, success){});
			}
		}

		if('type' in data){
			if(data.type == 'club'){
				exports.addToGroup(uid, 'clubmembers', function(err, success){});
				exports.removeFromGroup(uid, 'clubothers', function(err, success){});
			
			}else if(data.type == 'other'){
				exports.addToGroup(uid, 'clubothers', function(err, success){});
				exports.removeFromGroup(uid, 'clubmembers', function(err, success){});
			
			}else{
				exports.addToGroup(uid, 'clubothers', function(err, success){});
				exports.removeFromGroup(uid, 'clubmembers', function(err, success){});
			}
		}

		return callback(null, true);
	});

}




//delete a user (uid)
exports.deleteUser = function(uid, callback){
	if(!uid){
		var err = new Error('uid missing');
		err.status = 400;
		return callback(err);
	}

	//remove user from LDAP tree
	ldap.client.del(uidtodn(uid), function(err) {
		if(err) return callback(err);
		
		//remove user from groups
		exports.removeFromGroup(uid, 'clubmembers', function(err, success){});
		exports.removeFromGroup(uid, 'clubothers', function(err, success){});
		exports.removeFromGroup(uid, 'clubadmins', function(err, success){});
		
		return callback();
	});
}



//set new password for user (uid)
exports.setPassword = function(uid, password, callback){

	//build change objects for each of the three hash attributes
	var hashes = ldaphashes(password);
	var changes = [];
	for(var key in hashes){
		var mod = {};
		mod[key] = hashes[key];

		changes.push(new ldapjs.Change({
			operation: 'replace',
			modification: mod
		}));
	}


	ldap.client.modify(uidtodn(uid), changes, function(err){
		if(err) return callback(err);
		return callback();
	});
}





//get all users
exports.getUsers = function(callback){
    //get all groups and their members - we will need all these data to assign it to the users later
    exports.getGroups(function(err, groups){
	    if(err) return callback(err);

	    var opts = {
	        'attributes': userLDAPAttrs(),
	        'scope': 'one'
	    };

		//get all users
	    ldap.client.search(config.ldap.userbase + ',' + config.ldap.basedn, opts, function(err, res){
	        if(err) callback(err);

			var users = [];

	        res.on('searchEntry', function(entry){
	            //rewrite attribute names
	            var user = {};
	            for(var key in userattrs){
					user[userattrs[key]] = entry.object[key];
	            }

	            //negative default values for groups
	            user.superuser = false;
	            user.type = 'other';

	            //go through groups and assign params to user
	            for(var i = 0; i < groups.length; i++){
		            if(groups[i].memberUid.indexOf(entry.object.uid) >= 0){ //if user is group member
			            //set params for user
			            if(groups[i].cn == 'clubadmins'){
				            user.superuser = true;
			            }else if(groups[i].cn == 'clubmembers'){
				            user.type = 'club';
			            }else if(groups[i].cn == 'clubothers'){
				            user.type = 'other';
			            }
		            }
	            }

				//and finally submit this user object
	            users.push(user);

	        });


	        //return user list
	        res.on('end', function(result){
		        return callback(null, users);
	        });
	    });

    });
}




//get all groups for a user (uid)
exports.getGroupsByUid = function(uid, callback){
    var opts = {
        'attributes': ['cn'],
        'scope': 'one',
        'filter': '(memberUid=' + uid + ')'
    };

	//get groups
    ldap.client.search(config.ldap.groupbase + ',' + config.ldap.basedn, opts, function(err, res){
        if(err) return callback(err);

		var groups = [];

        res.on('searchEntry', function(entry){
            groups.push(entry.object.cn);

        });

        //return group list
        res.on('end', function(result){
	        return callback(null, groups);
        });
    });
}



//get all groups and their members
exports.getGroups = function(callback){
    var opts = {
        'attributes': ['cn', 'memberUid'],
        'scope': 'one',
        'filter': '(memberUid=*)' //only groups with members
    };


    ldap.client.search(config.ldap.groupbase + ',' + config.ldap.basedn, opts, function(err, res){
        if(err) return callback(err);

		var groups = [];

        res.on('searchEntry', function(entry){

            groups.push({
	            cn: entry.object.cn,
				memberUid: entry.object.memberUid
	        });

        });

        //return group list
        res.on('end', function(result){
	        return callback(null, groups);
        });
    });
}




//get all members of a group (gid)
exports.getGroupMembers = function(gid, callback){
	var opts = {
        'attributes': ['memberUid'],
    };

	var groupdn = 'cn=' + gid + ',' + config.ldap.groupbase + ',' + config.ldap.basedn

    ldap.client.search(groupdn, opts, function(err, res){
        if(err) return callback(err);

		var members = [];

        res.on('searchEntry', function(entry){

            //if value is just one string, push it to array
            if(typeof entry.object.memberUid === "string"){
	            members.push(entry.object.memberUid);

			//if value is an array/object, use this as array
			}else if(typeof entry.object.memberUid === "object"){
				members = entry.object.memberUid;
			}
        });

        //member list is completed
        res.on('end', function(result){
			return callback(null, members, groupdn);
		});
	});
}








//add user (uid) to a group (gid)
exports.addToGroup = function(uid, gid, callback){

    exports.getGroupMembers(gid, function(err, members, groupdn){
	    if(err) return callback(err);

	    //check whether user is already member of this group
	    if(members.indexOf(uid) >= 0){
		    return callback(null, true); //is already member: finish here

	    }else{
		    //not a member: add
		    members.push(uid);

		    //write new row to LDAP
		    var change = new ldapjs.Change({
				operation: 'replace',
				modification: {
					memberUid: members
				}
			});

			ldap.client.modify(groupdn, change, function(err){
				if(err) return callback(err);

				return callback(null, true);
            });
        }
    });

}


//remove user (uid) from a group (gid)
exports.removeFromGroup = function(uid, gid, callback){

    exports.getGroupMembers(gid, function(err, members, groupdn){
	    if(err) return callback(err);

		//check whether user is member of this group
		if(members.indexOf(uid) >= 0){
			//remove element from array
			members.splice(members.indexOf(uid), 1);

			//write new row to LDAP
			var change = new ldapjs.Change({
				operation: 'replace',
				modification: {
					memberUid: members
				}
			});

			ldap.client.modify(groupdn, change, function(err){
				if(err) return callback(err);

				return callback(null, true);
			});

	    }else{
			return callback(null, true); //is already member: finish here
		}
    });

}



exports.nextFreeUnixID = function(increment, callback){
	var nfuidn = 'cn=NextFreeUnixId,' + config.ldap.basedn;

	ldap.client.search(nfuidn, function(err, res){
        if(err) callback(err);

        res.on('searchEntry', function(entry){
            var uidNumber = parseInt(entry.object.uidNumber);

            //do not increment, just return uidNumber
            if(!increment){
	            return callback(null, uidNumber);
            }

			//increment uidNumber
            var change = new ldapjs.Change({
				operation: 'replace',
				modification: {
					uidNumber: (uidNumber + 1)
				}
			});

            ldap.client.modify(nfuidn, change, function(err){
	            //and return OLD uidNumber
	            return callback(null, uidNumber);
            });
        });
    });
}




function uidtodn(uid){
    return 'uid=' + uid + ',' + config.ldap.userbase + ',' + config.ldap.basedn;
}


function ldaphashes(cleartext){
	return {
		'userPassword'   : ssha.create(cleartext),
		'sambaNTPassword': smbhash.nthash(cleartext),
		'sambaLMPassword': smbhash.lmhash(cleartext)
	};
}
