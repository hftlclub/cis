var config = require('../config');
var userservice = require('../services/userservice');




//get all door permissions
exports.getDoorKeyList = function(callback) {
    userservice.getUsers(function(err, users) {
        if (err) return callback(err);

        var rows = [];

        //desired attributes
        var attrs = ['username', 'firstname', 'lastname', 'keyPermissions'];

        //go through array
        for (var i = 0; i < users.length; i++) {
            var row = {};

            //go through key permissions and check whether there are any
            /*var haspermissions = false;
		    for(var key in users[i].keyPermissions){
			    if(users[i].keyPermissions.hasOwnProperty(key)){
				    haspermissions = true;
				    break;
				}
		    }
		    if(!haspermissions) continue; //skip users without key permissions
		    */
            if (!Object.keys(users[i].keyPermissions).length) {
                continue; //skip users without key permissions
            }


            //go through desired attribites and just pick those - build the new row object
            for (var k = 0; k < attrs.length; k++) {
                row[attrs[k]] = users[i][attrs[k]];
            }

            rows.push(row);
        }


        if (!rows.length) return callback(null, false);

        return callback(null, rows);
    });
}
