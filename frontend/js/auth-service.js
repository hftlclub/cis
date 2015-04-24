
clubAdminApp.factory('clubAuth', function($http, $location, $rootScope) {
	var clubAuth = {};

	$rootScope.clubAuth = clubAuth;
	
	clubAuth.refresh = function() {

		$http.get(apiPath + '/userdata').
			success(function(data){
				clubAuth.user = data;
				$rootScope.$broadcast('clubAuthRefreshed');
				$rootScope.clubUser = data;

				if($location.path() == '/login') $location.path('/');

			}).
			error(function(data, status){
				clubAuth.user = {};
				$rootScope.$broadcast('clubAuthRefreshed');
				$rootScope.clubUser = {};

				if(!isPublicPage($location.path()))
					$location.path('/login');

			});
	}

	clubAuth.logout = function() {
		$http.get(apiPath + '/logout').
			success(function(){
				clubAuth.refresh();
			});
		localStorage.removeItem('accessToken');
		$http.defaults.headers.common['X-Access-Token'] = null;
		clubAuth.refresh();
	}

	$rootScope.$on('$locationChangeStart', function() {
		clubAuth.refresh();
	});

	

	return clubAuth;

	function isPublicPage(path) {
		if(path == '/login')
			return true;
		return false;
	}

});
