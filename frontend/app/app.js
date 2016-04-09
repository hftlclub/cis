angular.module('app.cis', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'ui.bootstrap.dropdown',
    'ui.bootstrap.modal',
    'ui.bootstrap.datepicker',
    'ui.ace',
    'ngAudio',
    'ngSanitize',
    'cfp.hotkeys',
    'angular-growl',
    'ngAnimate',
    'dhxScheduler'
]);


angular.module('app.cis').run(function($http, $cookies) {
    var token = $cookies.get('accessToken');
    $http.defaults.headers.common['X-Access-Token'] = token;
});


angular.module('app.cis').config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});
