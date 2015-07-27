angular.module('app.cis').controller('KeyListController', function($scope, $rootScope, $http, $routeParams, clubAuth, appConf) {
    $scope.listFilter = '';

    $scope.members = {};
    $scope.members.data = null;

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.keys = appConf.doorKeyList;

    refresh();

    function refresh() {
        $http.get(appConf.api + '/keylist').
        success(function(data) {
            $scope.members.data = data;
        });
    }

    $scope.date = new Date();

});




angular.module('app.cis').controller('PublicKeyListController', function($scope, $http, $routeParams, appConf) {

    $scope.members = {};
    $scope.members.data = null;

    $scope.keys = appConf.doorKeyList;
    //$scope.isSuperuser = false;
    $scope.isPublic = true;

    refresh();

    function refresh() {
        $http.get(appConf.api + '/keylist/' + $routeParams.accesskey).
        success(function(data) {
            $scope.members.data = data;
        });
    }

    $scope.date = new Date();

});
