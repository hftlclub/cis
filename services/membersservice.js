var ldapjs = require('ldapjs');
var ssha = require('ssha');
var smbhash = require('smbhash');
var moment = require('moment');
var ldap = require('../modules/ldap');
var config = require('../config');
var userservice = require('../services/userservice');






//get all members
exports.getmembers = function(callback){
    userservice.getUsers(function(err, users){
	    if(err) return callback(err);

		//desired attributes
		var attrs = ['username', 'firstname', 'lastname', 'tel', 'mail', 'role', 'teamdrive', 'street', 'zip', 'city', 'former', 'honorary', 'alias', 'birthday', 'accessiondate'];
	    
	    //go through array
	    for(var i = 0; i < users.length; i++){
		    //just pick club members
		    if(users[i].type != 'club'){
			    continue;
		    }
		    
		    var member = {};
		    
		    //go through desired attribites and just pick those - build the new member object
		    for(var k = 0; k < attrs.length; k++){
			    member[attrs[k]] = users[i][attrs[k]];
		    }
		    
		    members.push(member);
	    }
	    
	    
	    if(!members.length) return callback(null, false);
	    
	    return callback(null, members);
    });
}

