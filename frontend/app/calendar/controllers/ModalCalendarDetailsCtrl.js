angular.module('app.cis').controller('ModalCalendarDetailsCtrl', function($scope, $modalInstance, event) {
    $scope.event = event;

    $scope.close = function() {
        $modal.close();
    };
});
