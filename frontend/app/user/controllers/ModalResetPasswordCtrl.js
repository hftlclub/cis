angular.module('app.cis').controller('ModalResetPasswordCtrl', function($scope, $modalInstance, user) {
    $scope.ok = function() {
        $modal.close(user);
    };
    $scope.cancel = function() {
        $modal.dismiss('cancel');
    };
});
