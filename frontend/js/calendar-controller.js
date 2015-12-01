angular.module('app.cis').controller('CalendarController', function ($scope, $rootScope, $http, clubAuth, $uibModal, appConf) {

    $scope.events = [];
    $scope.scheduler = { date: new Date(), mode: 'month' };
    $scope.onEventClick = onEventClicked;
    refresh();

    function refresh() {
        $http.get(appConf.api + '/calendar').
            success(function (data) {
                var events = [];
                //var cals = ['public', 'internal'];
                var pseudoEventId = 0;
                for (var cals in data) {
                    for (var i = 0; i < data[cals].events.length; i++) {
                        pseudoEventId++;
                        var ev = data[cals].events[i];
                        events.push({
                            id: pseudoEventId,
                            text: ev.title,
                            calendar: data[cals].name,
                            start_date: new Date(ev.start),
                            end_date: new Date(ev.end),
                            description: ev.description
                        });
                    }
                }
                $scope.events = events;
            });
    }

    function onEventClicked(eventId) {
        angular.forEach($scope.events, function (event) {
            if (event.id === eventId) {
                var modal = $uibModal.open({
                    templateUrl: 'templates/calendar/detailsmodal.html',
                    controller: 'CalendarDetailsController',
                    resolve: {
                        event: function() {
                            return event;
                        }
                    }
                });
            }
        });
    }


});




angular.module('app.cis').controller('CalendarDetailsController', function($scope, $modalInstance, event) {
    $scope.event = event;
    console.log(event);

    $scope.close = function() {
        $modal.close();
    };
});
