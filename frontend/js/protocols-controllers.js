// controller for protocol form
clubAdminApp.controller('protocolFormController', function($scope, $http, $routeParams, $interval, $route, $window, clubAuth, hotkeys, growl) {

  $scope.users = [];


  var form = $scope.form = {
    id: $routeParams.id,
    mode: $route.current.locals.clubMode,
    errors: {},
    message: null,
    data: {
      attendants: [],
      start: null,
      end: null
    }
  }

  $scope.commonTitles = ['Clubsitzung', 'Mitgliederversammlung', 'Planungstreffen'];


  // options for textbox
  $scope.aceOptions = {
    mode: 'markdown'
  }


  // You can pass it an object.  This hotkey will not be unbound unless manually removed
   // using the hotkeys.del() method
   hotkeys.add({
     combo:  ['ctrl+s', 'meta+s'],
     description: 'This will save any changes',
     allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
     callback: function(event, hotkey) {
       if (event.preventDefault) {
            event.preventDefault();
        } else {
            // internet explorer
            event.returnValue = false;
        }
       $scope.save();
     }
   });


  $scope.autoSave = {
    isActive: true,
    toggle: function() { // autosave function
      this.isActive = !this.isActive;
      this.setTimer();
    },
    setTimer: function() {
      if (this.isActive) {
        this.interval = $interval(function() {
          if ($scope.form.data.text) $scope.save(1);
        }, 120000); // 120000 = autosave every 2 minutes
      } else {
        this.stopTimer();
      }
    },
    stopTimer: function() {
      $interval.cancel(this.interval)
    }
  };
  $scope.autoSave.setTimer(); //initially start timer

  //destroy timer on location change
  $scope.$on("$destroy", function() {
    $scope.autoSave.stopTimer();
  });

  // catch location change event and save if in edit mode
  $scope.$on('$locationChangeStart', function(event, next, current) {
    if (form.mode == 'edit') saveOnLeave(event);
  });
  // catch close/reload event and save if in edit mode
  $window.addEventListener("beforeunload", function(event) {
    if (form.mode == 'edit') saveOnLeave(event);
  });

  function saveOnLeave(event) {
    // autosave if form is dirty
    if ($scope.protocolForm.$dirty) {
      $scope.save(1);
    }

    // if  beforeunload event was fired (close tab, reload page)
    if (event.name != '$locationChangeStart') {
      var confirmationMessage = '';
      (event || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Webkit, Safari, Chrome
    }
  }



  //models for timepickers // create new when form mode is "add"
  $scope.times = {
    date: null,
    start: null,
    end: null
  };

  //stuff for the "attendee is later" popover
  $scope.laterPopover = {
    template: '/templates/protocols/laterPopover.html',
    setInitial: function(att) {
      att.later = new Date();
      $scope.protocolForm.$setDirty();
    },
    removeTime: function(att){
	    att.later = null;
		$scope.protocolForm.$setDirty();
    }
  }


  /* Date picker */
  //only create new datepicker if there's no data expected
  $scope.minDate = $scope.minDate ? null : new Date(2012, (10 - 1), 25);
  $scope.maxDate = $scope.maxDate ? null : new Date();

  $scope.datePicker = {
    format: 'dd.MM.yyyy',
    open: function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      this.opened = true;
    },
    opened: false,
    options: {
      formatYear: 'yy',
      startingDay: 1
    }
  }


  //stuff for attendants
  $scope.attendants = {
    input: null,
    add: function(name) {
      if (name) {
        var match = false;
        var attendee = {
          'name': name,
          'type': 'member'
        }

        // check if person is already attendee, return if already in list
        for (var i = 0; i < form.data.attendants.length; i++) {
          if (form.data.attendants[i].name == attendee.name) return;;
        }

        form.data.attendants.push(attendee);
      }
    },
    remove: function(index) {
      form.data.attendants.splice(index, 1);
      $scope.protocolForm.$setDirty();
    },
    addFromForm: function(){
	    this.add(this.input);
	    this.input = null;
	    $scope.protocolForm.$setDirty();
    },
    setType: function(att, type){
	    att.type = type;
	    $scope.protocolForm.$setDirty();
    }

  }



  // check whether title is a common title, then load template if available
  $scope.checkTitle = function() {
    for (i = 0; i < $scope.commonTitles.length; i++) { //go through common titles
      if ($scope.commonTitles[i] == form.data.title && !form.data.text) { //if current title matches a common title and there's no text in the field
        //get protocol and fill textfield with it
        $http.get('/templates/protocols/presets/clubsitzung.md').success(function(data) {
          form.data.text = data;
        });
      }
    }
  }



  $scope.save = function(autosaved) {
    var succMsg = (autosaved) ? "Automatisch gespeichert!" : "Gespeichert!"
    
    
    //make ISOStrings from dates
    form.data.date = $scope.times.date.toISOString();
    form.data.start = $scope.times.start.toISOString();
    form.data.end = $scope.times.end.toISOString();


    if (form.mode == 'edit' && form.id) {
      $http.put(apiPath + '/protocols/' + form.id, form.data)
        .success(function(data) {
          growl.success(succMsg);
          $scope.protocolForm.$setPristine();

        })
        .error(function(data, status) {
          if (status == 400 && data.validationerror) {
            growl.warning('Einige Felder sind fehlerhaft!', {ttl: 10000});
            form.errors = data.validationerror;
          
          } else {
            form.data.errormessage = data;
            growl.error('Systemfehler');
            form.errors = null;
          }
        });


    } else if (form.mode == 'add') {
      $http.post(apiPath + '/protocols', form.data)
        .success(function(data) {
          growl.info('Das Protokoll wurde angelegt!');
		  $scope.protocolForm.$setPristine();

          //if ID is returned, switch to edit mode
          if (data.id) {
            form.mode = 'edit';
            form.id = data.id;
          }

        })
        .error(function(data, status) {
          if (status == 400 && data.validationerror) {
            growl.warning('Einige Felder sind fehlerhaft!', {ttl: 10000});
            form.errors = data.validationerror;
          } else {
            form.data.errormessage = data;
            growl.error('Systemfehler');
            form.errors = null;
          }
        });
    }
  }


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


    //in edit mode: go and get the protocol we want to edit
    if (form.mode == 'edit' && form.id) {
      // get data from specific protocol if mode is 'edit'
      $http.get(apiPath + '/protocols/raw/' + form.id).success(function(data) {
        form.data = data;
        $scope.times.date = new Date(data.date);
        $scope.times.start = new Date(data.start);
        $scope.times.end = new Date(data.end);
      });

    }

  }




  /******************************/




  refresh();

  //default values when creating a new protocol
  if (form.mode == 'add') {
    $scope.times.date = new Date();
    $scope.times.start = new Date();
    $scope.times.end = new Date();
    var me = clubAuth.user.firstname + ' ' + clubAuth.user.lastname;
    form.data.recorder = me;
    $scope.attendants.add(me);
  }




});








