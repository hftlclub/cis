clubAdminApp.controller('protocolsController', function($scope, $rootScope, $http, $routeParams, clubAuth) {

	$scope.aceOptions = {
	      mode: 'markdown'
	}

	/*** functions ***/

	$scope.save = function() {
		console.log('data could be send to backend now!');
		/*
		$http.get(apiPath + '/protocols').
			success(function(data){
				$scope.protocols.data = data;
		});
		*/
	}

});
