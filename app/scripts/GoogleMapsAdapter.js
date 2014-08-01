/* global _, $, google */
'use strict';
var Geocoder = require('./Geocoder');
var Util = require('./Util');
var ArcGISServerAdapter = require('./ArcGISServerAdapter');


/* this class is based on sample code USGSOverlay */
/** @constructor */
function ImageOverlay(bounds, image, map) {
	// Initialize all properties.
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;

	// Define a property to hold the image's div. We'll
	// actually create this div upon receipt of the onAdd()
	// method so we'll leave it null for now.
	this.div_ = null;

	// Explicitly call setMap on this overlay.
	this.setMap(map);
}
ImageOverlay.prototype = new google.maps.OverlayView();
/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
ImageOverlay.prototype.onAdd = function() {

	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';

	// Create the img element and attach it to the div.
	var img = document.createElement('img');
	img.src = this.image_;
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.position = 'absolute';
	div.appendChild(img);

	this.div_ = div;

	// Add the element to the "overlayLayer" pane.
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};

ImageOverlay.prototype.draw = function() {

	// We use the south-west and north-east
	// coordinates of the overlay to peg it to the correct position and size.
	// To do this, we need to retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	// Retrieve the south-west and north-east coordinates of this overlay
	// in LatLngs and convert them to pixel coordinates.
	// We'll use these coordinates to resize the div.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	// Resize the image's div to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
ImageOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

var map;
var overlays = [];
var globalConfigure;
var arcGISMapServices = [];
var previousBounds;
var infoWindow;


var init = function(initParams) {
	var defaultParams = {
		searchControlDivId: 'searchControl',
		orgLatitude: 49.764775,
		orgLongitude: -85.323214,
		orgzoomLevel: 5,
		defaultMapTypeId: google.maps.MapTypeId.ROADMAP,
		mapCanvasDivId: 'map_canvas',
		isCoordinatesVisible: true,
		coordinatesDivId: 'coordinates',
		minMapScale: 5,
		maxMapScale: 21,
		disallowMouseClick: false,
		searchInputBoxDivId: "map_query",
		maxQueryZoomLevel: 17,
		invalidFeatureLocations: [{
			lat: 0,
			lng: 0,
			differnce: 0.0001
		}]
	};
	var params = _.defaults(initParams, defaultParams);
	globalConfigure = params;
	//search = params.search;
	$("#" + params.searchControlDivId).html(params.searchControlHTML);
	var center = new google.maps.LatLng(params.orgLatitude, params.orgLongitude);
	var mapOptions = {
		zoom: params.orgzoomLevel,
		center: center,
		scaleControl: true,
		streetViewControl: true,
		mapTypeId: params.defaultMapTypeId
	};
	map = new google.maps.Map($('#' + params.mapCanvasDivId)[0], mapOptions);

	/*bounds changed*/
	var boundsChangedHandler = function() {
		if(previousBounds) {
			var computeBoundsDifference = function(b1, b2) {
				return Math.abs(b1.getNorthEast().lat() - b2.getNorthEast().lat()) + Math.abs(b1.getNorthEast().lng() - b2.getNorthEast().lng()) + Math.abs(b1.getSouthWest().lat() - b2.getSouthWest().lat()) + Math.abs(b1.getSouthWest().lng() - b2.getSouthWest().lng());
			};
			if (computeBoundsDifference(map.getBounds(), previousBounds) < 0.000000001) {
				return;
			}
		}
		_.each(arcGISMapServices, function(arcGISMapService) {
			arcGISMapService.setMap(null);
		});
		var convertBounds = function(latLngBounds) {
			var latLngNE = latLngBounds.getNorthEast();
			var latLngSW = latLngBounds.getSouthWest();
			return {
				southWest: {lat: latLngSW.lat(), lng: latLngSW.lng()},
				northEast: {lat: latLngNE.lat(), lng: latLngNE.lng()}
			};
		};
		var googleBounds = map.getBounds();
		var bounds = convertBounds(googleBounds);
		var div = map.getDiv();
		var width = div.offsetWidth;
		var height = div.offsetHeight;
		var promises = _.map(params.mapServices, function(mapService) {
			var exportParams =  {
				bounds: bounds,
				width: width,
				height: height,
				mapService: mapService.url,
				visibleLayers: mapService.visibleLayers
			};
			return ArcGISServerAdapter.exportMap(exportParams);
		});
		$.when.apply($, promises).done(function() {
			arcGISMapServices = _.map(arguments, function(argument) {
				return new ImageOverlay(googleBounds, argument.href, map);
			});
		});
		previousBounds = googleBounds;
	};
	/*Check bounds change every second.*/
	setInterval(boundsChangedHandler,1000);
	/*bounds changed*/
	/*mouse move*/
	var	mouseMoveHandler = function(event) {
		if(params.isCoordinatesVisible){
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			var utm = Util.convertLatLngtoUTM(lat, lng);
			var utmLang =  (params.language === "EN") ? {
				UTM_ZoneLang: "UTM Zone",
				EastingLang: "Easting",
				NorthingLang: "Northing"
			} : {
				UTM_ZoneLang: "Zone UTM",
				EastingLang: "abscisse",
				NorthingLang: "ordonn\u00e9e"
			};
			$("#" + params.coordinatesDivId).html("Latitude:" + lat.toFixed(5) + ", Longitude:" + lng.toFixed(5) + " (" + utmLang.UTM_ZoneLang + ":" + utm.Zone + ", " + utmLang.EastingLang + ":" + utm.Easting + ", " + utmLang.NorthingLang +":" + utm.Northing + ")<br>");
		}
	};
	google.maps.event.addListener(map, 'mousemove', mouseMoveHandler);
	google.maps.event.trigger(map, 'mousemove', {latLng: center});
	/*mouse move*/
	/*zoom changed*/
	var zoom_changedHandler = function () {
		if (map.getZoom() > params.maxMapScale) {
			map.setZoom(params.maxMapScale);
		}
		if (map.getZoom() < params.minMapScale) {
			map.setZoom(params.minMapScale);
		}
	}	
	google.maps.event.addListener(map, 'zoom_changed', zoom_changedHandler);
	/*zoom changed*/
	/*mouse click*/
	var mouseClickHandler = function(event) {
		if (infoWindow) {
			infoWindow.setMap(null);
		}
		var gLatLng = event.latLng;
		var latlng = {lat: gLatLng.lat(), lng: gLatLng.lng()};
		var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
		var circle = Util.computeCircle(latlng, identifyRadiusZoomLevels[map.getZoom()]);
		var promises = _.map(params.identifyLayersList, function(layer) {
			var queryParams = {
				mapService: layer.mapService,
				layerID: layer.layerID,
				returnGeometry: false,
				outFields: layer.outFields,
				geometry: circle
			};
			return ArcGISServerAdapter.query(queryParams);
		});
		$.when.apply($, promises).done(function() {
			var featuresLength = Util.computerFeaturesNumber (arguments);
			if (featuresLength === 0) {
				infoWindow.setMap(null);
				return;
			}
			var info = params.computeIdentifyInfoWindows(arguments, globalConfigure);
			openInfoWindow(gLatLng, info);
		});		
	};	
	if (!params.disallowMouseClick) {
		google.maps.event.addListener(map, 'click', mouseClickHandler);
	}
	/*mouse click*/
};

var openInfoWindow = function (latlng, container){
	if (!infoWindow) {
		infoWindow = new google.maps.InfoWindow({
			content: container,
			position: latlng
		});
	} else {
		infoWindow.setContent(container);
		infoWindow.setPosition(latlng);
	}
	infoWindow.open(map);
};



var search = function() {
	var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
	if(searchString.length === 0){
		return;
	}
	var searchParams = globalConfigure.getSearchParams(searchString, globalConfigure);
	var queryLayers = function (queryParamsList, options) {
		_.each(overlays, function(overlay){
			overlay.setMap(null);
		});
		overlays = [];
		var promises = _.map(queryParamsList, function(queryParams) {
			var result = {
				mapService: queryParams.mapService,
				layerID: queryParams.layerID,
				returnGeometry: queryParams.returnGeometry,
				where: queryParams.where,
				outFields: queryParams.outFields		
			};
			if(options.withinExtent) {
				var getCurrentMapExtent = function () {
					var b = map.getBounds();
					var ne = b.getNorthEast();
					var sw = b.getSouthWest();
					var nLat = ne.lat();
					var eLng = ne.lng();
					var sLat = sw.lat();
					var wLng = sw.lng();
					var swLatLng = {lat: sLat, lng: wLng};
					var seLatLng = {lat: sLat, lng: eLng};
					var neLatLng = {lat: nLat, lng: eLng};
					var nwLatLng = {lat: nLat, lng: wLng};
					return [swLatLng, seLatLng, neLatLng, nwLatLng, swLatLng];
				};
				result.geometry = getCurrentMapExtent();
			}
			return ArcGISServerAdapter.query(result);
		});
		$.when.apply($, promises).done(function() {
			var featuresLength = Util.computerFeaturesNumber (arguments);
			if ((featuresLength === 0) && options.geocodeWhenQueryFail) {
				var geocodingParams = options.searchString;
				if (globalConfigure.hasOwnProperty('GeocoderList')) {
					geocodingParams = {
						GeocoderList: globalConfigure.GeocoderList,
						address: options.searchString
					};
				}
				var geocodePromise = geocode(geocodingParams);
				geocodePromise.done(function(result){
					console.log(result);
				});
				return;
			}
			
			var filterResults = function (results, invalidFeatureLocations, f) {
				var returnedResults = [];
				_.each(results, function(result) {
					var clone = _.clone(result);
					clone.features = _.filter(result.features, function (feature) {
						return f(_.some(invalidFeatureLocations, function(location) {
							return Math.abs(location.lng - feature.geometry.x) + Math.abs(location.lat - feature.geometry.y) > location.difference;
						}));
					});
					returnedResults.push(clone);
				});
				return returnedResults;
			};
			var validResults = filterResults(arguments, globalConfigure.invalidFeatureLocations, function(input) {
				return !input;
			});
			var validFeaturesLength = Util.computerFeaturesNumber(validResults);
			var invalidResults = filterResults(arguments, globalConfigure.invalidFeatureLocations, function(input) {
				return input;
			});
			var invalidFeaturesLength = Util.computerFeaturesNumber(invalidResults);

			var markers = globalConfigure.generateSearchResultsMarkers(validResults, globalConfigure);
			_.each(markers, function(marker){
				marker.setMap(map);
				overlays.push(marker);
			});

			if(!options.withinExtent) {
				var convertToGBounds = function(b) {
					var sw = new google.maps.LatLng(b.southWest.lat, b.southWest.lng);
					var ne = new google.maps.LatLng(b.northEast.lat, b.northEast.lng);			 
					var bounds = new google.maps.LatLngBounds(sw, ne);
					return bounds;
				};
				var bounds = convertToGBounds(Util.computePointsBounds(_.map(Util.combineFeatures(validResults), function(feature) {
					return {lng: feature.geometry.x, lat: feature.geometry.y};
				})));
				_.each(arcGISMapServices, function(arcGISMapService) {
					arcGISMapService.setMap(null);
				});
				map.fitBounds(bounds);
				var maxQueryZoomLevel = globalConfigure.maxQueryZoomLevel;
				if (map.getZoom() > maxQueryZoomLevel) {
					map.setZoom(maxQueryZoomLevel);
				}
			}
		});	
	};	
	queryLayers(searchParams.queryParamsList, searchParams.options);
};



var geocode = function(input) {
	var geocodeParams = {};
	if (input.hasOwnProperty('lat') && input.hasOwnProperty('lng')) {
		var reverseGeocoder = function(params) {
			var dfd = new $.Deferred();
			var Geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(input.lat, input.lng);
			Geocoder.geocode({'latLng': latlng}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						var result = {
							address: results[1].formatted_address,
							latlng: params.latlng,
							status: 'OK'
						};
						dfd.resolve(result);
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				} else {
					dfd.resolve({status: 'No_Result'});
				}
			});
			return dfd.promise();
		};
		geocodeParams = {
			latlng: input,
			reverseGeocoder: reverseGeocoder
		};
	} else if (typeof input === 'string') {
		var defaultGeocoder = function(params) {
			var dfd = new $.Deferred();			
			if (params.address.toUpperCase() === "ONTARIO") {
				var result = {
					status: 'No_Result'
				};
				dfd.resolve(result);
			} else {
				//Private method: test whether the input ends with region names.
				var regionAddressProcess = function(addressStr, defaultRegionNames){
					var isAddressEndsWithRegionName = function(address, str) {
						if (address.length > str.length + 1) {
							var substr = address.substring(address.length - str.length - 1);
							if (substr === (" " + str) || substr === ("," + str)) {
								return true;
							}
						}
						return false;
					};					
					var address = addressStr.toUpperCase();
					var res = _.some(defaultRegionNames, function(regionName) {
						return isAddressEndsWithRegionName(address, regionName);
					});
					if(!res){
						return addressStr + " Ontario";
					}
					return addressStr;
				};

				var Geocoder = new google.maps.Geocoder();
				Geocoder.geocode({
					'address': regionAddressProcess(params.address, params.defaultRegionNames)
				}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						var geocodeResult = _.find(results, function(result){
							var point = result.geometry.location;
							var failedPositions = _.filter(params.failedLocation.positions, function(position) {
								return ((Math.abs(point.lat() - position[0]) + Math.abs(point.lng() - position[1])) < params.failedLocation.difference);
							});
							return (failedPositions.length === 0) && (params.validateLatLngInPolygon({lat: point.lat(), lng: point.lng()}, params.regionBoundary));
						});
						if (geocodeResult) {
							var point = geocodeResult.geometry.location;
							var result = {
								latlng: {
									lat: point.lat(),
									lng: point.lng()
								},
								address: params.address,
								geocodedAddress: geocodeResult.formatted_address.toString(),
								status: 'OK'
							};
							dfd.resolve(result);
						} else {
							dfd.resolve({status: 'No_Result'});
						}
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				});
			}
			return dfd.promise();
		};
		geocodeParams = {
			address: input,
			defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
			failedLocation: {
				positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
				difference: 0.00001
			},
			defaultGeocoder: defaultGeocoder
		};
	} else if (input.hasOwnProperty('GeocoderList') && input.hasOwnProperty('address')) {
		geocodeParams = {
			address: input.address,
			GeocoderList: input.GeocoderList
		};
	}
	return Geocoder.geocode(geocodeParams);
};

