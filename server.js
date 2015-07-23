var express          = require('express');
var expressValidator = require('express-validator');
var bodyParser       = require('body-parser');
var cors             = require('cors');
var exec             = require('child_process').exec

var app = express();
var api = express.Router();


var config = require('./config');

var authController       = require('./controllers/auth');
var usermanageController = require('./controllers/usermanage');
var membersController    = require('./controllers/members');
var settingsController   = require('./controllers/settings');
var feedbackController   = require('./controllers/feedback');
var keylistController    = require('./controllers/keylist');
var protocolsController  = require('./controllers/protocols');


var jwtauth      = require('./middleware/jwtauth')
var reqm         = require('./middleware/requiremode');
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
api.get('/logout', authController.logout);
api.post('/feedback', feedbackController.sendFeedback);
api.get('/userdata', jwtauth, reqm('auth'), function(req, res){
    res.json(req.user);
});

api.post('/login/external/:type', authController.externallogin);

//user settings
api.post('/settings/changepassword', jwtauth, reqm('auth'), settingsController.changepassword);
api.put('/settings/profile', jwtauth, reqm('auth'), settingsController.changeprofile);

api.get('/members', jwtauth, reqm('auth'), reqm('club'), membersController.listmembers);
api.get('/members/xlsx', jwtauth, reqm('auth'), reqm('club'), membersController.makexlsx);


//protocols
api.get('/protocols', jwtauth, reqm('auth'),protocolsController.list);
api.post('/protocols', jwtauth, reqm('auth'), protocolsController.add);
api.get('/protocols/:id', jwtauth, reqm('auth'), protocolsController.get);
//api.put('/protocols/:id', jwtauth, reqm('auth'), protocolsController.edit);
//api.delete('/protocols/:id', jwtauth, reqm('auth'), protocolsController.delete);



//superuser actions
api.get('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.listusers);
api.post('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.adduser);
api.get('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.getuser);
api.put('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.edituser);
api.delete('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.deleteuser);
api.get('/user/:uid/resetPw', jwtauth, reqm('auth'), reqm('su'), usermanageController.resetPassword);

api.get('/keylist', jwtauth, reqm('auth'), reqm('su'), keylistController.getDoorKeyList);
api.get('/keylist/:accesskey', reqm('pubaccess'), keylistController.getDoorKeyList);



api.post('/deploy/:key', function(req, res, next){
	console.log('Deploy Webhook fired');

	//check for deploy key
	if(req.params.key != config.deploykey){
		console.log('Invalid deploy key:', req.params.key);
		return next(new Error('Invalid deploy key'));
	}

	//only pull when master changed
        if(req.body.ref != 'refs/heads/' + config.branch){
                console.log(req.body.ref);
		return res.send('Nothing to do here');
        }

	//PULL!
	exec('cd ' + __dirname + ' && git pull origin ' + config.branch, function(error, stdout, stderr){
		console.log(error, stdout, stderr);
		res.send(stdout + stderr);
	});
});




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
