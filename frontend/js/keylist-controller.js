angular.module('app.cis').controller('KeyListController', function($scope, $rootScope, $http, clubAuth, appConf) {
    $scope.loading = false;
    $scope.listFilter = '';
    $scope.date = new Date();

    $scope.members = {};
    $scope.members.data = null;

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.keys = appConf.doorKeyList;

    refresh();

    function refresh() {
        $scope.loading = true;
        $http.get(appConf.api + '/keylist').success(function(data) {
            $scope.members.data = data;
            $scope.loading = false;
        });
    }



});




angular.module('app.cis').controller('PublicKeyListController', function($scope, $http, $routeParams, appConf) {
    $scope.date = new Date();
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

});
