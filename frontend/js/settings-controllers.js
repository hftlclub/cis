

clubAdminApp.controller('SettingsIndexController', function($scope, clubAuth){

	$scope.settings = {};

	$scope.$on('clubAuthRefreshed', refresh);
	refresh();

	function refresh(){
			// $scope.settings.templateUrl = 'templates/settings/index.html';
	}

});

clubAdminApp.controller('SettingsChangePasswordController', function($scope, $http){

	$scope.form = {};
	$scope.form.data = {};
	$scope.form.errors = {};
	$scope.form.message = null;

	$scope.form.submit = submit;

	function submit() {
		$http.post(apiPath + '/settings/changepassword', $scope.form.data).
			success(function(data){
				$scope.form.message = 'success';
				$scope.form.data = {};
				$scope.form.errors = {};
			}).
			error(function(data, status){
				if(status == 400 && data.validationerror) {
					$scope.form.message = 'invalid';
					$scope.form.errors = data.validationerror;
				} else {
					$scope.form.data.errormessage = data;
					$scope.form.message = 'error';
					$scope.form.errors = null;
				}
			});

	}

});
