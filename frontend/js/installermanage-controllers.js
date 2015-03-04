

clubAdminApp.controller('InstallerFormController', function($scope, $routeParams, $http, $location, clubAuth,
			clubMode) {

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
		switch(clubMode) {
			case 'add': url = 'json/superuser/setinstaller.php'; break;
			case 'edit': url = 'json/superuser/setinstaller.php?id=' + form.id; break;
			case 'profile': url = 'json/settings/updateprofile.php'; break;
			case 'register': url = 'json/public/registerinstaller.php'; break;

		}

		$http.post(url, $scope.form.data).
			success(function(data) {
				$scope.form.data = {};
				if(clubMode == 'profile')
					$location.path('/settings');
				else if(clubMode == 'register')
					$location.path('/');
				else
					$location.path("/installers");
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
			$http.get('json/superuser/getdata.php?type=installer&id='+form.id).
				success(function(data){
					form.data = data;
				});
		}
	}

});

clubAdminApp.controller('InstallerListController', function($scope, $http, $routeParams, clubAuth, $modal) {

	var installerId = $routeParams.id;

	$scope.installers = {};
	$scope.installers.data = {};
	$scope.installers.remove = remove;
	$scope.installers.activate = activate;
	$scope.installers.deactivate = deactivate;
	$scope.installers.unassignusers = unassignusers;

	refresh();

	$scope.installers.filter = {};
	var filter = $scope.installers.filter;
	filter.params = null;
	filter.functions = {
		inactive : function(installer) { return !installer.active; },
	}

	if($routeParams.filter) {
		filter.params = $routeParams.filter.split('/');
		filter.fn = filter.functions[filter.params[0]];
	}


	/*** functions ***/

	function refresh() {
		url = 'json/superuser/getinstallers.php';
		$http.get(url).
			success(function(data){
				$scope.installers.data = data;
			});
	}
	
	function remove(installer) {
		var modal = $modal.open({
			templateUrl: 'templates/installermanage/deletemodal.html',
			controller: function($scope) {
				$scope.installer = installer;
			},
		});

		modal.result.then(function(){
			$http.get('json/superuser/deletelogin.php?type=installer&id='+installer.id).
				success(refresh);
		});
	}
	
	
	function activate(installer) {
		var modal = $modal.open({
			templateUrl: 'templates/installermanage/activestatemodal.html',
			controller: function($scope) {
				$scope.installer = installer;
				$scope.mode = 'activate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=activate&id='+installer.id).
				success(refresh);
		});
	}
	
	
	function deactivate(installer) {
		var modal = $modal.open({
			templateUrl: 'templates/installermanage/activestatemodal.html',
			controller: function($scope) {
				$scope.installer = installer;
				$scope.mode = 'deactivate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=deactivate&id='+installer.id).
				success(refresh);
		});
	}
	
	
	function unassignusers(installer) {
		var modal = $modal.open({
			templateUrl: 'templates/installermanage/unassignusersmodal.html',
			controller: function($scope) {
				$scope.installer = installer;
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/unassignusers.php?id='+installer.id).
				success(refresh);
		});
	}


});

