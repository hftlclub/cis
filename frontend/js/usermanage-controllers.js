

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
	form.selectInstaller = selectInstaller;

	refresh();

	/*** functions ***/

	function submit() {
		var url = null;
		if(clubAuth.user && clubAuth.user.type == 'user') {
			url = 'json/settings/updateprofile.php';
		} else {
			url = 'json/'+clubAuth.user.type+'/setuser.php';
			if(form.mode == 'edit')
				url = url + '?id=' + form.id;
		}
		$http.post(url, $scope.form.data).
			success(function(data) {
				if(clubAuth.user.type == 'user') {
					form.message = 'success';
				} else {
					$scope.form.data = {};
					$location.path("/users");
				}
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

	function selectInstaller() {
		$http.get('json/superuser/getinstallers.php').
			success(function(data){
				$scope.installers = data;
			});


		var modal = $modal.open({
			templateUrl: 'templates/usermanage/installermodal.html?wipecache=20140822',
			scope: $scope,
		});

		modal.result.then(function(item){
			if(item) {
				form.data.installer = item.id;
				form.data.inst_company = item.company;
			} else {
				form.data.installer = null;
				form.data.inst_company = null;
			}
		});
	}

});

clubAdminApp.controller('userListController', function($scope, $http, $routeParams, clubAuth, $modal) {

	var installerId = $routeParams.id;

	$scope.users = {};
	$scope.users.data = null;
	$scope.users.remove = remove;
	$scope.users.activate = activate;
	$scope.users.deactivate = deactivate;

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

		} else if(clubAuth.user.type == 'bank') {
			url = 'json/bank/getusers.php';

		} else if(clubAuth.user.type == 'installer') {
			url = 'json/installer/getusers.php';

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

	function activate(user) {
		var modal = $modal.open({
			templateUrl: 'templates/usermanage/activestatemodal.html?wipecache=20140822',
			controller: function($scope) {
				$scope.user = user;
				$scope.mode = 'activate';
			}
		});

		modal.result.then(function(){
			$http.get('json/'+clubAuth.user.type+'/setactivestate.php?mode=activate&id='+user.id).
				success(refresh);
		});
	}


	function deactivate(user) {
		var modal = $modal.open({
			templateUrl: 'templates/usermanage/activestatemodal.html?wipecache=20140822',
			controller: function($scope) {
				$scope.user = user;
				$scope.mode = 'deactivate';
			}
		});

		modal.result.then(function(){
			$http.get('json/'+clubAuth.user.type+'/setactivestate.php?mode=deactivate&id='+user.id).
				success(refresh);
		});
	}



});
