clubAdminApp.controller('protocolsController', function($scope, $rootScope, $http, $routeParams, clubAuth) {
  var form = {};
  $scope.form = form;
  $scope.form.protocolData = {};
  $scope.form.protocolData.presentMembers = {};
  $scope.users = form;
  $scope.users.data = {};

  $scope.aceOptions = {
    mode: 'markdown'
  }


  refresh();
  /*** functions ***/

  /* Date picker */
  //only create new datepicker if there's no data expected
  $scope.form.protocolData.date = new Date();
  $scope.minDate = $scope.minDate ? null : new Date(2012, (10 - 1), 25);
  $scope.maxDate = $scope.maxDate ? null : new Date();

  $scope.dateOptions = {
    'startingDay': 1,
  };

  $scope.format = 'dd.MM.yyyy';

  $scope.datepicker = true;

  $scope.concatUserString = function() {
	var userArray = [];

	for(var i = 0; i < $scope.users.data.length; i++) {
		var user = $scope.users.data[i];
		if($scope.form.protocolData.presentMembers.hasOwnProperty(user.username)) {
			if($scope.form.protocolData.presentMembers[user.username]) {
				userArray.push(user.firstname + ' ' + user.lastname);
			}
		}
	}

	$scope.form.protocolData.presentMembersString = userArray.join(', ');
	console.log($scope.form.protocolData.presentMembersString);
  }

  $scope.save = function() {
    console.log('data could be send to backend now!', form.protocolData);
    /*
			$http.get(apiPath + '/protocols').
				success(function(data){
					$scope.protocols.data = data;
			});
			*/
  }

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/members').
    success(function(data) {
      $scope.users.data = data;
    });
  }


});
