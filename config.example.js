//application port
exports.port = 3000;

//absolute root path
exports.abspath = require('path').dirname(process.mainModule.filename);

//session secret (random string)
exports.tokensecret = require('crypto').randomBytes(20).toString('hex');

//LDAP settings
exports.ldap = {
    "server": "10.12.114.138",
    "port": 389,
    "basedn": "dc=club,dc=hft-leipzig,dc=de",
    "userbase": "ou=users",
    "groupbase": "ou=groups",
    "admindn": "cn=admin,dc=club,dc=hft-leipzig,dc=de",
    "adminpw": ""
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
    "tplpath": exports.abspath + "/templates/email/"
};


exports.seafile = {
    token: 'abcdefg123456789',
    url: 'https://url.to.sf',
    usersuffix: '@hftl.club',
    groups: { //internal key : seafile group ID
        werbung: 1,
        vorstand: 2,
        technik: 3,
        finanzen: 4,
        allgemein: 5
    }
}


//recipient for feedback emails
exports.feedbackmail = "mail@ferdinand-malcher.de, mail@d-koppenhagen.de";

//list of all door keys
exports.doorkeys = ["26", "180", "181", "182", "183"];

//secret key for public (but protected) resources
exports.pubaccesskey = "abcdefg";

//settings for git webhook deployment
exports.deploykey = "hijklmnop";

//protocols PDF settings
exports.protocols = {
    bgJobInterval: 15, //interval [s] for background job checking
    bgJobActive: 0, //activate background job handler
    pdfFrontendPath: "/media/protocols/", //path in frontend folder for user generated PDF files
    pdfDeleteTimeout: 30 //timeout [s] for deletion of user generated PDF files
}
exports.protocols.pdfFullPath = exports.abspath + "/frontend" + exports.protocols.pdfFrontendPath


//ICS URLs to show in calendar
exports.ics = {
    "public": {
        "name": "Öffentlich",
        "url": "http://stura.hft-leipzig.de/events/club/events.ics"
    },
    "internal": {
        "name": "Intern",
        "url": "http://stura.hft-leipzig.de/events/club/events.ics"
    },
    "birthday": {
        "name": "Club-Geburtstage",
        "url": "http://stura.hft-leipzig.de/events/club/events.ics"
    },
    "stura": {
        "name": "Stura",
        "url": "http://stura.hft-leipzig.de/events/stura/events.ics"
    }
}
