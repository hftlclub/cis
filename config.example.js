//application port
exports.port = 3000;

//session secret (random string)
exports.tokensecret = require('crypto').randomBytes(20).toString('hex');

//LDAP settings
exports.ldap = {
    "server"   : "10.12.114.138",
    "port"     : 389,
    "basedn"   : "dc=club,dc=hft-leipzig,dc=de",
    "userbase" : "ou=users",
    "groupbase": "ou=groups",
    "admindn"  : "cn=admin,dc=club,dc=hft-leipzig,dc=de",
    "adminpw"  : ""
};

//MySQL settings
exports.dbcred = {
    "host": "",
    "port": 3306,
    "user": "",
    "password": "",
    "database": ""
}

//SMTP settings
exports.smtp = {
    "host": "securemail.hft-leipzig.de",
    "port": 465,
    "secure": true,
    "auth": {
        "user": "",
        "pass": ""
    }
};

exports.mailsettings = {
	"from": "HfTL Club <club@hft-leipzig.de>",
	"tplpath": require('path').dirname(process.mainModule.filename) + "/templates/email/"
};

//recipient for feedback emails
exports.feedbackmail = "ferdinand.malcher@hft-leipzig.de, mail@d-koppenhagen.de";

//list of all door keys
exports.doorkeys = ["26", "180", "181", "182", "183"];

//secret key for public (but protected) resources
exports.pubaccesskey = "abcdefg";