clubAdminApp.controller('floorplanController', ['$scope', '$rootScope', '$http', '$routeParams', 'clubAuth', 'leafletData', 'leafletBoundsHelpers', function($scope, $rootScope, $http, $routeParams, clubAuth, leafletData, leafletBoundsHelpers) {

	var bounds = [[0, 571],[920, 0]];
	
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


}]);
