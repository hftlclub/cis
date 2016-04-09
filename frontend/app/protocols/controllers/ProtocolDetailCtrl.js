// controller for protocol details
angular.module('app.cis').controller('ProtocolDetailCtrl', function ($scope, $http, $routeParams, $window, $document, $timeout, $location, $uibModal, clubAuth, growl, appConf) {
    $scope.loading = false;
    refresh();
    /*** functions ***/

    $scope.pdf = {
        processing: 0,
        processed: 0,
        path: null,
        delTimer: null,
        generate: function(id){
            $scope.pdf.processing = 1;

            $http.get(appConf.api + '/protocols/pdf/' + id).then(function(res){
                //change view flags
                $scope.pdf.processing = 0;
                $scope.pdf.processed = 1;

                //add path to link
                if(res.data.pdf) $scope.pdf.path = res.data.pdf;

                //after PDF deletion timeout reset button
                $scope.pdf.delTimer = $timeout($scope.pdf.reset, ((res.data.delTimeout - 2) * 1000));

            }, function(){ //on error: reset button
                $scope.pdf.reset();
            });
        },
        reset: function(){
            $scope.pdf.processed = 0;
            $scope.pdf.processing = 0;
            $scope.pdf.path = 0;
            $timeout.cancel($scope.pdf.delTimer);
        }
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
                  growl.success('Das Protokoll wurde gelöscht.');
                  $location.path('/protocols')
                });
        });
    }


    function refresh() {
        $scope.loading = true;
        var protid = $routeParams.id;

        $http.get(appConf.api + '/protocols/detail/' + protid).success(function (data) {
            $scope.protocol = data;
            $scope.protocol.id = protid;
            $scope.loading = false;
        });
    }
});
