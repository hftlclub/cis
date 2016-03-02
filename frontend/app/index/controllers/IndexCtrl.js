angular.module('app.cis').controller('IndexCtrl', function($location, clubAuth) {

    clubAuth.refresh().then(function(){}, function(){});

    if (clubAuth.user) {
        $location.path('/');
    } else {
        $location.path('/login');
    }

});
