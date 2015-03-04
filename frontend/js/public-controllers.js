
clubAdminApp.controller('LoginController', function($scope, $http, $location, clubAuth, $modal, $timeout){

	$scope.login = {};
	$scope.login.data = {};
	$scope.login.message = null;
	$scope.login.status = null;

	$scope.login.submit = submit;
	$scope.login.passwordreset = passwordreset;

	function submit() {
		fixAutofillBug();
		$http.post('json/auth/login.php', {
			email   : $scope.login.data.email,
			password: $scope.login.data.password
		}).
			success(function(data){
				if(data.success) {
					setMessage('success');
					clubAuth.refresh();
				} else {
					setMessage('invalid');
				}
			}).
			error(function(data, status){
				setMessage('systemerror');
			});

	}

	function passwordreset() {
		var modal = $modal.open({
			templateUrl: '/templates/passwordresetmodal.html',

		});

		modal.result.then(function(email) {
			$http.post('json/auth/passwordreset.php', { 'email': email, }).
				success(function() {
					setMessage('passwordresetsuccessfull');
				}).
				error(function(){
					setMessage('passwordresetfailed');
				});
		});
	}

	var setMessagePromise;
	function setMessage(key) {
		if(setMessagePromise) {
			$timeout.cancel(setMessagePromise);
			setMessagePromise = null;
		}

		$scope.login.message = key;
		setMessagePromise = $timeout(function() {
			$scope.login.message = null;
		}, 5000);
	}

});
