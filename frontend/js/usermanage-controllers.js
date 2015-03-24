

clubAdminApp.controller('userFormController', function($scope, $rootScope, $routeParams, $route, $http, $location, $modal, $timeout, clubAuth) {
	var form = {};
	$scope.form = form;

	$scope.options = {
		shells: [
			{ label: '/bin/false (keine)', value: '/bin/false' },
			{ label: '/bin/bash (Bash)', value: '/bin/bash' },
			{ label: '/bin/zsh (Z-Shell)', value: '/bin/zsh' }
		],
		usertypes: [
			{ label: 'Clubmitglied', value: 'club' },
			{ label: 'Extern', value: 'other' }
		]
	};

	console.log();

	form.id = $routeParams.id;
	form.mode = $route.current.locals.clubMode;
	form.data = (form.mode == 'add') ? {} : null; // 'cause form is hidden when data is null
	form.errors = {};
	form.message = null;

	form.submit = submit;

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
				if(status == 400 && data.error == 'form') {
					$scope.form.message = 'invalid';
					$scope.form.errors = data.highlight;
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

});

clubAdminApp.controller('userListController', function($scope, $rootScope, $http, $routeParams, clubAuth, $modal) {

	$scope.users = {};
	$scope.users.data = null;
	$scope.users.remove = remove;

	refresh();



	/*** functions ***/

	function refresh() {
		$http.get(apiPath + '/user').
			success(function(data){
				$scope.users.data = data;
		});

		/*
		if(clubAuth.user.type == 'superuser') {
			if(installerId) {
				url = 'json/superuser/getusers.php?installer=' + installerId;
			} else {
				url = 'json/superuser/getusers.php';
			}
		}
		$http.get(url).
			success(function(data){
				$scope.users.data = data;
			});
		*/
	}

	function remove(user) {
		var modal = $modal.open({
			templateUrl: 'templates/usermanage/deletemodal.html?wipecache=20140822',
			controller: 'delModalController',
			resolve: {
        user: function () {
          return $rootScope.user = user;
        }
      }
		});

		modal.result.then(function(){
			var req = {
				url: apiPath + '/user/'+ $scope.user.username,
				method: 'DELETE'
			};

			$http(req).
				success(refresh);
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
