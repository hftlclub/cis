angular.module('app.cis', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.dropdown',
    'ui.bootstrap.modal', 'ui.bootstrap.datepicker', 'ui.ace', 'ngAudio', 'ngSanitize', 'cfp.hotkeys', 'angular-growl', 'ngAnimate', 'datatables'
]);


angular.module('app.cis').run(function($http) {
    var token = (localStorage.getItem('accessToken')) ? localStorage.getItem('accessToken') : null;
    $http.defaults.headers.common['X-Access-Token'] = token;
});