var ldapjs = require('ldapjs');
var config = require('./config');

var userattrs = ['uid', 'uidNumber', 'gidNumber', 'sn', 'givenName', 'street', 'postalCode', 'l', 'mail', 'telephoneNumber', 'loginShell', 'registeredAddress'];


//create LDAP client
var client = ldapjs.createClient({
    url: 'ldap://' + config.ldap.server + ':' + config.ldap.port
});

//bind to LDAP server
client.bind(config.ldap.admindn, config.ldap.adminpw, function(err) {
    //
});


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

    client.search(uidtodn(uid), opts, function(err, res){
        if(err) callback(err);

        res.on('searchEntry', function(entry){
            callback(null, entry.object);
        });
    });
}





function uidtodn(uid){
    return 'uid=' + uid + ',' + config.ldap.userbase + ',' + config.ldap.basedn;
}
