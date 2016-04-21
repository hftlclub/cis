angular.module('app.cis').controller('LoginCtrl', function($scope, $http, $location, $uibModal, $cookies, clubAuth, $timeout, ngAudio, growl, appConf) {

    $scope.login = {};
    $scope.login.data = {};
    $scope.login.submit = submit;

    $scope.chord = ngAudio.load('media/cismajor.mp3');

    clubAuth.refresh().then(function(){}, function(){});


    $scope.openPwForgotModal = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/login/templates/pwForgotModal.html',
        });
    };

    function submit() {
        //fixAutofillBug();
        $http.post(appConf.api + '/login', {
            'username': $scope.login.data.username,
            'password': $scope.login.data.password
        }).
        success(function(data) {
            var expires = new Date();
            expires.setDate(expires.getDate() + 1); //one day
            $cookies.put('accessToken', data.token, { expires: expires });

            $http.defaults.headers.common['X-Access-Token'] = data.token;

            growl.success('Erfolgreich angemeldet!');
            //$scope.chord.play();

            clubAuth.refresh().then(function(){}, function(){});
        }).
        error(function(data, status) {
            growl.error('Benutzername oder Passwort nicht korrekt.');
        });

    }
});
