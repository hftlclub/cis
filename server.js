var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cors = require('cors');

var log = require('./modules/log');

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
var calendarController = require('./controllers/calendar');

var protocolspdf = require('./modules/protocolspdf');


var jwtauth = require('./middleware/jwtauth')
var reqm = require('./middleware/requiremode');
var errorhandler = require('./middleware/errorhandler');
var nocache = require('./middleware/nocache');


api.use(cors({ origin: '*' }));
api.use(nocache);
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator({
    customValidators: {
        error: function (value, error) {
            return !error;
        }
    }
}));


/****************************************
	ROUTES
*****************************************/

//generic routes
api.get('/', function(req, res) { res.send('CIS API') });
api.post('/login', authController.login);
api.get('/logout', authController.logout);
api.post('/feedback', feedbackController.sendFeedback);
api.get('/userdata', jwtauth, reqm('auth'), function (req, res) {
    res.json(req.user);
});

api.post('/login/external/:type', authController.externallogin);

//user settings
api.post('/settings/changepassword', jwtauth, reqm('auth'), settingsController.changepassword);
api.put('/settings/profile', jwtauth, reqm('auth'), settingsController.changeprofile);

api.get('/members', jwtauth, reqm('auth'), reqm('club'), membersController.listmembers);
//api.get('/members/xlsx', jwtauth, reqm('auth'), reqm('club'), membersController.makexlsx);


//protocols
api.get('/protocols', jwtauth, reqm('auth'), reqm('club'), protocolsController.list);
api.get('/protocols/raw/:id', jwtauth, reqm('auth'), reqm('club'), protocolsController.get); //raw view
api.get('/protocols/detail/:id', jwtauth, reqm('auth'), reqm('club'), protocolsController.getDetail); //detailed view with HTML
api.post('/protocols', jwtauth, reqm('auth'), reqm('club'), protocolsController.addedit); //add
api.put('/protocols/:id', jwtauth, reqm('auth'), reqm('club'), protocolsController.addedit); //edit
api.delete('/protocols/:id', jwtauth, reqm('auth'), reqm('club'), protocolsController.del);
api.get('/protocols/pdf/:id', jwtauth, reqm('auth'), reqm('club'), protocolsController.pdf); //PDF file as HTTP attachment



//superuser actions
api.get('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.listusers);
api.post('/user', jwtauth, reqm('auth'), reqm('su'), usermanageController.adduser);
api.get('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.getuser);
api.put('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.edituser);
api.delete('/user/:uid', jwtauth, reqm('auth'), reqm('su'), usermanageController.deleteuser);
api.get('/user/:uid/resetPw', jwtauth, reqm('auth'), reqm('su'), usermanageController.resetPassword);

api.get('/keylist', jwtauth, reqm('auth'), reqm('club'), keylistController.getDoorKeyList);
api.get('/keylist/:accesskey', reqm('pubaccess'), keylistController.getDoorKeyList);


//calendar
api.get('/calendar', jwtauth, reqm('auth'), reqm('club'), calendarController.listEvents);
api.get('/calendar/urls', jwtauth, reqm('auth'), reqm('club'), calendarController.getUrls);


api.post('/deploy/:key', deployController.deploy);


//error handling
api.use(errorhandler.validation);
api.use(errorhandler.generic);


// final 404 route
api.all('*', function (req, res) {
    res.send('NOT FOUND', 404);
});






//assign api router to /api
app.use('/api', api);

//static frontend
app.use('/', express.static(__dirname + '/frontend'));

//forward everything to index.html for SPA
app.get('*', function(req, res, next){
    res.sendFile(__dirname + '/frontend/index.html');
});

//start protocols PDF job handler
//protocolspdf.startTimer();




//start server
app.listen(config.port, function (err) {
    log.info('CIS Server started on port ', config.port);
});
