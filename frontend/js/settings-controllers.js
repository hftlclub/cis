

clubAdminApp.controller('SettingsIndexController', function($scope, clubAuth){

	$scope.settings = {};

	$scope.$on('clubAuthRefreshed', refresh);
	refresh();

	function refresh(){
			// $scope.settings.templateUrl = 'templates/settings/index.html';
	}

});

clubAdminApp.controller('SettingsChangePasswordController', function($scope, $http, $timeout, $location, growl){

	$scope.form = {};
	$scope.form.data = {};
	$scope.form.errors = {};
	$scope.form.message = null;

	$scope.form.submit = submit;

	function submit() {
		$http.post(apiPath + '/settings/changepassword', $scope.form.data).
			success(function(data){
				$scope.form.data = {};
				$scope.form.errors = {};
				growl.success('Passwort wurde geändert');
				$timeout(function() {
					$location.path('/settings');
				}, 1000);
			}).
			error(function(data, status){
				if(status == 400 && data.validationerror) {
					growl.warning('Einige Felder sind fehlerhaft!', {ttl: 10000});
					$scope.form.errors = data.validationerror;
				} else {
					growl.error('Systemfehler '+ data);
					$scope.form.data.errormessage = data;
					$scope.form.errors = null;
				}
			});

	}

});
