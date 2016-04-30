angular.module('app.cis').controller('MemberListCtrl', function($scope, $rootScope, $http, $routeParams, clubAuth, appConf) {
    $scope.listFilterString = '';
    $scope.rowFilter = {
        former: false,
        onleave: true,
        filter: function(row){
            if(row.former && !$scope.rowFilter.former) return false;
            if(row.onleave && !$scope.rowFilter.onleave) return false;
            return true;
        }
    }

    $scope.members = {};
    $scope.members.data = null;
    $scope.members.keys = null;

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.loading = false;

    $scope.formerHidden = true;
    $scope.onleaveHidden = false;

    refresh();

    function refresh() {
        // show loading bar
        $scope.loading = true;

        $http.get(appConf.api + '/members')
          .success(function(data) {
              $scope.members.data = data;

              $http.get(appConf.api + '/keylist')
                .success(function(data) {
                    $scope.members.data.forEach(function(user) {
                        data.forEach(function(key) {
                            if (user.username == key.username)
                                user.keyPermissions = key.keyPermissions;
                        });
                    });
                });

              // hide loading bar
              $scope.loading = false;
          });

    }




    //order stuff
    $scope.orderBy = function(col) {
        //do not order if not desired for this column
        if (!$scope.attrs[col].hasOwnProperty('order')) {
            return false;
        }

        //if col not changed, flip reversesort
        if (col == $scope.orderByCol) {
            $scope.reverseSort = !$scope.reverseSort;

            //if col changed, sort ascending
        } else {
            $scope.reverseSort = 0;
        }

        $scope.orderByCol = col;
    }

    $scope.orderByCol = 'status';
    $scope.reverseSort = 0;

    $scope.attrlist = ['index', 'name', 'alias', 'tel', 'email', 'role', 'addr', 'birthday', 'accdate', 'keyPermissions', 'status'];
    $scope.attrs = {
        'index': {
            'label': 'Nr.',
            'state': false
        },
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
            'order': 'email',
            'state': true,
            'label': 'E-Mail'
        },
        'role': {
            'order': 'role',
            'state': true,
            'label': 'Rolle/Position'
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
        'keyPermissions': {
            'order': 'keyPermissions',
            'state': false,
            'label': 'Schlüsselberechtigungen'
        },
        'status': {
            'order': ['-former', 'lastname'],
            'label': 'Status'
        }
    }



    $scope.isBirthday = function(birthday) {
        if (!birthday) return false;
        return (new Date(birthday).toDateString() == new Date().toDateString());
    };

    $scope.date = new Date();

});
