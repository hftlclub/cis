angular.module('app.cis').controller('UserFormController', function($scope, $rootScope, $routeParams, $route, $http, $location, $uibModal, $timeout, clubAuth, growl, appConf) {
    var form = {};
    $scope.form = form;

    form.id = $routeParams.id;
    form.mode = $route.current.locals.clubMode;
    form.errors = {};
    form.message = null;

    //if superuser edits their own profile, go to the "big" edit page
    if (form.mode == 'profile' && $rootScope.clubUser.superuser) {
        $location.path('/users/edit/' + $rootScope.clubUser.username);
    }


    $scope.options = {
        shells: [{
            label: '/bin/false (keine)',
            value: '/bin/false'
        }, {
            label: '/bin/bash (Bash)',
            value: '/bin/bash'
        }, {
            label: '/usr/bin/zsh (Z-Shell)',
            value: '/usr/bin/zsh'
        }],
        usertypes: [{
            label: 'Clubmitglied',
            value: 'club'
        }, {
            label: 'Extern',
            value: 'other'
        }]
    };

    $scope.keys = appConf.doorKeyList;
    $scope.groups = [
        {
            key: 'former',
            label: 'Ehemalig'
        },
        {
            key: 'honorary',
            label: 'Ehrenmitglied'
        },
        {
            key: 'superuser',
            label: 'Superuser'
        },
        {
            key: 'applicant',
            label: 'Anwärter'
        },
        {
            key: 'executive',
            label: 'Vorstand'
        }
    ];


    $scope.authgroups = [
        {
            key: 'radius',
            label: 'WLAN'
        },
        {
            key: 'cis',
            label: 'CIS'
        },
        {
            key: 'drive',
            label: 'ClubDrive'
        },
        {
            key: 'apache',
            label: 'Infoscreen'
        }
    ];


    form.submit = submit;

    //default values
    if (form.mode == 'add') {
        form.data = {
            sendPassword: true,
            auth: {} //filled below
        };
        //set all authgroups
        for(var i = 0; i < $scope.authgroups.length; i++){
            form.data.auth[$scope.authgroups[i].key] = true;
        }

    } else {
        form.data = null; // 'cause form is hidden when data is null
    }




    refresh();

    /*** functions ***/

    function submit() {
        var url = null;

        var req = {
            data: $scope.form.data
        };

        if (form.mode == 'add') {
            req.method = 'POST';
            req.url = appConf.api + '/user';

        } else if (form.mode == 'edit') {
            req.method = 'PUT';
            req.url = appConf.api + '/user/' + form.id;

        } else if (form.mode == 'profile') {
            req.method = 'PUT';
            req.url = appConf.api + '/settings/profile';
        }

        $http(req).
        success(function(data) {
            var succMsg;
            var succPath;
            if (form.mode == 'add') {
                succMsg = 'Der Benutzer <b>' + $scope.form.data.username + '</b> wurde hinzugefügt!';
                succPath = 'users';

            } else if (form.mode == 'edit') {
                succMsg = 'Der Benutzer <b>' + $scope.form.data.username + '</b> wurde erfolgreich bearbeitet!';
                succPath = 'users';

            } else if (form.mode == 'profile') {
                succMsg = 'Dein Profil wurde bearbeitet!';
                succPath = 'settings';
            }
            if (succMsg && succPath) {
                growl.success(succMsg);
                $timeout(function() {
                    $location.path('/' + succPath);
                }, 1000);
            }
        }).
        error(function(data, status) {
            if (status == 400 && data.validationerror) {
                growl.warning('Einige Felder sind fehlerhaft.', {
                    ttl: 10000
                });
                $scope.form.errors = data.validationerror;
            } else {
                var errMsg = '';
                if (data) errMsg = data
                growl.error('Systemfehler ' + errMsg);
                $scope.form.errors = null;
            }

        });
    }

    function refresh() {
        if (!clubAuth.user) {
            return false;
        }

        //user edits his own profile
        if (form.mode == 'profile') {
            form.data = clubAuth.user;

            //superuser edits other user
        } else if (clubAuth.user.superuser && form.mode == 'edit') {

            $http.get(appConf.api + '/user/' + form.id).
            success(function(data) {
                form.data = data;
            });

            //probably superuser adds new user. Nothing to do here
        } else {
            return false;
        }
    }

    /* Date picker */
    //only create new datepicker if there's no data expected
    if (form.mode == 'add') {
        $scope.form.data.accessiondate = new Date();
    }

    $scope.datePicker = {
        format: 'dd.MM.yyyy',
        options: {
            formatYear: 'yy',
            startingDay: 1
        },
        birthday: {
          opened: false,
          open: function($event) {
              $event.preventDefault();
              $event.stopPropagation();
              this.opened = true;
          },
        },
        accessiondate : {
          opened: false,
          minDate : new Date(2012, (10 - 1), 25),
          maxDate : new Date(),
          open: function($event) {
              $event.preventDefault();
              $event.stopPropagation();
              this.opened = true;
          },
        }
    }

});





angular.module('app.cis').controller('UserListController', function($scope, $rootScope, $http, $routeParams, clubAuth, $uibModal, growl, appConf) {
    $scope.listFilter = '';

    $scope.users = {};
    $scope.users.data = null;
    $scope.users.remove = remove;
    $scope.users.resetpw = resetpw;
    $scope.loading = true;

    refresh();



    /*** functions ***/

    function refresh() {
        $scope.loading = true;

        $http.get(appConf.api + '/user').
        success(function(data) {
            $scope.users.data = data;
            $scope.loading = false;
        });
    }

    function remove(user) {
        var modal = $uibModal.open({
            templateUrl: 'templates/usermanage/deletemodal.html',
            controller: 'UserDelModalController',
            resolve: {
                user: function() {
                    return $rootScope.user = user;
                }
            }
        });

        modal.result.then(function() {
            $http.delete(appConf.api + '/user/' + user.username)
                .success(function(data) {
                    growl.success('Der Nutzer ' + user.username + ' wurde erfolgreich entfernt.');
                    refresh();
                });
        });


    }




    function resetpw(user) {
        var modal = $uibModal.open({
            templateUrl: 'templates/usermanage/passwordresetmodal.html',
            controller: 'ResetPwModalController',
            resolve: {
                user: function() {
                    return $rootScope.user = user;
                }
            }
        });

        modal.result.then(function() {
            $http.get(appConf.api + '/user/' + user.username + '/resetPw')
                .success(function() {
                    growl.success('Passwort wurde zurückgesetzt.');
                });
        });

    }


});




angular.module('app.cis').controller('UserDelModalController', function($scope, $modalInstance, user) {
    $scope.ok = function() {
        $modal.close(user);
    };
    $scope.cancel = function() {
        $modal.dismiss('cancel');
    };
});



angular.module('app.cis').controller('ResetPwModalController', function($scope, $modalInstance, user) {
    $scope.ok = function() {
        $modal.close(user);
    };
    $scope.cancel = function() {
        $modal.dismiss('cancel');
    };
});
