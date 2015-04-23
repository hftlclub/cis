var express          = require('express');
var expressValidator = require('express-validator');
var bodyParser       = require('body-parser');
var cors             = require('cors');

var app = express();
var api = express.Router();


var config = require('./config');

var authController       = require('./controllers/auth');
var usermanageController = require('./controllers/usermanage');
var membersController    = require('./controllers/members');
var settingsController   = require('./controllers/settings');
var feedbackController   = require('./controllers/feedback');
var keylistController    = require('./controllers/keylist');


var jwtauth      = require('./middleware/jwtauth')
var requireAuth  = require('./middleware/requireauth');
var requireSu    = require('./middleware/requiresu');
var requireClub  = require('./middleware/requireclub');
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
api.post('/login', authController.login);
api.post('/feedback', feedbackController.sendFeedback);
api.get('/userdata', jwtauth, requireAuth, function(req, res){
    res.json(req.user);
});

api.post('/login/external/:type', authController.externallogin);

//user settings
api.post('/settings/changepassword', jwtauth, requireAuth, settingsController.changepassword);
api.put('/settings/profile', jwtauth, requireAuth, settingsController.changeprofile);

api.get('/members', jwtauth, requireAuth, requireClub, membersController.listmembers);
api.get('/members/xlsx', jwtauth, requireAuth, requireClub, membersController.makexlsx);


//superuser actions
api.get('/user', jwtauth, requireAuth, requireSu, usermanageController.listusers);
api.post('/user', jwtauth, requireAuth, requireSu, usermanageController.adduser);
api.get('/user/:uid', jwtauth, requireAuth, requireSu, usermanageController.getuser);
api.put('/user/:uid', jwtauth, requireAuth, requireSu, usermanageController.edituser);
api.delete('/user/:uid', jwtauth, requireAuth, requireSu, usermanageController.deleteuser);
api.get('/user/:uid/resetPw', jwtauth, requireAuth, requireSu, usermanageController.resetPassword);

api.get('/keylist', jwtauth, requireAuth, requireSu, keylistController.getDoorKeyList);







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
