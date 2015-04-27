clubAdminApp.controller('floorplanController', function($scope, $rootScope, $http, $routeParams, clubAuth) {

	var map = L.map('map').setView([35, 10], 2);
	var mapWidth = document.getElementById("map").offsetWidth - 100;

	L.tileLayer('../img/floorplan/floormap.svg', {
			tileSize: 820,
			maxZoom: 40,
			minZoom: 2,
			noWrap: true
	}).addTo(map);

});
