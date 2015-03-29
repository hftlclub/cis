var xlsx = require('node-xlsx');
var moment = require('moment');
var config = require('../config');
var membersservice = require('../services/membersservice');



//list users function for superusers
exports.listmembers = function(req, res, next){
	membersservice.getMembers(function(err, members){
		if(err) return next(err);
		res.json(members).end();
	});
}




exports.makexlsx = function(req, res, next){
	membersservice.getMembers(function(err, members){
		if(err) return next(err);
		
		//column headers
		var data = [['Nachname', 'Vorname', 'E-Mail', 'Spitzname', 'Telefon', 'Status', 'Position', 'Vereinsbeitritt', 'Ehrenmitglied', 'Teamdrive']];
		
		for(var i = 0; i < members.length; i++){
			var status = (members[i].former) ? 'ehemalig' : 'aktiv';
			var honorary = (members[i].honorary) ? 'x' : '';
			
			data.push([
				members[i].lastname,
				members[i].firstname,
				members[i].email,
				(members[i].alias) ? members[i].alias : '',
				(members[i].tel) ? members[i].tel : '',
				status,
				members[i].role,
				(members[i].accessiondate) ? moment(members[i].accessiondate).format('DD.MM.YYYY') : '',
				honorary,
				(members[i].teamdrive) ? members[i].teamdrive : '',
			]);
		}
		
		
		var buffer = xlsx.build([{name: 'Mitgliederliste', data: data}]);
		res.send(buffer);
	});
}


