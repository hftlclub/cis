clubAdminApp.directive('clubActiveState', function($location) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			var a = element.find('a');

			/* refresh, when location changed */
			scope.$on('$locationChangeSuccess', refresh);

			/* refresh, when href changed (ie by using ng-href) */
			scope.$watch( /* may impact performance */
				function(){ return a.attr('href') },
				function(){ refresh(); }
			);

			/* refresh on load */
			refresh();

			function refresh() {
				var curr = '#' + $location.path();
				var href = a.attr('href');
				if(curr.indexOf(href) == 0)
					attr.$addClass('active');
				else
					attr.$removeClass('active');

			}
		},

	}

});

clubAdminApp.directive('helpbox', function($location) {
	return {
		restrict: 'E',
		transclude: true,
		link: function(scope, element) {
			if(scope.active != 'true') scope.isCollapsed = true;
			else scope.isCollapsed = false;
		},
		scope: {
			active: '@'
		},
		templateUrl: 'templates/helpbox.html'
	}
});

clubAdminApp.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });
