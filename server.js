var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jwt-simple');
var cors = require('cors');

var app = express();
var api = express.Router();

var ldap = require('./modules/ldap');
var config = require('./config');

var auth       = require('./controllers/auth');
var usermanage = require('./controllers/usermanage');
var members = require('./controllers/members');
var settings   = require('./controllers/settings');
var feedback   = require('./controllers/feedback');


var jwtauth      = require('./middleware/jwtauth')
var requireAuth  = require('./middleware/requireauth');
var requireSu    = require('./middleware/requiresu');
var requireClub    = require('./middleware/requireclub');
var errorhandler = require('./middleware/errorhandler');


api.use(cors({ origin: '*' }));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator({
	customValidators: {
		error: function(value, error) {
			return !error;
    	}
	}   
}));


/****************************************
	ROUTES
*****************************************/

//generic routes
api.post('/login', auth.login);
api.post('/feedback', feedback.sendFeedback);
api.get('/userdata', jwtauth, requireAuth, function(req, res){
    res.json(req.user);
});

api.post('/login/external/:type', auth.externallogin);

//user settings
api.post('/settings/changepassword', jwtauth, requireAuth, settings.changepassword);
api.put('/settings/profile', jwtauth, requireAuth, settings.changeprofile);

api.get('/members', jwtauth, requireAuth, requireClub, members.listmembers);
api.get('/members/xlsx', jwtauth, requireAuth, requireClub, members.makexlsx);


//superuser actions
api.get('/user', jwtauth, requireAuth, requireSu, usermanage.listusers);
api.post('/user', jwtauth, requireAuth, requireSu, usermanage.adduser);
api.get('/user/:uid', jwtauth, requireAuth, requireSu, usermanage.getuser);
api.put('/user/:uid', jwtauth, requireAuth, requireSu, usermanage.edituser);
api.delete('/user/:uid', jwtauth, requireAuth, requireSu, usermanage.deleteuser);
api.get('/user/:uid/resetPw', jwtauth, requireAuth, requireSu, usermanage.resetPassword);






//error handling
api.use(errorhandler.validation);
api.use(errorhandler.generic);


//assign api router to /api
app.use('/api', api);


//static frontend
app.use(express.static(__dirname + '/frontend'));


//start server
app.listen(config.port, function(err){
    console.log('Club Admin started on port ' + config.port);
});
