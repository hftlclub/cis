

clubAdminApp.controller('BankFormController', function($scope, $routeParams, $http, $location,
			clubMode, clubAuth) {
	var form = {};
	$scope.form = form;

	form.id = $routeParams.id;
	form.mode = clubMode
	form.data = {};
	form.errors = {};
	form.message = null;
	form.submit = submit;

	refresh();

	/*** functions ***/

	function submit() {
		switch(form.mode) {
			case 'add': url = 'json/superuser/setbank.php'; break;
			case 'edit': url = 'json/superuser/setbank.php?id='+form.id; break;
			case 'profile': url = 'json/settings/updateprofile.php'; break;
		}
		$http.post(url, $scope.form.data).
			success(function(data) {
				$scope.form.data = {};
				$location.path("/banks");
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
			$http.get('json/superuser/getdata.php?type=bank&id='+form.id).
				success(function(data){
					form.data = data;
				});
		}
	}

});

clubAdminApp.controller('BankListController', function($scope, $http, $routeParams, clubAuth, $modal) {

	var bankId = $routeParams.id;

	$scope.banks = {};
	$scope.banks.data = {};
	$scope.banks.remove = remove;
	$scope.banks.activate = activate;
	$scope.banks.deactivate = deactivate;

	refresh();

	/*** functions ***/

	function refresh() {
		url = 'json/superuser/getbanks.php';
		$http.get(url).
			success(function(data){
				$scope.banks.data = data;
			});
	}

	function remove(bank) {
		var modal = $modal.open({
			templateUrl: 'templates/bankmanage/deletemodal.html',
			controller: function($scope) {
				$scope.bank = bank;
			},
		});

		modal.result.then(function(){
			$http.get('json/superuser/deletelogin.php?type=bank&id='+bank.id).
				success(refresh);
		});


	}

	function activate(bank) {
		var modal = $modal.open({
			templateUrl: 'templates/bankmanage/activestatemodal.html',
			controller: function($scope) {
				$scope.bank = bank;
				$scope.mode = 'activate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=activate&id='+bank.id).
				success(refresh);
		});
	}


	function deactivate(bank) {
		var modal = $modal.open({
			templateUrl: 'templates/bankmanage/activestatemodal.html',
			controller: function($scope) {
				$scope.bank = bank;
				$scope.mode = 'deactivate';
			}
		});

		modal.result.then(function(){
			$http.get('json/superuser/setactivestate.php?mode=deactivate&id='+bank.id).
				success(refresh);
		});
	}


});
