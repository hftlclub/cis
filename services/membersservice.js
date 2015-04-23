var config = require('../config');
var userservice = require('../services/userservice');


//get all members
exports.getMembers = function(callback){
    userservice.getUsers(function(err, users){
	    if(err) return callback(err);

    var members = [];

		//desired attributes
		var attrs = ['username', 'firstname', 'lastname', 'tel', 'email', 'role', 'teamdrive', 'street', 'zip', 'city', 'former', 'honorary', 'alias', 'birthday', 'accessiondate'];

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
