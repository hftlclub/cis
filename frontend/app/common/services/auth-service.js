angular.module('app.cis').factory('clubAuth', function($http, $location, $rootScope, $q, $cookies, growl, appConf) {
    var clubAuth = {};

    $rootScope.clubAuth = clubAuth;

    clubAuth.refresh = function() {
        return $q(function(resolve, reject){
            $http.get(appConf.api + '/userdata').
            success(function(data) {
                clubAuth.user = data;
                $rootScope.$broadcast('clubAuthRefreshed');
                $rootScope.clubUser = data;

                if ($location.path() == '/login') $location.path('/');

                resolve();

            }).
            error(function(data, status) {
                clubAuth.user = {};
                $rootScope.$broadcast('clubAuthRefreshed');
                $rootScope.clubUser = {};

                if (!isPublicPage($location.path()))
                    $location.path('/login');

                reject();

            });
        });
    }

    clubAuth.logout = function() {
        $http.get(appConf.api + '/logout').
        success(function() {
            growl.success('Du wurdest abgemeldet!');
            clubAuth.refresh().then(function(){}, function(){});
        });
        $cookies.remove('accessToken');
        $http.defaults.headers.common['X-Access-Token'] = null;

        clubAuth.refresh().then(function(){}, function(){});
    }




    return clubAuth;

    function isPublicPage(path) {
        if (path == '/login' || (/keylist\/(.*)/.test(path)) || path == '/about') {
            return true;
        }
        return false;
    }

});
