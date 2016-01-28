angular.module('app.cis').controller('KeyListCtrl', function($scope, $rootScope, $http, clubAuth, appConf) {
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
