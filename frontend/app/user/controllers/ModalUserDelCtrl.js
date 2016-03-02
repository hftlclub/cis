angular.module('app.cis').controller('ModalUserDelCtrl', function($scope, $modalInstance, user) {
    $scope.ok = function() {
        $modal.close(user);
    };
    $scope.cancel = function() {
        $modal.dismiss('cancel');
    };
});
