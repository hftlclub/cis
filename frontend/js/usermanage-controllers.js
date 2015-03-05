

clubAdminApp.controller('userFormController', function($scope, $routeParams, $http,
		   $location, $modal, clubAuth) {
	var form = {};
	$scope.form = form;

	$scope.usertypes = [
		{ "id" : "club", "name" : "Clubmitglied" },
		{ "id" : "other", "name" : "Extern" }
	];
	$scope.shells = [ "/bin/false", "/bin/bash", "/bin/zsh" ];

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
			url: apiPath+'/user',
			data: {'user': $scope.form.data},
			headers: {
				'X-Access-Token': localStorage.getItem('accessToken')
			},
		};

		if(form.mode == 'add'){
			req.method = 'POST';
		}

		if(form.mode == 'edit'){
			req.method = 'PUT';
		}

		$http(req).
			success(function(data) {
				$scope.form.data = {};
				$location.path("/users");
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

	if($routeParams.filter) {
		filter.params = $routeParams.filter.split('/');
		filter.fn = function(user) {
			return user.type == filter.params[0];
		}
	}


	/*** functions ***/

	function refresh() {
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
