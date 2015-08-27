var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
var api = express.Router();


var config = require('./config');

var authController = require('./controllers/auth');
var usermanageController = require('./controllers/usermanage');
var membersController = require('./controllers/members');
var settingsController = require('./controllers/settings');
var feedbackController = require('./controllers/feedback');
var keylistController = require('./controllers/keylist');
var protocolsController = require('./controllers/protocols');
var deployController = require('./controllers/deploy');


var jwtauth = require('./middleware/jwtauth')
var reqm = require('./middleware/requiremode');
var errorhandler = require('./middleware/errorhandler');


api.use(cors({
    origin: '*'
}));
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
api.get('/userdata', jwtauth, reqm('auth'), function(req, res) {
    res.json(req.user);
});

api.post('/login/external/:type', authController.externallogin);

//user settings
api.post('/settings/changepassword', jwtauth, reqm('auth'), settingsController.changepassword);
api.put('/settings/profile', jwtauth, reqm('auth'), settingsController.changeprofile);

api.get('/members', jwtauth, reqm('auth'), reqm('club'), membersController.listmembers);
api.get('/members/xlsx', jwtauth, reqm('auth'), reqm('club'), membersController.makexlsx);


//protocols
api.get('/protocols', jwtauth, reqm('auth'), protocolsController.list);
api.get('/protocols/raw/:id', jwtauth, reqm('auth'), protocolsController.get); //raw view
api.get('/protocols/detail/:id', jwtauth, reqm('auth'), protocolsController.getDetail); //detailed view with HTML
api.post('/protocols', jwtauth, reqm('auth'), protocolsController.addedit); //add
api.put('/protocols/:id', jwtauth, reqm('auth'), protocolsController.addedit); //edit
api.delete('/protocols/:id', jwtauth, reqm('auth'), protocolsController.del);



//superuser actions
api.get('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.listusers);
api.post('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.adduser);
api.get('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.getuser);
api.put('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.edituser);
api.delete('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.deleteuser);
api.get('/user/:uid/resetPw', jwtauth, reqm('auth'), reqm('su'), usermanageController.resetPassword);

api.get('/keylist', jwtauth, reqm('auth'), reqm('club'), keylistController.getDoorKeyList);
api.get('/keylist/:accesskey', reqm('pubaccess'), keylistController.getDoorKeyList);



api.post('/deploy/:key', deployController.deploy);




//error handling
api.use(errorhandler.validation);
api.use(errorhandler.generic);


//assign api router to /api
app.use('/api', api);


//static frontend
app.use(express.static(__dirname + '/frontend'));


//start server
app.listen(config.port, function(err) {
    console.log('Club Admin started on port ' + config.port);
});
