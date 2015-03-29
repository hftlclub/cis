clubAdminApp.controller('memberListController', function($scope, $rootScope, $http, $routeParams, clubAuth) {

	$scope.members = {};
	$scope.members.data = null;

	$scope.isSuperuser = $rootScope.clubUser.superuser;

	refresh();

	/*** functions ***/

	function refresh() {
		$http.get(apiPath + '/members').
			success(function(data){
				$scope.members.data = data;
		});
	}

	$scope.orderBy = function(field){
		$scope.orderByField = field;
		$scope.reverseSort = !$scope.reverseSort;
	}

	$scope.orderByField = 'former';
	$scope.reverseSort = true;

	$scope.attrs = {

		'alias': {
			'state': true,
			'label': 'Spitzname'
		},
		'tel': {
			'state': true,
			'label': 'Telefon'
		},
		'email': {
			'state': true,
			'label': 'E-Mail'
		},
		'role': {
			'state': true,
			'label': 'Rolle/Position'
		},
		'td': {
			'state': false,
			'label': 'TeamDrive'
		},
		'addr': {
			'state': false,
			'label': 'Adresse'
		},
		'birthday': {
			'state': false,
			'label': 'Geburtstag'
		},
		'accDate': {
			'state': false,
			'label': 'Eintrittsdatum'
		}
	}

	$scope.isBirthday = function(birthday) {
		if (!birthday) return false;
		return (new Date(birthday).toDateString() == new Date().toDateString());
	};

});
