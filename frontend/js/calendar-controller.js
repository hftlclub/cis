angular.module('app.cis').controller('CalendarController', function($scope, $rootScope, $http, clubAuth, appConf) {

    $scope.events = [];

    refresh();

    function refresh() {
        $http.get(appConf.api + '/calendar').
        success(function(data) {

            var events = [];

            var cals = ['public', 'internal'];

            for(var cal in cals){

                for(var i = 0; i < data[cals[cal]].length; i++){
                    var ev = data[cals[cal]][i];

                    events.push({
                        id: ev.uid,
                        text: ev.title,
                        start_date: new Date(ev.start),
                        end_date: new Date(ev.end)
                    });

                }
            }
            console.log(events);
            $scope.events = events;

        });
    }

});
