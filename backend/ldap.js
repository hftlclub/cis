var ldapjs = require('ldapjs');
var config = require('./config');

function LDAPConn(binddn, password){
    this.client = ldapjs.createClient({
        url: 'ldap://' + config.ldap.server + ':' + config.ldap.port
    });

    this.binddn   = binddn;
    this.password = password;

    this.bind = function(){
        this.client.bind(this.binddn, this.password, function(err){
                if(err) return false;
                return true;
        });
    }
}
