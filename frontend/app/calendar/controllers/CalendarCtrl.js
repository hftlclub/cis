angular.module('app.cis').controller('CalendarCtrl', function ($scope, $rootScope, $http, clubAuth, $uibModal, appConf) {
    $scope.loading = false;

    $scope.events = []; //array of all events
    $scope.data = null; //events as got from API
    $scope.cals = {}; //calendars and whether to show them or not

    $scope.scheduler = { date: new Date(), mode: 'month' };
    $scope.onEventClick = onEventClick;
    refresh();



    //watch on changes of cal display information
    $scope.$watch('cals', function(){
        $scope.events = parseEvents($scope.data);
    }, true);


    //make array of events from "data", depending on whether cal should be displayed or not
    function parseEvents(data){
        var events = [];

        var pseudoEvId = 1;
        for(var key in data){
            //skip this step if cal key is unknown or display has been set 0
            if(!($scope.cals.hasOwnProperty(key) && $scope.cals[key])){
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

        $http.get(appConf.api + '/calendar').success(function (data) {
            //gather all cal keys in $scope.cals and allow them to be showed (true)
            for(var key in data){
                $scope.cals[key] = data[key].checkedByDefault;
            }
            $scope.data = data;

            $scope.events = parseEvents(data);

            // hide loading bar
            $scope.loading = false;
            });
    }

    function onEventClick(eventId) {
        var modal = $uibModal.open({
            templateUrl: 'app/calendar/templates/detailsmodal.html',
            controller: 'ModalCalendarDetailsCtrl',
            resolve: {
                event: function() {
                    return $scope.events[(eventId - 1)];
                }
            }
        });
    }


});
