angular.module('app.cis').controller('MemberListController', function($scope, $rootScope, $http, $routeParams, clubAuth, appConf) {

    $scope.members = {};
    $scope.members.data = null;
    $scope.members.keys = null;

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.memberlistLoading = false;

    $scope.formerHidden = true;

    refresh();

    function refresh() {
        // show loading bar
        $scope.memberlistLoading = true;

        $http.get(appConf.api + '/members').
        success(function(data) {
            $scope.members.data = data;

            $http.get(appConf.api + '/keylist').
            success(function(data) {
                $scope.members.data.forEach(function(user) {
                    data.forEach(function(key) {
                        if (user.username == key.username)
                            user.keyPermissions = key.keyPermissions;
                    });
                });
                // hide loading bar
                $scope.memberlistLoading = false;
            });
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

    $scope.attrlist = ['index', 'name', 'alias', 'tel', 'email', 'role', 'td', 'addr', 'birthday', 'accdate', 'keyPermissions', 'status'];
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
        'td': {
            'order': 'teamdrive',
            'state': false,
            'label': 'TeamDrive'
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

    $scope.formerFilter = function() {
        if ($scope.formerHidden) $scope.formerHidden = false
        else $scope.formerHidden = true;
    };

    $scope.isBirthday = function(birthday) {
        if (!birthday) return false;
        return (new Date(birthday).toDateString() == new Date().toDateString());
    };

    $scope.date = new Date();

});