/*
	Usage: Add the polylines overlays on the map. If the LOCATOR module return the result for Township with/without 
	Lot and Concession, the related polygons will be add to Google Maps by this method. 
	Called by: queryLayerWithPointBuffer 
*/		
var createPolylines = function (rings, strokeOptions){
	return _.map(rings, function(ring) {
		return new google.maps.Polyline({    
			path: _.map(ring, function(pt) {
				return new google.maps.LatLng(pt[1], pt[0]);
			}),
			strokeColor: strokeOptions.color,    
			strokeOpacity: strokeOptions.opacity,   
			strokeWeight: strokeOptions.weight,
			geodesic: false
		});
	});
};

/*
	Usage: Create a marker on a location with pop up content and used icon. 
	Called by: queryLayerWithPointBuffer.
	Rely on: map, openInfoWindow function.  
*/	
/*var createMarker = function (latlng, popupContent, icon) {
	var gLatLng = new google.maps.LatLng(latlng.lat, latlng.lng);
	var marker = new google.maps.Marker({
		position: gLatLng,
		icon: icon
	});
	(function (popupContent, marker) {
		google.maps.event.addListener(marker, 'click', function () {
			MOEMAP.openInfoWindow(marker.getPosition(), popupContent);
		});
	})(popupContent, marker);
	return marker;
};*/



var entsub = function(event){
	if (event && event.which === 13){
		search();
	}else{
		return true;
	}
};
var searchChange = function () {};
var api = {
	init: init,
    geocode: geocode,
    createPolylines: createPolylines,
	search: search,
	entsub: entsub,
	searchChange: searchChange,
	openInfoWindow: openInfoWindow
};

module.exports = api;