// controller for protocol list
clubAdminApp.controller('protocolListController', function($scope, $http, $routeParams, clubAuth, $modal) {
  $scope.protocols = [];
  refresh();

  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/protocols?grouped').success(function(data) {
      $scope.protocols = data;
    });
  }

  // function to open delete modal
  $scope.deleteProtocol = function(protocolID) {


    var modal = $modal.open({
      templateUrl: 'templates/protocols/deletemodal.html',
      controller: 'delProtocolController'
    });

    modal.result.then(function() {
      $http.delete(apiPath + '/protocols/' + protocolID).
      success(refresh);
    });
  }

});

// delete modal
clubAdminApp.controller('delProtocolController', function($scope, $rootScope, $modalInstance) {
  $scope.checkWord = $rootScope.getCheckWord();

  // check if input is the same like the give phrase
  $scope.checkInput = function() {
    if ($scope.checkWord == $scope.inputCheckWord) {
      $modalInstance.close('success');
    }
  };
});


// controller for protocol details
clubAdminApp.controller('protocolDetailController', function($scope, $http, $routeParams, clubAuth) {
  $scope.protocolid = $routeParams.id;
  $scope.protocol = {};

  refresh();
  /*** functions ***/

  function refresh() {
    $http.get(apiPath + '/protocols/detail/' + $scope.protocolid).success(function(data) {
      $scope.protocol = data;
    });
  }
});
