/* hack to fix autofill bug (firefox triggers no event on autofilling forms) */
function fixAutofillBug() {
    $('input[ng-model], select[ng-model]').each(function() {
        angular.element(this).controller('ngModel').$setViewValue($(this).val());
    });
}



angular.module('app.cis').controller('MainController', function($scope, $rootScope, $route, $routeParams, $location, $interval, clubAuth, $timeout, $modal, $http, $anchorScroll, $window, appConf) {
    $scope.scrollToTop = function() {
        $anchorScroll('scrollToTopTarget');
    }


    $scope.nav = {
        templateUrl: null,
        logout: clubAuth.logout,
        name: null
    };

    $scope.$on('clubAuthRefreshed', function() {
        if (clubAuth.user && clubAuth.user.username) {
            $scope.nav.templateUrl = 'templates/navbar.html';
            $scope.user = clubAuth.user;
        } else {
            $scope.nav.templateUrl = 'templates/navbar-public.html';
            $scope.nav.name = null;
        }
    });


    //returns random checkword for critical actions
    $rootScope.getCheckWord = function() {
        var checkArray = [
            'Egal bei welchem Wetter',
            'Stecker',
            'DJ Hasi',
            'Clubinformationssystem',
            'Ice Cubes',
            'Mehr Nebel!',
            'Sturakete'
        ]

        return checkArray[Math.floor(Math.random() * checkArray.length)];
    }



    $scope.openFeedbackModal = function() {

        var modalInstance = $modal.open({
            templateUrl: 'templates/feedbackModal.html',
            controller: 'FeedbackModalController'
        });

        modalInstance.result.then(function(data) {
            $http.post(appConf.api + '/feedback', data);
        });
    };

});



angular.module('app.cis').controller('IndexController', function($location, clubAuth) {

    clubAuth.refresh().then(function(){}, function(){});

    if (clubAuth.user) {
        $location.path('/settings');
    } else {
        $location.path('/login');
    }

});




angular.module('app.cis').controller('FeedbackModalController', function($scope, $rootScope, $modalInstance) {
    $scope.data = {};
    $scope.nameSet = false;

    //fill in name if user is logged in
    if ($rootScope.clubUser.firstname && $rootScope.clubUser.lastname) {
        $scope.data.name = $rootScope.clubUser.firstname + " " + $rootScope.clubUser.lastname;
        $scope.nameSet = true;
    }

    $scope.ok = function() {
        $modal.close();
    };
    $scope.cancel = function() {
        $modal.dismiss('cancel');
    };
});
