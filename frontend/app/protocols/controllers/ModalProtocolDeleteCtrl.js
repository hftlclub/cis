// delete modal
angular.module('app.cis').controller('ModalProtocolDeleteCtrl', function ($scope, $rootScope, $modalInstance, protocol) {
    $scope.protocol = protocol;
    $scope.checkWord = $rootScope.getCheckWord();

    // check if input is the same like the give phrase
    $scope.checkInput = function () {
        if ($scope.checkWord == $scope.inputCheckWord) {
            $modalInstance.close('success');
        }
    };
});
