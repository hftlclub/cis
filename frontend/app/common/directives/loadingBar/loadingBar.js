angular.module('app.cis').directive('loadingBar', function() {
    return {
        restrict: 'E',
        require: 'show',
        scope: {
            show: '=',
        },
        templateUrl: 'app/common/directives/loadingBar/loadingBar.html'
    }
});
