// controller for protocol form
clubAdminApp.controller('protocolFormController', function($scope, $http, $routeParams, $route, clubAuth) {
  var form = {};
  $scope.users = [];
  $scope.form = form;
  $scope.form.protocolData = {};
  $scope.form.protocolData.attendants = [];
  $scope.form.protocolData.start = {};
  $scope.form.protocolData.end = {};
  $scope.startTime = new Date();
  $scope.endTime = new Date();
  $scope.commonTitles = ['Clubsitzung', 'Mitgliederversammlung', 'Planungstreffen'];
  form.id = $routeParams.id;
	form.mode = $route.current.locals.clubMode;

  // options for textbox
  $scope.aceOptions = {
    mode: 'markdown'
  }


  $scope.laterPopover = {
	  template: '/templates/protocols/laterPopover.html' ,
	  setInitial: function(att){
		  att.later = new Date();
	  }
  }


  refresh();

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

  $scope.addAttendants = function() {
    if ($scope.inputAttendee) {
      var match = false;
      var attendee = {
        'name': $scope.inputAttendee,
        'type': 'member'
      }

      // check if person is already attendee
      for (var i = 0; i < form.protocolData.attendants.length; i++) {
        if (form.protocolData.attendants[i].name == attendee.name) match = true;
      }

      if (!match) $scope.form.protocolData.attendants.push(attendee);
    }
    // reset input
    $scope.inputAttendee = null;
  }

  $scope.removeAttendee = function(index) {
    $scope.form.protocolData.attendants.splice(index, 1)
  };

  // check whether title is a common title, then load template if available
  $scope.checkTitle = function() {
    for (i = 0; i < $scope.commonTitles.length; i++) { //go through common titles
      if($scope.commonTitles[i] == $scope.form.protocolData.title && !$scope.form.protocolData.text) { //if current title matches a common title and there's no text in the field
        //get protocol
        $http.get('/templates/protocols/presets/clubsitzung.md').success(function(data) {
          $scope.form.protocolData.text = data;
        });
      }
    }
  }

  $scope.save = function() {
    form.protocolData.date = form.protocolData.date.toISOString();
    form.protocolData.start.hh = $scope.startTime.getHours();
    form.protocolData.start.mm = $scope.startTime.getMinutes();
    form.protocolData.end.hh = $scope.endTime.getHours();
    form.protocolData.end.mm = $scope.endTime.getMinutes();

    if(form.mode == 'edit' && form.id){
      console.log("edit");
      $http.put(apiPath + '/protocols/' + form.id, form.protocolData).success(function(data) {
        //console.log(data);
      });
    } else {
      $http.post(apiPath + '/protocols', form.protocolData).success(function(data) {
        //console.log(data);
      });
    }
  }

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/members').success(function(data) {
      //build array with just names and only current members
      $scope.users = [];
      data.forEach(function(row) {
        if (!row.former) {
          $scope.users.push(row.firstname + ' ' + row.lastname);
        }
      });
    });


    if(form.mode == 'edit' && form.id){
      // get data from specific protocol if mode is 'edit'
      $http.get(apiPath + '/protocols/raw/' + form.id).success(function(data) {
        //build array with just names and only current members
        form.protocolData = data;
        form.protocolData.date = new Date(data.date);
      });
    }

  }
});

// controller for protocol list
clubAdminApp.controller('protocolListController', function($scope, $http, $routeParams, clubAuth) {
  $scope.protocols = [];
  refresh();

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/protocols?grouped').success(function(data) {
      $scope.protocols = data;
    });
  }
});

// controller for protocol details
clubAdminApp.controller('protocolDetailController', function($scope, $http, $routeParams, clubAuth) {


  /*** functions ***/

  function refresh() {
    /*
    $http.get(apiPath + '/protocols/').success(function(data) {
      $scope.protocols = data;
    });
    */
  }
});
