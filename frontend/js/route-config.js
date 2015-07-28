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
        controller: 'IndexController',
        template: ''
    }).

    when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
    }).

    /* settings */

    when('/settings', {
        templateUrl: 'templates/settings/index.html',
        controller: 'SettingsIndexController',
        resolve: { refresh: refreshAuth }
    }).

    when('/settings/profile', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'profile';
            },
        }
    }).

    when('/settings/changepassword', {
        templateUrl: 'templates/settings/changepassword.html',
        controller: 'SettingsChangePasswordController',
        resolve: { refresh: refreshAuth }
    }).

    /* manage users */

    when('/users', {
        templateUrl: 'templates/usermanage/list.html',
        controller: 'UserListController',
        resolve: { refresh: refreshAuth }
    }).

    when('/users/filter/:filter*', {
        templateUrl: 'templates/usermanage/list.html',
        controller: 'UserListController',
        resolve: { refresh: refreshAuth }
    }).

    when('/users/add', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'add';
            }
        }
    }).

    when('/users/edit/:id', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'edit';
            }
        }
    }).

    /* member list */

    when('/memberlist', {
        templateUrl: 'templates/memberlist.html',
        controller: 'MemberListController',
        resolve: { refresh: refreshAuth }
    }).

    /* key permission list */

    when('/keylist', {
        templateUrl: 'templates/keylist.html',
        controller: 'KeyListController',
        resolve: { refresh: refreshAuth }
    }).

    when('/keylist/:accesskey', {
        templateUrl: 'templates/keylist.html',
        controller: 'PublicKeyListController',
        resolve: { refresh: refreshAuth }
    }).

    /* club protocol routes */

    when('/protocols', {
        templateUrl: 'templates/protocols/list.html',
        controller: 'ProtocolListController',
        resolve: { refresh: refreshAuth }
    }).

    when('/protocols/add', {
        templateUrl: 'templates/protocols/form.html',
        controller: 'ProtocolFormController',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'add';
            }
        }
    }).

    when('/protocols/edit/:id', {
        templateUrl: 'templates/protocols/form.html',
        controller: 'ProtocolFormController',
        resolve: {
            refresh: refreshAuth,
            clubMode: function() {
                return 'edit';
            }
        }
    }).

    when('/protocols/show/:id', {
        templateUrl: 'templates/protocols/details.html',
        controller: 'ProtocolDetailController',
        resolve: { refresh: refreshAuth }
    }).

    /* about section */

    when('/about', {
        templateUrl: 'templates/about.html',
        resolve: { refresh: refreshAuth }
    });

});
