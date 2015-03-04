

clubAdminApp.controller('SuperuserFormController', function($scope, $routeParams, $http, $location,
			clubAuth, clubMode) {
	var form = {};
	$scope.form = form;

	form.id = $routeParams.id;
	form.mode = clubMode;
	form.data = {};
	form.errors = {};
	form.message = null;
	form.submit = submit;

	refresh();

	/*** functions ***/

	function submit() {
		switch(form.mode) {
			case 'add': url = 'json/superuser/setsuperuser.php'; break;
			case 'edit': url = 'json/superuser/setsuperuser.php?id='+form.id; break;
			case 'profile': url = 'json/settings/updateprofile.php'; break;
		}

		$http.post(url, $scope.form.data).
			success(function(data) {
				$scope.form.data = {};
				$location.path("/superusers");
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
		if(form.mode == 'profile') {
			form.data = clubAuth.user;

		} else if(form.mode == 'edit') {
			$http.get('json/superuser/getdata.php?type=superuser&id='+form.id).
				success(function(data){
					form.data = data;
				});
		}
	}

});

clubAdminApp.controller('SuperuserListController', function($scope, $http, $routeParams, clubAuth, $modal) {

	var superuserId = $routeParams.id;

	$scope.superusers = {};
	$scope.superusers.data = {};
	$scope.superusers.remove = remove;
	$scope.superusers.activate = activate;
	$scope.superusers.deactivate = deactivate;

	refresh();

	/*** functions ***/

	function refresh() {
		url = 'json/superuser/getsuperusers.php';
		$http.get(url).
			success(function(data){
				$scope.superusers.data = data;
			});
	}

	function remove(superuser) {
		var modal = $modal.open({
			templateUrl: 'templates/superusermanage/deletemodal.html',
			controller: function($scope) {
				$scope.superuser = superuser;
			},
		});

		modal.result.then(function(){
			$http.get('json/superuser/deletelogin.php?type=superuser&id='+superuser.id).
				success(refresh);
		});


	}


	function activate(superuser) {
		var modal = $modal.open({
			templateUrl: 'templates/superusermanage/activestatemodal.html',
			controller: function($scope) {
				$scope.superuser = superuser;
				$scope.mode = 'activate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=activate&id='+superuser.id).
				success(refresh);
		});
	}
	
	
	function deactivate(superuser) {
		var modal = $modal.open({
			templateUrl: 'templates/superusermanage/activestatemodal.html',
			controller: function($scope) {
				$scope.superuser = superuser;
				$scope.mode = 'deactivate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=deactivate&id='+superuser.id).
				success(refresh);
		});
	}

});

