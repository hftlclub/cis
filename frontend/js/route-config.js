
clubAdminApp.config(function($routeProvider) {
	var wipecache = '20140831';

	$routeProvider.
		when('/', {
			controller: 'IndexController',
			template: '',
		}).

		when('/login', {
			templateUrl: 'templates/login.html?wipecache='+wipecache,
			controller: 'LoginController',
		}).

		/* settings */

		when('/settings', {
			templateUrl: 'templates/settings/index.html?wipecache='+wipecache,
			controller: 'SettingsIndexController',
		}).

		when('/settings/profile', {
			templateUrl: 'templates/usermanage/form.html?wipecache='+wipecache,
			controller: 'userFormController',
			resolve : {
				clubMode: function(){ return 'profile'; },
			}
		}).

		when('/settings/changepassword', {
			templateUrl: 'templates/settings/changepassword.html?wipecache='+wipecache,
			controller: 'SettingsChangePasswordController',
		}).

		/* manage users */

		when('/users', {
			templateUrl: 'templates/usermanage/list.html?wipecache='+wipecache,
			controller: 'userListController',
		}).

		when('/users/filter/:filter*', {
			templateUrl: 'templates/usermanage/list.html?wipecache='+wipecache,
			controller: 'userListController',
		}).

		when('/users/add', {
			templateUrl: 'templates/usermanage/form.html?wipecache='+wipecache,
			controller: 'userFormController',
			resolve : {
				clubMode: function(){ return 'add'; },
			}
		}).

		when('/users/edit/:id', {
			templateUrl: 'templates/usermanage/form.html?wipecache='+wipecache,
			controller: 'userFormController',
			resolve : {
				clubMode: function(){ return 'edit'; },
			}
		}).

		/* member list */
		when('/memberlist', {
			templateUrl: 'templates/memberlist.html?wipecache='+wipecache,
			controller: 'memberListController',
		}).

		/* key permission list */
		when('/keylist', {
			templateUrl: 'templates/keylist.html?wipecache='+wipecache,
			controller: 'keyListController',
		}).

		/* about section */
		when('/about', {
			templateUrl: 'templates/about.html?wipecache='+wipecache,
		});

});
