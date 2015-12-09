angular.module('app.cis').controller('CalendarController', function ($scope, $rootScope, $http, clubAuth, $uibModal, appConf) {
    $scope.loading = false;

    $scope.events = []; //array of all events
    $scope.data = null; //events as got from API
    $scope.cals = {}; //calendars and whether to show them or not

    $scope.scheduler = { date: new Date(), mode: 'month' };
    $scope.onEventClick = onEventClick;
    refresh();


    function parseEvents(data){
        var events = [];
        var pseudoEvId = 1;
        for(var key in data){
            //skip this step if cal key is unknown or has been set 0 (dont display)
            if(!($scope.cals.hasOwnProperty(key) && $scope.cals[key] == 1)){
                continue;
            }

            for (var i = 0; i < data[key].events.length; i++) {
                var ev = data[key].events[i];

                events.push({
                    id: pseudoEvId++,
                    text: ev.title,
                    cal: key,
                    start_date: new Date(ev.start),
                    end_date: new Date(ev.end),
                    description: ev.description
                });
            }
        }

        return events;
    }


    function refresh() {
        // show loading bar
        $scope.loading = true;

        $http.get(appConf.api + '/calendar').
            success(function (data) {
                //gather all cal keys in $scope.cals and let them being shown (1)
                for(var key in data){
                    $scope.cals[key] = 1;
                }

                $scope.data = data;

                $scope.events = parseEvents(data);

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
