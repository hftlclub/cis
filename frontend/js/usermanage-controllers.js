

clubAdminApp.controller('userFormController', function($scope, $rootScope, $routeParams, $http, $location, $modal, clubAuth) {
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

	form.id = $routeParams.id;
	form.mode = (form.id)?'edit':'add';
	form.data = form.mode=='add'?{}:null; // 'cause form is hidden when data is null
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
		}

		$http(req).
			success(function(data) {
				if(form.mode == 'add'){
					$scope.form.data.password = data.password;
					$scope.form.message = 'successAdd';
				}
				if(form.mode == 'edit'){
					console.log(data);
				}
				//$scope.form.data = {};
			}).
			error(function(data, status) {
				if(status == 400 && data.error == 'form') {
					$scope.form.message = 'invalid';
					$scope.form.errors = data.highlight;
				} else {
					$scope.form.message = 'error';
					$scope.form.errors = null;
				}

			});
	}

	function refresh() {
		if(!clubAuth.user){
			return false;
		}
		
		console.log(form.id);
		
		if(clubAuth.user.type == 'user'){
			form.data = clubAuth.user;

		}else if(clubAuth.user.superuser && form.mode == 'edit'){
			
			$http.get(apiPath + '/user/' + form.id).
				success(function(data){
					form.data = data;
				});

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
				console.log('received user data:', data);
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
			console.log("USER Object:", $rootScope.user);
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
