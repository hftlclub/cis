clubAdminApp.controller('protocolsController', function($scope, $rootScope, $http, $routeParams, clubAuth) {
  var form = {};
  $scope.form = form;
  $scope.form.protocolData = {};
  $scope.form.protocolData.attendants = [];
  $scope.users = [];
  $scope.form.protocolData.start = {};
  $scope.form.protocolData.end = {};
  $scope.startTime = new Date();
  $scope.endTime = new Date();
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



  $scope.addAttendants = function(){
    if($scope.inputAttendee) {
      var match = false;
      var attendee = {
        'name': $scope.inputAttendee,
        'type': 'member'
      }

      // check if person is already attendee
      for (var i=0; i<form.protocolData.attendants.length; i++){
        if (form.protocolData.attendants[i].name == attendee.name) match = true;
      }

      if (!match) $scope.form.protocolData.attendants.push(attendee);
    }
    // reset input
    $scope.inputAttendee = null;
  }




  $scope.removeAttendee = function(index){
    $scope.form.protocolData.attendants.splice(index, 1)
  };




  $scope.save = function() {
    form.protocolData.date = form.protocolData.date.toISOString();
    form.protocolData.start.hh = $scope.startTime.getHours();
    form.protocolData.start.mm = $scope.startTime.getMinutes();
    form.protocolData.end.hh = $scope.endTime.getHours();
    form.protocolData.end.mm = $scope.endTime.getMinutes();

    console.log(form.protocolData);
		/*
    $http.post(apiPath + '/protocols', form.protocolData).
			success(function(data){
			  console.log(data);
		});
    */
  }

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/members').success(function(data) {
	  
	  //build array with just names and only current members
	  data.forEach(function(row) {
		  if(!row.former) {
			  $scope.users.push(row.firstname + ' ' + row.lastname);
		  }
	  });
    });
  }


});
