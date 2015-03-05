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


exports.client = client;

