
clubAdminApp.controller('LoginController', function($scope, $http, $location, clubAuth, $modal, $timeout, ngAudio){

	$scope.login = {};
	$scope.login.data = {};
	$scope.login.data.username = '';
	$scope.login.message = null;
	$scope.login.status = null;

	$scope.login.submit = submit;

	//only accept lowercase usernames
	$scope.$watch('login.data.username', function() {
		$scope.login.data.username = $scope.login.data.username.toLowerCase().replace(/\s+/g,'');
	});

	$scope.chord = ngAudio.load('media/cismajor.mp3');
		
	function submit() {
		//fixAutofillBug();
		$http.post(apiPath+'/login', {
			'username': $scope.login.data.username,
			'password': $scope.login.data.password
		}).
			success(function(data){
					setMessage('success');
					localStorage.setItem('accessToken', data.token);
					$http.defaults.headers.common['X-Access-Token'] = data.token;


					$scope.chord.play();

					clubAuth.refresh();
			}).
			error(function(data, status){
				  setMessage('invalid');
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
