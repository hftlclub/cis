var ldapjs = require('ldapjs');
var ldap = require('../modules/ldap');
var config = require('../config');


var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress', 'employeeType'];


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
        'attributes': userattrs
    };

    ldap.client.search(uidtodn(uid), opts, function(err, res){
        if(err) callback(err);

        res.on('searchEntry', function(entry){
            callback(null, entry.object);
        });
    });
}



exports.addUser = function(user, callback){
	user.cn = user.uid;
	user.homeDirectory = '/home/' + user.uid;
	user.gidNumber = 100; //group: users
	
	user.objectClass = [
		'inetOrgPerson',
		'organizationalPerson',
		'person',
		'posixAccount',
		'radiusprofile',
		'sambaSamAccount',
		'top'
	];

	user.sambaSID = "S-1-0-0-" + (user.uidNumber * 2 + 5)

	ldap.client.add(uidtodn(user.uid), user, function(err) {
		if(err) callback(err);
		
		callback(null, true);
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
