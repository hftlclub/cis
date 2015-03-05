
var clubAdminApp = angular.module('clubAdminApp', ['ngRoute', 'ui.bootstrap', 'ui.bootstrap.dropdown',
		'ui.bootstrap.modal', 'ui.bootstrap.datepicker']);

/* hack to fix autofill bug (firefox triggers no event on autofilling forms) */
function fixAutofillBug() {
	$( 'input[ng-model], select[ng-model]' ).each( function() {
		angular.element( this ).controller( 'ngModel' ).$setViewValue( $( this ).val() );
	});
}

clubAdminApp.controller('MainController', function ($scope, $route, $routeParams,
			$location, $interval, clubAuth, $timeout) {
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;

	$scope.nav = {
		templateUrl: null,
		logout: clubAuth.logout,
		name: null,
	};

	$scope.$on('clubAuthRefreshed', function(){
		if(clubAuth.user && clubAuth.user.username) {
			$scope.nav.templateUrl = 'templates/navbar.html';
			$scope.nav.name = clubAuth.user.username;
		} else {
			$scope.nav.templateUrl = 'templates/navbar-public.html';
			$scope.nav.name = null;
		}
	});

	clubAuth.refresh();

});

clubAdminApp.controller('IndexController', function($location, clubAuth) {

	if(clubAuth.user) {
		$location.path('/settings');
	} else {
		$location.path('/login');
	}


});