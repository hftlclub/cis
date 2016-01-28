angular.module('app.cis').controller('MainCtrl', function($scope, $rootScope, $route, $routeParams, $location, $interval, clubAuth, $timeout, $uibModal, $http, $anchorScroll, $window, appConf) {
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
            $scope.nav.templateUrl = 'app/common/templates/navbar/navbar.html';
            $scope.user = clubAuth.user;
        } else {
            $scope.nav.templateUrl = 'app/common/templates/navbar/navbar-public.html';
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

        var modalInstance = $uibModal.open({
            templateUrl: 'app/common/templates/feedbackModal.html',
            controller: 'ModalFeedbackCtrl'
        });

        modalInstance.result.then(function(data) {
            $http.post(appConf.api + '/feedback', data);
        });
    };

});
