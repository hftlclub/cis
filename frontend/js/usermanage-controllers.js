

clubAdminApp.controller('userFormController', function($scope, $rootScope, $routeParams, $route, $http, $location, $modal, $timeout, clubAuth) {
	var form = {};
	$scope.form = form;

	$scope.options = {
		shells: [
			{ label: '/bin/false (keine)', value: '/bin/false' },
			{ label: '/bin/bash (Bash)', value: '/bin/bash' },
			{ label: '/usr/bin/zsh (Z-Shell)', value: '/usr/bin/zsh' }
		],
		usertypes: [
			{ label: 'Clubmitglied', value: 'club' },
			{ label: 'Extern', value: 'other' }
		]
	};

	$scope.keys = doorKeyList;

	form.id = $routeParams.id;
	form.mode = $route.current.locals.clubMode;
	form.errors = {};
	form.message = null;

	form.submit = submit;

	//default values
	if(form.mode == 'add'){
		form.data = {
			sendPassword: true
		};
	}else{
		form.data = null; // 'cause form is hidden when data is null
	}


	refresh();

	/*** functions ***/

	function submit() {
		var url = null;

		var req = {
			data: $scope.form.data
		};

		if(form.mode == 'add'){
			req.method = 'POST';
			req.url = apiPath + '/user';

		}else if(form.mode == 'edit'){
			req.method = 'PUT';
			req.url = apiPath + '/user/' + form.id;

		}else if(form.mode == 'profile'){
			req.method = 'PUT';
			req.url = apiPath + '/settings/profile';
		}

		$http(req).
			success(function(data) {
				if(form.mode == 'add'){
					$scope.form.msgdata = data;
					$scope.form.message = 'successAdd';
					$scope.form.data = {};

				}else if(form.mode == 'edit'){
					$scope.form.message = 'successEdit';
					$timeout(function() {
						$location.path('/users');
			    }, 3000);

				}else if(form.mode == 'profile'){
					$scope.form.message = 'successEdit';
					$timeout(function() {
						$location.path('/settings');
			    }, 3000);
				}
				//$scope.form.data = {};
			}).
			error(function(data, status) {
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

	function refresh() {
		if(!clubAuth.user){
			return false;
		}

		//user edits his own profile
		if(form.mode == 'profile'){
			form.data = clubAuth.user;

		//superuser edits other user
		}else if(clubAuth.user.superuser && form.mode == 'edit'){

			$http.get(apiPath + '/user/' + form.id).
				success(function(data){
					form.data = data;
				});

		//probably superuser adds new user. Nothing to do here
		}else{
			return false;
		}
	}

	/* Date picker */
	//only create new datepicker if there's no data expected
	if(form.mode == 'add'){
	    $scope.form.data.accessiondate = new Date();
	}
	$scope.minDate = $scope.minDate ? null : new Date(2012,(10-1),25);
	$scope.maxDate = $scope.maxDate ? null : new Date();

	$scope.dateOptions = {
    'startingDay': 1,
  };

  $scope.format = 'dd.MM.yyyy';

	$scope.datepicker = true;
	$scope.birthdayPicker = false;

});





clubAdminApp.controller('userListController', function($scope, $rootScope, $http, $routeParams, clubAuth, $modal) {

	$scope.users = {};
	$scope.users.data = null;
	$scope.users.remove = remove;
	$scope.users.resetpw = resetpw;

	refresh();



	/*** functions ***/

	function refresh() {
		$http.get(apiPath + '/user').
			success(function(data){
				$scope.users.data = data;
		});
	}

	function remove(user) {
		var modal = $modal.open({
			templateUrl: 'templates/usermanage/deletemodal.html',
			controller: 'delModalController',
			resolve: {
				user: function(){
					return $rootScope.user = user;
				}
			}
		});

		modal.result.then(function(){
			$http.delete(apiPath + '/user/'+ user.username).
				success(refresh);
		});


	}




	function resetpw(user) {
		var modal = $modal.open({
			templateUrl: 'templates/usermanage/passwordresetmodal.html',
			controller: 'resetpwModalController',
			resolve: {
				user: function(){
					return $rootScope.user = user;
				}
			}
		});

		modal.result.then(function(){
			$http.get(apiPath + '/user/'+ user.username + '/resetPw').success(function(){});
		});

	}


});




clubAdminApp.controller('delModalController', function ($scope, $modalInstance, user) {
	$scope.ok = function () {
    $modal.close(user);
  };
  $scope.cancel = function () {
    $modal.dismiss('cancel');
	};
});



clubAdminApp.controller('resetpwModalController', function ($scope, $modalInstance, user) {
	$scope.ok = function () {
    $modal.close(user);
  };
  $scope.cancel = function () {
    $modal.dismiss('cancel');
	};
});
