angular.module('app.cis', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.dropdown',
    'ui.bootstrap.modal', 'ui.bootstrap.datepicker', 'ui.ace', 'ngAudio', 'ngSanitize', 'cfp.hotkeys', 'angular-growl', 'ngAnimate', 'datatables'
]);


angular.module('app.cis').run(function($http) {
    var token = (localStorage.getItem('accessToken')) ? localStorage.getItem('accessToken') : null;
    // angular ajax requests:
    $http.defaults.headers.common['X-Access-Token'] = token;
    // jQuery ajax request are used by dataTables: 
    $.ajaxSetup({
    beforeSend: function (xhr)
    {
       xhr.setRequestHeader('X-Access-Token',token);   
    }
});
});