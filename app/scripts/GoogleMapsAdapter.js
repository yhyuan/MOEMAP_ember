/* global _, $, google */
'use strict';
var geocoder = require('./geocoder');

var geocode = function(input) {
	var geocodeParams = {};
	if (input.hasOwnProperty('lat') && input.hasOwnProperty('lng')) {
		var reverseGeocoder = function(params) {
			var dfd = new $.Deferred();
			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(input.lat, input.lng);
			geocoder.geocode({'latLng': latlng}, function(results, status) {
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
	} else {
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

				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
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
	}
	return geocoder.geocode(geocodeParams);
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

var getIdentifyRadius = function(zoomLevel) {
	var identifyRadiusZoomLevelList = {
		21 : 0.001,
		20 : 0.001,
		19 : 0.002,
		18 : 0.003,
		17 : 0.005,
		16 : 0.01,
		15 : 0.02,
		14 : 0.05,
		13 : 0.08,
		12 : 0.16,
		11 : 0.3,
		10 : 0.6,
		9  : 1.2,
		8  : 2.4,
		7  : 4.8,
		6  : 9.6,
		5  : 20,
		4  : 40,
		3  : 80,
		2  : 160,
		1  : 320
	};
	return identifyRadiusZoomLevelList[zoomLevel] * 1000; // in meters
};
var api = {
    geocode: geocode,
    getIdentifyRadius: getIdentifyRadius, 
    createPolylines: createPolylines
};

module.exports = api;