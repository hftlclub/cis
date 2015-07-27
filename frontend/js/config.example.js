var config = {
    server: {
        "host": "http://example.org",
        "port": "3000",
        "path": "/api"
    }
}

config.api = config.server.host + ":" + config.server.port + config.server.path;

config.doorKeyList = [
    {
        key : "123",
        name: "Eingang"
    },
    {
        key : "456",
        name: "Ausgang"
    }
]

angular.module('app.cis').constant('appConf', config);


/*****************************************/



angular.module('app.cis').config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalDisableCountDown(true);
}]);
