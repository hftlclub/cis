angular.module('app.cis').controller('CalendarController', function ($scope, $rootScope, $http, clubAuth, appConf) {

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
                            end_date: new Date(ev.end)
                        });
                    }
                }
                $scope.events = events;
            });
    }

    function onEventClicked(eventId) {
        angular.forEach($scope.events, function (event) {
            if (event.id === eventId) {
                alert('event ' + event.text + ' clicked');
            }
        });
    }
});
