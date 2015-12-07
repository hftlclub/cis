angular.module('app.cis').controller('CalendarController', function ($scope, $rootScope, $http, clubAuth, $uibModal, appConf) {
    $scope.loading = false;

    $scope.events = [];
    $scope.scheduler = { date: new Date(), mode: 'month' };
    $scope.onEventClick = onEventClick;
    refresh();

    function refresh() {
        // show loading bar
        $scope.loading = true;

        $http.get(appConf.api + '/calendar').
            success(function (data) {
                var events = [];
                for (var i = 0; i < data.length; i++) {
                    var ev = data[i];

                    events.push({
                        id: (i + 1),
                        text: ev.title,
                        cal: ev.cal,
                        start_date: new Date(ev.start),
                        end_date: new Date(ev.end),
                        description: ev.description
                    });
                }

                $scope.events = events;

                // hide loading bar
                $scope.loading = false;
            });
    }

    function onEventClick(eventId) {
        var modal = $uibModal.open({
            templateUrl: 'templates/calendar/detailsmodal.html',
            controller: 'CalendarDetailsController',
            resolve: {
                event: function() {
                    return $scope.events[(eventId - 1)];
                }
            }
        });
    }


});




angular.module('app.cis').controller('CalendarDetailsController', function($scope, $modalInstance, event) {
    $scope.event = event;

    $scope.close = function() {
        $modal.close();
    };
});
