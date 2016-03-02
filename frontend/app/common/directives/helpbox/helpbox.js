angular.module('app.cis').directive('helpbox', function() {
    return {
        restrict: 'E',
        transclude: true,
        require: '?label',
        link: function(scope, element) {
            if (scope.active != 'true') scope.isCollapsed = true;
            else scope.isCollapsed = false;
        },
        scope: {
            active: '@',
            label: '@',
        },
        templateUrl: 'app/common/directives/helpbox/helpbox.html'
    }
});
