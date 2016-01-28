angular.module('app.cis').controller('ModalFeedbackCtrl', function($scope, $rootScope, $modalInstance) {
    $scope.data = {};
    $scope.nameSet = false;

    //fill in name if user is logged in
    if ($rootScope.clubUser.firstname && $rootScope.clubUser.lastname) {
        $scope.data.name = $rootScope.clubUser.firstname + " " + $rootScope.clubUser.lastname;
        $scope.nameSet = true;
    }

    $scope.ok = function() {
        $uibModal.close();
    };
    $scope.cancel = function() {
        $uibModal.dismiss('cancel');
    };
});
