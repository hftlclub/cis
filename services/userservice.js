var ldapjs = require('ldapjs');
var ldap = require('../modules/ldap');
var config = require('../config');


var userattrs = {
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


exports.userlogin = function(uid, password, callback){
    //create temporary client
    var userclient = ldapjs.createClient({
        url: 'ldap://' + config.ldap.server + ':' + config.ldap.port
    });

    //bind to server
    userclient.bind(uidtodn(uid), password, function(err){

        //unbind from server
        /*client.unbind(function(err){
            if(err) return callback(err);
        });*/

        if(err){
            return callback(err, false);
        }

        return callback(null, true);
    });
}



exports.getUserByUid = function(uid, callback){
    var opts = {
        'attributes': userLDAPAttrs()
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res){
        if(err) callback(err);

        res.on('searchEntry', function(entry){
            var user = {};
            for(var key in userattrs){
				user[userattrs[key]] = entry.object[key];            
            }
            
            callback(null, user);
        });
    });
}



exports.addUser = function(data, callback){
	var user = {
		uid: data.username,
		cn: data.username,
		mail: data.email,
		givenName: data.firstname,
		sn: data.lastname,
		street: data.street,
		postalCode: data.zip,
		l: data.city,
		telephoneNumber: data.tel,
		registeredAddress: data.teamdrive,
		loginShell: data.loginShell,
		employeeType: data.role,
		
		userPassword: data.hashes.userPassword,
		sambaNTPassword: data.hashes.sambaNTPassword,
		sambaLMPassword: data.hashes.sambaLMPassword,
		
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

	console.log(user);

	ldap.client.add(uidtodn(user.uid), user, function(err) {
		if(err) callback(err);
		
		callback(null, true);
	});
}



exports.getAll = function(callback){
    var opts = {
        'attributes': userLDAPAttrs(),
        'scope': 'one'
    };

    ldap.client.search(config.ldap.userbase + ',' + config.ldap.basedn, opts, function(err, res){
        if(err) callback(err);
		
		var users = [];

        res.on('searchEntry', function(entry){
            //rewrite attribute names
            var user = {};
            for(var key in userattrs){
				user[userattrs[key]] = entry.object[key];            
            }
            
            users.push(user);
            
        });
        
        //return user list
        res.on('end', function(result){
	        callback(null, users);
        });
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
