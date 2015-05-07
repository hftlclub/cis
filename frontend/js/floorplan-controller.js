clubAdminApp.controller('floorplanController', ['$scope', '$rootScope', '$http', '$routeParams', 'clubAuth', 'leafletData', 'leafletBoundsHelpers', function($scope, $rootScope, $http, $routeParams, clubAuth, leafletData, leafletBoundsHelpers) {

	var bounds = [[0, 571],[920, 0]];
	

  var maxBounds = leafletBoundsHelpers.createBoundsFromArray([
    [0, 571],
    [920, 0]
  ]);

  angular.extend($scope, {
	maxBounds: leafletBoundsHelpers.createBoundsFromArray(bounds),
    defaults: {
      crs: 'Simple',
      maxZoom: 4,
      minzoom: 1
		},
	center: {
            lat: 460,
            lng: 285.5,
            zoom: 1
        },
    layers: {
      baselayers: {
        floormap: {
          name: 'Club',
          type: 'imageOverlay',
          url: '../img/floorplan/floormap_base.svg',
          bounds: bounds,
          layerParams: {
            noWrap: true
          }
        }
      },
      overlays: {
        labels: {
          name: 'Labels',
          visible: true,
          type: 'imageOverlay',
          url: '../img/floorplan/floormap_labels.svg',
          bounds: bounds,
          layerParams: {
            noWrap: true
          }
        }
      }
          
    }
  });




  /*$scope.addLocation = function(){
		console.log('Will add location on ' + $scope.latlng.toString());
	}


	var map = L.map('map', {
    	maxZoom: 4,
        minZoom: 1,
        crs: L.CRS.Simple,
        layers: []
    }).setView([460,285.5], 1);

	map.setMaxBounds(new L.LatLngBounds([0,571], [920,0]));


	function onMapClick(e) {
    	console.log(e.latlng.toString());
	}

	//map.on('click', onMapClick);








    var imageBounds = [[0,571], [920,0]];

	L.imageOverlay('../img/floorplan/floormap_base.svg', imageBounds).addTo(map);
	var labels = L.imageOverlay('../img/floorplan/floormap_labels.svg', imageBounds);






	var technikmarker = L.marker([573.5, 186.25]).bindPopup('Techniklager').openPopup();


	var polygon = L.polygon([
    	[500,120],
		[480,120],
		[480,70],
		[500,70]
	],
	{
    	color: '#000000',
		fillColor: '#ff0000',
		fillOpacity: 1
	});

	polygon.bindPopup('<b>Schrank im roten Raum</b><br><br>Limettenstampfer<br>Elektrikzeug<br>Klopapier<br>Icecrusher<br>Schnaps')



	var popup = L.popup();

	map.on('click', function(e) {
    	$scope.latlng = e.latlng;
    	popup
        	.setLatLng(e.latlng)
			.setContent("<a ng-click='addLocation()'><b>Ort hinzufügen</b></a>")
			.openOn(map);
			$scope.$apply();
	});



	var objects = L.layerGroup([polygon, technikmarker]);


	var baseMaps = {
	};

	var overlayMaps = {
	    "Labels": labels,
	    "Objekte": objects
	};


	L.control.layers(baseMaps, overlayMaps).addTo(map);
*/


}]);
