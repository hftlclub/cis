angular.module('app.cis').controller('PublicKeyListCtrl', function($scope, $http, $routeParams, appConf) {
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
