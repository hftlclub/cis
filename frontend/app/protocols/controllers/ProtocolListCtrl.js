// controller for protocol list
angular.module('app.cis').controller('ProtocolListCtrl', function ($scope, $http, $routeParams, clubAuth, $uibModal, $location, growl, appConf) {
    $scope.protocols = [];
    $scope.years = [];
    refresh();

    /*** functions ***/

    function refresh() {
        $http.get(appConf.api + '/protocols?grouped').success(function (data) {
            $scope.protocols = data;
            $scope.years = Object.keys(data);
        });
    }

    // function to open delete modal
    $scope.deleteProtocol = function (prot) {

        var modal = $uibModal.open({
            templateUrl: 'app/protocols/templates/deletemodal.html',
            controller: 'ModalProtocolDeleteCtrl',
            resolve: {
                protocol: function () {
                    return prot;
                }
            }
        });

        modal.result.then(function () {
            $http.delete(appConf.api + '/protocols/' + prot.id).
                success(function() {
                  refresh();
                  growl.success('Das Protokoll wurde gelöscht.');
                });
        });
    }

    $scope.showProtocol = function (id) {
        $location.path('protocols/show/' + id);
    }

});
