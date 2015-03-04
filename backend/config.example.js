//application port
exports.port = 3000;

//session secret (random string)
exports.tokensecret = 'secret';

//LDAP settings for user database
exports.ldap = {
    "server"   : "10.12.114.138",
    "port"     : 389,
    "basedn"   : "dc=club,dc=hft-leipzig,dc=de",
    "userbase" : "ou=users",
    "groupbase": "ou=groups",
    "admindn"  : "cn=admin,dc=club,dc=hft-leipzig,dc=de",
    "adminpw"  : ""
};
