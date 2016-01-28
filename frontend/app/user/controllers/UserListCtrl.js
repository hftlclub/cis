angular.module('app.cis').controller('UserListCtrl', function($scope, $rootScope, $http, $routeParams, clubAuth, $uibModal, growl, appConf) {
    $scope.listFilter = '';

    $scope.users = {};
    $scope.users.data = null;
    $scope.users.remove = remove;
    $scope.users.resetpw = resetpw;
    $scope.loading = true;

    refresh();



    /*** functions ***/

    function refresh() {
        $scope.loading = true;

        $http.get(appConf.api + '/user').
        success(function(data) {
            $scope.users.data = data;
            $scope.loading = false;
        });
    }

    function remove(user) {
        var modal = $uibModal.open({
            templateUrl: 'app/user/templates/deletemodal.html',
            controller: 'ModalUserDelCtrl',
            resolve: {
                user: function() {
                    return $rootScope.user = user;
                }
            }
        });

        modal.result.then(function() {
            $http.delete(appConf.api + '/user/' + user.username)
                .success(function(data) {
                    growl.success('Der Nutzer ' + user.username + ' wurde erfolgreich entfernt.');
                    refresh();
                });
        });


    }




    function resetpw(user) {
        var modal = $uibModal.open({
            templateUrl: 'app/user/templates/passwordresetmodal.html',
            controller: 'ModalResetPasswordCtrl',
            resolve: {
                user: function() {
                    return $rootScope.user = user;
                }
            }
        });

        modal.result.then(function() {
            $http.get(appConf.api + '/user/' + user.username + '/resetPw')
                .success(function() {
                    growl.success('Passwort wurde zurückgesetzt.');
                });
        });

    }


});
