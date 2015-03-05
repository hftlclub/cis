var ldapjs = require('ldapjs');
var ldap = require('../modles/ldap');
var config = require('../config');


var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress'];


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





function uidtodn(uid){
    return 'uid=' + uid + ',' + config.ldap.userbase + ',' + config.ldap.basedn;
}
