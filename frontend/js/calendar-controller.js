angular.module('app.cis').controller('CalendarController', function ($scope, $rootScope, $http, clubAuth, appConf) {

    $scope.events = [];
    $scope.scheduler = { date: new Date(), mode: 'month' };
    $scope.onEventClick = function (event) { console.log(event); };
    refresh();

    function refresh() {
        $http.get(appConf.api + '/calendar').
            success(function (data) {
                var events = [];
                var cals = ['public', 'internal'];
                var pseudoEventId = 0;
                for (var cal in cals) {
                    for (var i = 0; i < data[cals[cal]].length; i++) {
                        pseudoEventId++;
                        var ev = data[cals[cal]][i];
                        events.push({
                            id: pseudoEventId,
                            text: ev.title,
                            start_date: new Date(ev.start),
                            end_date: new Date(ev.end)
                        });
                    }
                }
                $scope.events = events;
            });
    }

    $scope.eventClicked = function (id) {
        alert('event ' + id + ' clicked');
    }
});
