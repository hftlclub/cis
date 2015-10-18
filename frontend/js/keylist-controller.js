angular.module('app.cis').controller('KeyListController', function ($scope, $rootScope, $http, $routeParams, $compile, clubAuth, appConf, DTOptionsBuilder, DTColumnBuilder) {
    $scope.listFilter = '';

    $scope.isSuperuser = $rootScope.clubUser.superuser;

    $scope.keys = appConf.doorKeyList;

    $scope.dt = {};
    $scope.dt.instance = {};
    $scope.dt.options = DTOptionsBuilder
        .fromSource(appConf.api + '/keylist')
        .withDisplayLength(9999)    // show all users
        .withDOM('ti')              // manipulate the default DT dom // t: show only table, no extra controls
        .withLanguage({
            "sZeroRecords": "Kein Eintrag entspricht dem eingetragenen Filter!",
            "sInfo": "Einträge: _TOTAL_",
            "sInfoEmpty": "Es existieren keine Einträge",
            "sInfoFiltered": "(gefiltert aus _MAX_ Einträgen)"

        })
        .withOption('initComplete', function (settings) {
            // Recompiling so we can bind Angular directive to the DT; used for the tooltips in the table header
            $compile(angular.element('#' + settings.sTableId).contents())($scope);
        })
    ;
    // initialize the DT columns
    $scope.dt.columns = [
        DTColumnBuilder.newColumn('name').withTitle('Name').renderWith(function (data, rendertype, full) { return full.lastname + ', ' + full.firstname; })
    ];
    // initialize dynamic cols for all keys
    angular.forEach($scope.keys, function (key) {
        $scope.dt.columns.push(DTColumnBuilder.newColumn(null).withTitle('<div tooltip-placement="top" tooltip-trigger="mouseenter" tooltip="' + key.name + '">' + key.key + '</div>').withClass('text-center').renderWith(function (data, rendertype, full) {
            if (full.keyPermissions[key.key]) {
                if (rendertype === 'display') {
                    return "<span class='glyphicon glyphicon-ok-sign'></span>";
                } else {
                    return key.key + ' ' + key.name;
                }
            }
            return null;
        }));
    });
    // initialize edit col if applicable
    if ($scope.isSuperuser) {
        $scope.dt.columns.push(DTColumnBuilder.newColumn('username').notSortable().withTitle('<span class="glyphicon glyphicon-cog"></span>').withClass('text-center hidden-print').renderWith(function (data, rendertype, full) {
            if (rendertype === 'display') {
                return '<a ng-href="#/users/edit/' + data + '" type="button" class="btn btn-xs btn-default"><span class="glyphicon glyphicon-pencil" > </span></a>';
            }
            else {
                return data;
            }
        }));
    }
    //
    
    $scope.tableFiltered = function (filterText) {
        $scope.dt.instance.DataTable.search(filterText).draw();
    }

    $scope.date = new Date();

});




angular.module('app.cis').controller('PublicKeyListController', function ($scope, $http, $routeParams, appConf) {
    
    // todo: what is this controller used for?

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
