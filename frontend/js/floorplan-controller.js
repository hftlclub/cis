clubAdminApp.controller('floorplanController', ['$scope', '$rootScope', '$http', '$routeParams', '$modal', 'clubAuth', 'leafletData', 'leafletBoundsHelpers', 'leafletPathsHelpers', function($scope, $rootScope, $http, $routeParams, $modal, clubAuth, leafletData, leafletBoundsHelpers, leafletPathsHelpers) {

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

     controls: {
                    draw: {
	                    polyline: false,
	                    circle: false,
	                    marker: false
                    }
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
  
 
  
  leafletData.getMap().then(function(map) {
  	$scope.controls.edit = { featureGroup : new L.FeatureGroup() };
  	map.addLayer($scope.controls.edit.featureGroup);
  	
  	var drawControl = new L.Control.Draw($scope.controls);
	map.addControl(drawControl);
         
         
         
         
         var drawnItems = $scope.controls.edit.featureGroup;
        
         
         var mypath1 = new L.Rectangle([
	         [562.5, 78],
	         [589.5, 78],
	         [589.5, 157.5],
	         [562.5, 157.5],
	         [562.5, 78]
         ]);
         console.log(mypath1);
         drawnItems.addLayer(mypath1);
         
         
         
         
			  
              map.on('draw:created', function (e) {
                var layer = e.layer;
                
                layer.on('click', function(e){
	                var modal = $modal.open({
						templateUrl: 'templates/floorplan/locationeditmodal.html',
							//controller: 'delModalController',
							resolve: {
							
							}		
					});

					modal.result.then(function(){
						//success();
					});
				});

                
                drawnItems.addLayer(layer);
                
                var out = {
	                id: e.layer._leaflet_id,
	                type: e.layerType,
	                latlngs: []
                };
                
                for(var i = 0; i < e.layer._latlngs.length; i++){
	                out.latlngs.push([e.layer._latlngs[i].lat, e.layer._latlngs[i].lng]);
                }
				
                console.log('created', out);
              });
              
              
              map.on('draw:edited', function (e) {
                
                console.log('edited', e);
              });
              
              
              map.on('draw:deleted', function (e) {
                
                console.log('deleted', e);
              });
              
              
           });
  


}]);
