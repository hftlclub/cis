

clubAdminApp.controller('SettingsIndexController', function($scope, clubAuth){

	$scope.settings = {};

	$scope.$on('clubAuthRefreshed', refresh);
	refresh();

	function refresh(){
		if(clubAuth.user && clubAuth.user.type) {
			$scope.settings.templateUrl = 'templates/settings/index-'+clubAuth.user.type+'.html';
		}
	}

});

clubAdminApp.controller('SettingsChangePasswordController', function($scope, $http){

	$scope.form = {};
	$scope.form.data = {};
	$scope.form.errors = {};
	$scope.form.message = null;

	$scope.form.submit = submit;

	function submit() {
		$http.post('json/settings/changepassword.php', $scope.form.data).
			success(function(data){
				$scope.form.message = 'success';
				$scope.form.data = {};
				$scope.form.errors = {};
			}).
			error(function(data, status){
				if(status == 400 && data.error == 'form') {
					$scope.form.message = 'invalid';
					$scope.form.errors = data.highlight;
				} else {
					$scope.form.message = 'error';
					$scope.form.errors = null;
				}
			});

	}

});
