angular.module('app.cis').controller('MemberListCtrl', function($scope, $rootScope, $http, $routeParams, clubAuth, appConf) {
    $scope.listFilterString = '';
    $scope.rowFilter = {
        state: {
            former: false,
            onleave: true,
            applicant: true
        },
        filter: function(row){
            var state = $scope.rowFilter.state;
            for(s in state){
              if(row[s] && !state[s]) return false;
            }
            return true;
        }
    }

    $scope.date = new Date();

    $scope.members = {};
    $scope.members.data = null;
    $scope.members.keys = null;

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.loading = false;

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

        function daymonth(date) {
          return date.getDate() + "-" + date.getMonth()
        }
        return daymonth(new Date(birthday)) == daymonth(new Date());
    };

});
