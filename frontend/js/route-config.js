angular.module('app.cis').config(function($routeProvider) {

    $routeProvider.
    when('/', {
        controller: 'IndexController',
        template: '',
    }).

    when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginController',
    }).

    /* settings */

    when('/settings', {
        templateUrl: 'templates/settings/index.html',
        controller: 'SettingsIndexController',
    }).

    when('/settings/profile', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            clubMode: function() {
                return 'profile';
            },
        }
    }).

    when('/settings/changepassword', {
        templateUrl: 'templates/settings/changepassword.html',
        controller: 'SettingsChangePasswordController',
    }).

    /* manage users */

    when('/users', {
        templateUrl: 'templates/usermanage/list.html',
        controller: 'UserListController',
    }).

    when('/users/filter/:filter*', {
        templateUrl: 'templates/usermanage/list.html',
        controller: 'UserListController',
    }).

    when('/users/add', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            clubMode: function() {
                return 'add';
            },
        }
    }).

    when('/users/edit/:id', {
        templateUrl: 'templates/usermanage/form.html',
        controller: 'UserFormController',
        resolve: {
            clubMode: function() {
                return 'edit';
            },
        }
    }).

    /* member list */

    when('/memberlist', {
        templateUrl: 'templates/memberlist.html',
        controller: 'MemberListController',
    }).

    /* key permission list */

    when('/keylist', {
        templateUrl: 'templates/keylist.html',
        controller: 'KeyListController',
    }).

    when('/keylist/:accesskey', {
        templateUrl: 'templates/keylist.html',
        controller: 'PublicKeyListController',
    }).

    /* club protocol routes */

    when('/protocols', {
        templateUrl: 'templates/protocols/list.html',
        controller: 'ProtocolListController',
    }).

    when('/protocols/add', {
        templateUrl: 'templates/protocols/form.html',
        controller: 'ProtocolFormController',
        resolve: {
            clubMode: function() {
                return 'add';
            }
        }
    }).

    when('/protocols/edit/:id', {
        templateUrl: 'templates/protocols/form.html',
        controller: 'ProtocolFormController',
        resolve: {
            clubMode: function() {
                return 'edit';
            }
        }
    }).

    when('/protocols/show/:id', {
        templateUrl: 'templates/protocols/details.html',
        controller: 'ProtocolDetailController',
    }).

    /* about section */

    when('/about', {
        templateUrl: 'templates/about.html',
    });

});
