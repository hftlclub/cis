var errors = require('common-errors');
var config = require('../config');
var ldap = require('../modules/ldap');
var userservice = require('../services/userservice');



exports.changepassword = function(req, res, next){
	//all values set?
	if(!req.body.oldPassword || !req.body.newPassword1 || !req.body.newPassword2){
		var verrors = new errors.ValidationError();
		
		if(!req.body.oldPassword){
			verrors.addError(new errors.ValidationError('Old password not set', 'missing', 'oldPassword'));
		}
		
		if(!req.body.newPassword1){
			verrors.addError(new errors.ValidationError('New password not set', 'missing', 'newPassword1'));
		}
		
		if(!req.body.newPassword2){
			verrors.addError(new errors.ValidationError('New password repeat not set', 'missing', 'newPassword2'));
		}
		
		return next(verrors);
	}


	//new passwords identical?
	if(req.body.newPassword1 != req.body.newPassword2){
		return next(new errors.ValidationError('New passwords not identical', 'notidentical', 'newPassword1'));
	}
	
	//is old password correct?
	userservice.checkpassword(req.user.username, req.body.oldPassword, function(err, success){
		if(err) return next(err);
		if(!success) return next(new errors.ValidationError('Old password not correct', 'invalid', 'oldPassword'));
		
		
		//SET new password!
		userservice.setPassword(req.user.username, req.body.newPassword1, function(err){
			if(err) return next(err);
			res.end();
		});
		
		
	});

}