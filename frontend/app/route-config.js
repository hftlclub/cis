/*angular.module('app.cis').service('authPromiseService', function(clubAuth) {
    return clubAuth.refresh();
    //refresh: 'authPromiseService'
});*/



angular.module('app.cis').config(function($routeProvider) {

    var refreshAuth = function (clubAuth){
        return clubAuth.refresh();
    }



    $routeProvider.
    when('/', {
        templateUrl: 'app/index/templates/landingPage.html',
        controller: 'IndexCtrl',
        resolve: { refresh: refreshAuth }
    }).

    when('/login', {
        templateUrl: 'app/login/templates/login.html',
        controller: 'LoginCtrl'
    }).

    /* settings */

    when('/settings', {
        templateUrl: 'app/settings/templates/index.html',
        resolve: { refresh: refreshAuth }
    }).

    when('/settings/profile', {
        templateUrl: 'app/user/templates/form.html',
        controller: 'UserFormCtrl',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'profile';
            },
        }
    }).

    when('/settings/changepassword', {
        templateUrl: 'app/settings/templates/changepassword.html',
        controller: 'SettingsChangePasswordCtrl',
        resolve: { refresh: refreshAuth }
    }).

    /* manage users */

    when('/users', {
        templateUrl: 'app/user/templates/list.html',
        controller: 'UserListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    when('/users/filter/:filter*', {
        templateUrl: 'app/user/templates/list.html',
        controller: 'UserListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    when('/users/add', {
        templateUrl: 'app/user/templates/form.html',
        controller: 'UserFormCtrl',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'add';
            }
        }
    }).

    when('/users/edit/:id', {
        templateUrl: 'app/user/templates/form.html',
        controller: 'UserFormCtrl',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'edit';
            }
        }
    }).


    /* calendar list */

    when('/calendar', {
        templateUrl: 'app/calendar/templates/calendar.html',
        controller: 'CalendarCtrl',
        resolve: { refresh: refreshAuth }
    }).

    /* member list */

    when('/memberlist', {
        templateUrl: 'app/memberlist/templates/memberlist.html',
        controller: 'MemberListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    /* key permission list */

    when('/keylist', {
        templateUrl: 'app/keylist/templates/keylist.html',
        controller: 'KeyListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    when('/keylist/:accesskey', {
        templateUrl: 'app/keylist/templates/keylist.html',
        controller: 'PublicKeyListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    /* club protocol routes */

    when('/protocols', {
        templateUrl: 'app/protocols/templates/list.html',
        controller: 'ProtocolListCtrl',
        resolve: { refresh: refreshAuth }
    }).

    when('/protocols/add', {
        templateUrl: 'app/protocols/templates/form.html',
        controller: 'ProtocolFormCtrl',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'add';
            }
        }
    }).

    when('/protocols/edit/:id', {
        templateUrl: 'app/protocols/templates/form.html',
        controller: 'ProtocolFormCtrl',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'edit';
            }
        }
    }).

    when('/protocols/show/:id', {
        templateUrl: 'app/protocols/templates/details.html',
        controller: 'ProtocolDetailCtrl',
        resolve: { refresh: refreshAuth }
    }).

    /* WLAN documentation */

    when('/wlan', {
        templateUrl: 'app/common/templates/wlan.html',
        resolve: { refresh: refreshAuth }
    }).

    /* about section */

    when('/about', {
        templateUrl: 'app/common/templates/about.html',
        resolve: { refresh: refreshAuth }
    });

});
