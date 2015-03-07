

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
			url: apiPath + '/user',
			data: {'user': $scope.form.data}
		};

		if(form.mode == 'add'){
			req.method = 'POST';

		}else if(form.mode == 'edit'){
			req.method = 'PUT';
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
		if(clubAuth.user && clubAuth.user.type == 'user') {
			// user profile
			form.data = clubAuth.user;

		} else if(form.mode == 'edit') {
			if(clubAuth.user.type == 'superuser') {
				var url = 'json/superuser/getdata.php?type=user&id='+form.id;
			} else {
				var url = 'json/installer/getuser.php?id='+form.id;
			}

			$http.get(url).success(function(data){
					form.data = data;
				});
		}
	}

});

clubAdminApp.controller('userListController', function($scope, $http, $routeParams, clubAuth, $modal) {

	$scope.users = {};
	$scope.users.data = null;
	$scope.users.remove = remove;

	refresh();



	/*** functions ***/

	function refresh() {
		var req = {
			url: apiPath+'/user',
			method: 'GET',
			headers: {
				'X-Access-Token': localStorage.getItem('accessToken')
			}
		};


		$http(req).
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
			controller: function($scope) {
				$scope.user = user;
			},
		});

		modal.result.then(function(){
			$http.get('json/superuser/deletelogin.php?type=user&id='+user.id).
				success(refresh);
		});


	}

});
