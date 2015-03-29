clubAdminApp.controller('memberListController', function($scope, $rootScope, $http, $routeParams, clubAuth) {

	$scope.members = {};
	$scope.members.data = null;

	$scope.isSuperuser = $rootScope.clubUser.superuser;

	refresh();

	function refresh() {
		$http.get(apiPath + '/members').
			success(function(data){
				$scope.members.data = data;
		});
	}




	//order stuff
	$scope.orderBy = function(col){
		//do not order if not desired for this column

		console.log($scope.attrs[col]);

		if(!$scope.attrs[col].hasOwnProperty('order')){
			return false;
		}

		//if col not changed, flip reversesort
		if(col == $scope.orderByCol){
			$scope.reverseSort = !$scope.reverseSort;

		//if col changed, sort ascending
		}else{
			$scope.reverseSort = 0;
		}

		$scope.orderByCol = col;
	}

	$scope.orderByCol = 'status';
	$scope.reverseSort = 0;

	$scope.attrlist = ['name', 'alias', 'tel', 'email', 'role', 'td', 'addr', 'birthday', 'accdate', 'status'];
	$scope.attrs = {
		'name': {
			'order': 'lastname',
			'label': 'Name'
		},
		'alias': {
			'order': 'alias',
			'state': true,
			'label': 'Spitzname'
		},
		'tel': {
			'state': true,
			'label': 'Telefon'
		},
		'email': {
			'order': 'alias',
			'state': true,
			'label': 'E-Mail'
		},
		'role': {
			'order': 'alias',
			'state': true,
			'label': 'Rolle/Position'
		},
		'td': {
			'order': 'teamdrive',
			'state': false,
			'label': 'TeamDrive'
		},
		'addr': {
			'state': false,
			'label': 'Adresse'
		},
		'birthday': {
			'order': 'birthday',
			'state': false,
			'label': 'Geburtstag'
		},
		'accdate': {
			'order': 'accessiondate',
			'state': false,
			'label': 'Eintrittsdatum'
		},
		'status': {
			'order': ['-former','lastname'],
			'label': 'Status'
		}
	}

	$scope.isBirthday = function(birthday) {
		if (!birthday) return false;
		return (new Date(birthday).toDateString() == new Date().toDateString());
	};

	$scope.date = new Date();

});
