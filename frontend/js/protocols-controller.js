clubAdminApp.controller('protocolsController', function($scope, $rootScope, $http, $routeParams, clubAuth) {
  var form = {};
  $scope.form = form;
  $scope.form.protocolData = {};
  $scope.form.protocolData.attendants = [];
  $scope.users = form;
  $scope.users.data = {};
  $scope.commonTitles = ['Clubsitzung', 'Mitgliederversammlung', 'Planungstreffen'];

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
    formatYear: 'yy',
    startingDay: 1
  };


  $scope.format = 'dd.MM.yyyy';

  $scope.datepicker = true;

  $scope.openDatepicker = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedDatepicker = true;
  };

  $scope.addAttendants = function(item, model, label){
    var attendee = {
      'name': label,
      'type': 'member'
    }
    $scope.form.protocolData.attendants.push(attendee);
    $scope.inputAttendee = null;
  }

  $scope.removeAttendee = function(index){
    $scope.form.protocolData.attendants.splice(index, 1)
  };

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
    form.protocolData.date = form.protocolData.date.toISOString();
    console.log(form.protocolData);
		$http.post(apiPath + '/protocols', form.protocolData).
			success(function(data){
			  console.log(data);
		});
  }

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/members').
    success(function(data) {
      $scope.users.data = data;
    });
  }


});
