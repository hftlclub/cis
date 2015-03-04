
clubAdminApp.controller('StatusIndexController', function($scope, $http, $interval, $routeParams){

	$scope.url = {
		prefix: '/status',
	}

	if($routeParams.id)
		$scope.url.prefix += '/' + $routeParams.id;

	var url = 'json/status/getstatusoverview.php';
	if($routeParams.id)
		url += '?id='+$routeParams.id;

	$interval(refresh, 60*1000);
	refresh();


	function refresh() {
		$http.get(url).
			success(function(data) {
				$scope.status = data;
			});
	}

});


clubAdminApp.controller('StatusPlotController', function($scope, $http, $routeParams, $filter,
			$location, $modal){

	if($routeParams.period == 'month' && !$routeParams.date) {
		$routeParams.date = $filter('date')(new Date(), 'yyyy-MM-01');
	}

	if($routeParams.period == 'day' && !$routeParams.date) {
		$routeParams.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	}

	$scope.status = {};
	$scope.buildUrl = buildUrl;
	$scope.getLabel = getLabel;
	$scope.selectMonth = selectMonth;

	refresh();

	/*** functions ***/

	function refresh() {
		var url = 'json/status/getstatus.php';
		url += '?type=' + $routeParams.plottype;
		url += '&period=' + $routeParams.period;

		if($routeParams.id)
			url += '&id='+ $routeParams.id;

		if($routeParams.period == 'day' || $routeParams.period == 'month') {
			var pieces = $routeParams.date.split('-');
			var year = parseInt(pieces[0]);
			var month = parseInt(pieces[1]);
			var day = (pieces.length>2)?parseInt(pieces[2]):0;
			var date = new Date(year, month-1, day, 12, 0, 0, 0);
			url += '&timestamp=' + date.getTime();
		}

		$http.get(url).
			success(function(data) {
				
				$scope.status.lastupdated = data.lastupdated;
				$scope.status.fullkwh = data.fullkwh;
				
				if($routeParams.period == 'today' || $routeParams.period == 'yesterday' ||
					$routeParams.period == 'day')
				{
					$scope.status.area = data.val;
				} else {
					$scope.status.bars = {
						data: data.val,
						period: $routeParams.period,
					}
				}
			});
	}	

	function buildUrl(plottype, period, date) {
		var url = '#/status';

		if($routeParams.id) {
			url += '/' + $routeParams.id;
		}

		url += '/' + (plottype?plottype:$routeParams.plottype);
		url += '/' + (period?period:$routeParams.period);

		if(date) {
			url += '/' + date;
		} else if($routeParams.date) {
			url += '/' + $routeParams.date;
		}

		return url;


	}

	function getLabel(key) {
		return {
			consumption: 'Hausverbrauch',
			powergenerated: 'Erzeugter PV-Strom',
			accuexport: 'Akku-Beladung',
			accuimport: 'Akku-Entnahme',
			gridimport: 'Netz-Bezug',
			gridexport: 'Netz-Einspeisung',
			today: 'Heute',
			yesterday: 'Gestern',
			day: 'Tag',
			month: 'Monat',
			'7days': '7 Tage',
			'31days': '31 Tage',
			all: 'Gesamt',
		}[key];
	}

	function selectMonth() {
		var modal = $modal.open({
			templateUrl: 'templates/user/monthmodal.html',
			size: 'sm',
			controller: function($scope, $modalInstance) {
				$scope.months = [
					['01', '02', '03'],
					['04', '05', '06'],
					['07', '08', '09'],
					['10', '11', '12'],
				]
				$scope.year = new Date().getFullYear();
				$scope.select = function(year, month) {
					$modalInstance.close(year+'-'+month+'-01');
				}

			},
		});

		modal.result.then(function(date) {
			$location.path(buildUrl(null, null, date).substring(1));
		})
	}


});

clubAdminApp.controller('AutarkyPlotController', function($scope, $http, $routeParams) {

	$scope.autarky = {};

	var url = 'json/status/getautarky.php';
	if($routeParams.id)
		url += '?id='+ $routeParams.id;

	$http.get(url).
		success(function(data) {
			$scope.autarky.data = [
				['Tag', data.day],
				['Woche', data.week],
				['Monat', data.month],
				['Jahr', data.year],
				['Gesamt', data.all],
			];
		});

});


clubAdminApp.controller('AccustateController', function($scope, $http, $interval, $routeParams){

	$scope.url = {
		prefix: '/accustate',
	}

	if($routeParams.id)
		$scope.url.prefix += '/' + $routeParams.id;

	var url = 'json/status/getaccustate.php';
	if($routeParams.id)
		url += '?id='+$routeParams.id;

	$interval(refresh, 60*1000);
	refresh();


	function refresh() {
		$http.get(url).
			success(function(data) {
				$scope.accu = data;
			});
	}

});
