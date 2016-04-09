angular.module('app.cis').directive('navActiveState', function($location) {
    return {
        restrict: 'AC',
        link: function(scope, element, attr) {
            var a = element.find('a');

            /* refresh, when location changed */
            scope.$on('$locationChangeSuccess', refresh);

            /* refresh, when href changed (ie by using ng-href) */
            scope.$watch( /* may impact performance */
                function() {
                    return a.attr('href')
                },
                function() {
                    refresh();
                }
            );

            /* refresh on load */
            refresh();

            function refresh() {
                var curr = $location.path();
                var href = a.attr('href');
                if (curr.indexOf(href) == 0)
                    attr.$addClass('active');
                else
                    attr.$removeClass('active');

            }
        },

    }

});



angular.module('app.cis').directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });

                event.preventDefault();
            }
        });
    };
});



angular.module('app.cis').directive('scroll', function($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind('scroll', function() {
            if (this.pageYOffset >= 800) { // distance from top
                scope.boolChangeClass = true;
            } else {
                scope.boolChangeClass = false;
            }
            scope.$apply();
        });
    };
});
