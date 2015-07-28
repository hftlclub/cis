angular.module('app.cis').factory('clubAuth', function($http, $location, $rootScope, appConf) {
    var clubAuth = {};

    $rootScope.clubAuth = clubAuth;

    clubAuth.refresh = function() {
        return new Promise(function(resolve, reject){
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
            clubAuth.refresh();
        });
        localStorage.removeItem('accessToken');
        $http.defaults.headers.common['X-Access-Token'] = null;
        clubAuth.refresh();
    }

    /*$rootScope.$on('$locationChangeStart', function() {
        clubAuth.refresh();
    });*/



    return clubAuth;

    function isPublicPage(path) {
        if (path == '/login' || (/keylist\/(.*)/.test(path)) || path == '/about') {
            return true;
        }
        return false;
    }

});
