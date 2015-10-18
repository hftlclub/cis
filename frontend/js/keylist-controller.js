angular.module('app.cis').controller('KeyListController', function ($scope, $rootScope, $http, $routeParams, clubAuth, appConf, DTOptionsBuilder, DTColumnBuilder) {
    $scope.listFilter = '';

    $scope.members = {};
    $scope.members.data = null;

    $scope.dt = {};
    $scope.dt.options = DTOptionsBuilder.newOptions()
        .withDisplayLength(9999)    // show all users
        .withOption('ordering', false)
        .withDOM('t')               // manipulate the default DT dom // t: show only table, no extra controls
        .withLanguage({
            "sZeroRecords": "Kein Eintrag entspricht dem eingetragenen Filter!"
        });
    $scope.dt.columDefs = {
        "columnDefs": [
            {
                "render": function (data, rendertype, full, meta) {
                    return full;
                }
            },
            {},
            {
                render: function (data, rendertype, full, meta) {
                    if (rendertype === 'display') {
                        if (data) {
                            return "<span class='glyphicon glyphicon-ok-sign'></span>";
                        } else {
                            return '';
                        }
                    }
                    else {
                        return data;
                    }
                }
            },
        ]
    };
    $scope.tableFiltered = function (filterText) {
        $scope.dt.options.withOption('search', { "search": filterText });
    }

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.keys = appConf.doorKeyList;

    refresh();

    function refresh() {
        $http.get(appConf.api + '/keylist').
            success(function (data) {
                $scope.members.data = data;
            });
    }

    $scope.date = new Date();

});




angular.module('app.cis').controller('PublicKeyListController', function ($scope, $http, $routeParams, appConf) {

    $scope.members = {};
    $scope.members.data = null;

    $scope.keys = appConf.doorKeyList;
    //$scope.isSuperuser = false;
    $scope.isPublic = true;

    refresh();

    function refresh() {
        $http.get(appConf.api + '/keylist/' + $routeParams.accesskey).
            success(function (data) {
                $scope.members.data = data;
            });
    }

    $scope.date = new Date();

});
