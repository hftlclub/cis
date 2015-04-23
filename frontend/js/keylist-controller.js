clubAdminApp.controller('keyListController', function($scope, $rootScope, $http, $routeParams, clubAuth) {

	$scope.members = {};
	$scope.members.data = null;

	$scope.isSuperuser = $rootScope.clubUser.superuser;

	$scope.keys = doorKeyList;

	refresh();

	function refresh() {
		$http.get(apiPath + '/keylist').
			success(function(data){
				$scope.members.data = data;
		});
	}

	$scope.date = new Date();

});
