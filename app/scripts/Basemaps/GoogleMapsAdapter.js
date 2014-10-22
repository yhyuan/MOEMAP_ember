/* global _, $, google, goog, yepnope */
'use strict';
var Util = require('../Util');
var PubSub; //The message centre, which receives and passes messages between modules. 
var map; // Google Maps object
var overlays = [];
var globalConfigure;
var infoWindow;
var marker;
var pointBufferToolMarker;
var isCenterSet;
var center;
var bufferCircle;

var calculatePosition = function (latlng) {
	var lat = latlng.lat;
	var lng = latlng.lng;
	var latDiffArray = [168.4739167, 122.5282531, 67.56290887, 34.20775832, 17.13055844];
	var zoomLevel = map.getZoom();
	/*if zoom level is less than 6, pick it from the list. Otherwise, use a formula to calculate it.*/
	var latDiff = (zoomLevel <= 5) ? latDiffArray[zoomLevel - 1] : latDiffArray[4]/Math.pow(2, zoomLevel - 5);
	lat = lat + latDiff * 0.06;
	return {lat: lat, lng: lng};
};
var isInfoWindowOverlappedMarker = function(latlng) {
	var p = marker.getPosition();
	return (Math.abs(p.lat() - latlng.lat) < 0.000001) && (Math.abs(p.lng() - latlng.lng) < 0.000001);
};

var init = function (thePubSub) {
	PubSub = thePubSub;
	PubSub.on("MOECC_MAP_RESET_MAP", function () {
		var center = new google.maps.LatLng(globalConfigure.orgLatitude, globalConfigure.orgLongitude);
		map.setCenter(center);
		map.setZoom(globalConfigure.orgzoomLevel);	
	});
	PubSub.on("MOECC_MAP_REMOVE_GEOCODING_MARKER", function () {
		if (marker) {
			marker.setMap(null);
		}
	});
	PubSub.on("MOECC_MAP_OPEN_INFO_WINDOW", function (params) {
		var latlng = params.latlng;
		var container = params.container;
		
		var alatlng = latlng;
		if(!!marker && isInfoWindowOverlappedMarker(latlng)) {
			alatlng = calculatePosition(latlng);
		}
		if (!infoWindow) {
			infoWindow = new google.maps.InfoWindow({
				content: container,
				position: alatlng
			});
		} else {
			infoWindow.setContent(container);
			infoWindow.setPosition(alatlng);
		}
		infoWindow.originalPosition = latlng;
		infoWindow.open(map);
	});
	PubSub.on("MOECC_MAP_REMOVE_INFO_WINDOW", function () {
		if (infoWindow) {
			infoWindow.setMap(null);
		}
	});
	PubSub.on("MOECC_MAP_REMOVE_OVERLAYS", function () {
		if (overlays) {
			_.each(overlays,function (overlay) {
				overlay.setMap(null);
			});
			overlays = [];
		}
	});	
	PubSub.on("MOECC_MAP_CLEAR_APPLICATION", function () {
		PubSub.emit("MOECC_MAP_REMOVE_OVERLAYS");
		PubSub.emit("MOECC_MAP_REMOVE_GEOCODING_MARKER");
		PubSub.emit("MOECC_MAP_REMOVE_INFO_WINDOW");
		PubSub.emit("MOECC_MAP_RESET_SEARCH_INPUTBOX");
		PubSub.emit("MOECC_MAP_RESET_QUERY_TABLE");
		PubSub.emit("MOECC_MAP_RESET_MESSAGE_CENTER");
		PubSub.emit("MOECC_MAP_RESET_MAP");
	});
	PubSub.on("MOECC_MAP_CLICK_SEARCH_BUTTON", function (params) {
		PubSub.emit("MOECC_MAP_RESET_QUERY_TABLE");
		PubSub.emit("MOECC_MAP_REMOVE_OVERLAYS");
		PubSub.emit("MOECC_MAP_REMOVE_INFO_WINDOW");
		PubSub.emit("MOECC_MAP_REMOVE_GEOCODING_MARKER");
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
		PubSub.emit("MOECC_MAP_SEARCH_REQUEST_READY", {
			searchString: params.searchString, 
			currentMapExtent: getCurrentMapExtent(),
			type: 'search'
		});
	});
	PubSub.on("MOECC_MAP_BUFFER_SEARCH_RADIUS_READY", function (params) {	
		var radius = params.radius;
		PubSub.emit("MOECC_MAP_RESET_QUERY_TABLE");
		PubSub.emit("MOECC_MAP_REMOVE_OVERLAYS");
		PubSub.emit("MOECC_MAP_REMOVE_INFO_WINDOW");
		PubSub.emit("MOECC_MAP_REMOVE_GEOCODING_MARKER");
		
		PubSub.emit("MOECC_MAP_SEARCH_REQUEST_READY", {
			geometry: _.map(Util.computeCircle(center, radius), function(latlng) {
					return {lat: parseFloat(latlng.lat.toFixed(6)), lng: parseFloat(latlng.lng.toFixed(6))};
				}),
			latlng: center,
			type: 'search'
		});
		isCenterSet = false;
		PubSub.emit("MOECC_MAP_BUFFERTOOL_STATUS_CHANGE", {status: false});
		var container = "";
		(function (container, pointBufferToolMarker) {
			google.maps.event.addListener(pointBufferToolMarker, 'click', function () {
				PubSub.emit("MOECC_MAP_BUFFERTOOL_STATUS_CHANGE", {status: true});
			});
		})(container, pointBufferToolMarker);
	});
	PubSub.on("MOECC_MAP_SEARCH_MARKERS_READY", function (params) {
		var markers = _.map(params.markers, function(m) {
			var container = m.container;
			var gLatLng = new google.maps.LatLng(m.latlng.lat, m.latlng.lng);
			var marker = new google.maps.Marker({
				position: gLatLng
			});		
			(function (container, marker) {
				google.maps.event.addListener(marker, 'click', function () {
					PubSub.emit("MOECC_MAP_OPEN_INFO_WINDOW", {latlng: marker.getPosition(), container: container});
				});
			})(container, marker);
			return marker;
		});
		_.each(markers, function(marker){
			marker.setMap(map);
			overlays.push(marker);
		});		
	});
	PubSub.on("MOECC_MAP_SEARCH_BOUNDS_CHANGED", function (params) {
		var convertToGBounds = function(b) {
			var sw = new google.maps.LatLng(b.southWest.lat, b.southWest.lng);
			var ne = new google.maps.LatLng(b.northEast.lat, b.northEast.lng);			 
			var bounds = new google.maps.LatLngBounds(sw, ne);
			return bounds;
		};
		var bounds = convertToGBounds(params.bounds);
		map.fitBounds(bounds);
		if (map.getZoom() > globalConfigure.maxQueryZoomLevel) {
			map.setZoom(globalConfigure.maxQueryZoomLevel);
		}
	});
	PubSub.on("MOECC_MAP_GEOCODING_ADDRESS_MARKER_READY", function (params) {
		var gLatLng = new google.maps.LatLng(params.latlng.lat, params.latlng.lng);
		var container = params.container;
		marker = new google.maps.Marker({
			position: gLatLng
		});
		(function (container, marker) {
			google.maps.event.addListener(marker, 'click', function () {
				PubSub.emit("MOECC_MAP_OPEN_INFO_WINDOW", {latlng: marker.getPosition(), container: container});
			});
		})(container, marker);
		marker.setMap(map);		
	});
	PubSub.on("MOECC_MAP_SET_CENTER_ZOOMLEVEL", function (params) {
		map.setCenter(params.center);
		map.setZoom(params.zoomLevel);
	});
	PubSub.on("MOECC_MAP_ADD_POLYLINES", function (params) {
		_.each(params.geometry, function(elm) {
			_.each(elm.rings, function (ring) {
				var polyline = new google.maps.Polyline({
					path: _.map(ring, function(latlng) {return new google.maps.LatLng(latlng[1], latlng[0]);}),
					geodesic: true,
					strokeColor: params.boundary.color,
					strokeOpacity: params.boundary.opacity,
					strokeWeight: params.boundary.weight
				});
				polyline.setMap(map);
				overlays.push(polyline);
			});
		});
	});
	PubSub.on("MOECC_MAP_MOUSE_MOVE", function(latLng) {
		PubSub.emit("MOECC_MAP_MOUSE_MOVE_MESSAGE", {
			latlng: latLng
		});
		/*Make sure the user is in the middle of drawing.*/
		if(isCenterSet){							
			if(!!latLng){
				//Calculate the current radius
				var radius = Util.computeDistance(center, latLng);
				//Remove the old circle
				if(bufferCircle){
					bufferCircle.setMap(null);
				}
				var circle = Util.computeCircle(center, radius);
				bufferCircle = new google.maps.Polyline({
					path: circle,
					strokeColor: globalConfigure.pointBufferToolCircle.color,  
					strokeOpacity: globalConfigure.pointBufferToolCircle.opacity,
					strokeWeight: globalConfigure.pointBufferToolCircle.weight
				});
				bufferCircle.setMap(map);
				google.maps.event.addListener(bufferCircle, 'click', function () {
					PubSub.emit("MOECC_MAP_BUFFER_SEARCH_RADIUS_READY", {radius: radius});
				});
				//update the message to give the user the current circle's centre and radius. 
				PubSub.emit("MOECC_MAP_POINT_BUFFER_MESSAGE", {
					center: center,
					radiusInKM: radius/1000
				});				
			}
		}
	});
	PubSub.on("MOECC_MAP_MOUSE_CLICK", function(latLng) {
		if(pointBufferToolMarker && (pointBufferToolMarker.getIcon().url === (globalConfigure.dynamicResourcesLoadingURL + 'images/' + globalConfigure.pointBufferToolDownIcon))){
			if(!isCenterSet){
				center = latLng;
				isCenterSet = true;
			} else {
				var radius = Util.computeDistance(center, latLng);
				PubSub.emit("MOECC_MAP_BUFFER_SEARCH_RADIUS_READY", {radius: radius});
			}
			return;
		}
		PubSub.emit("MOECC_MAP_REMOVE_INFO_WINDOW");
		var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
		PubSub.emit("MOECC_MAP_SEARCH_REQUEST_READY", {type: 'identify', latlng: latLng, radius: identifyRadiusZoomLevels[map.getZoom()]});
	});
	PubSub.on("MOECC_MAP_BUFFERTOOL_STATUS_CHANGE", function(params) {
		var isDownIcon = params.status;
		/*Change the Status of Buffer Tool. If the paramter is true, the Tool is slected. If it is flase, this Tool is unselected.*/
		if(pointBufferToolMarker){
			pointBufferToolMarker.setMap(null);
		}
		var pointBufferToolSize = globalConfigure.pointBufferToolSize;
		var pointBufferToolLocation = globalConfigure.pointBufferToolLocation;
		var bounds = map.getBounds();
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		var latDiff = ne.lat() - sw.lat();
		var lngDiff = ne.lng() - sw.lng();
		var gLatlng = new google.maps.LatLng(sw.lat() + pointBufferToolLocation.ratioY*latDiff, sw.lng() + pointBufferToolLocation.ratioX*lngDiff);
		var iconURL = globalConfigure.dynamicResourcesLoadingURL + 'images/' + ((isDownIcon) ? globalConfigure.pointBufferToolDownIcon : globalConfigure.pointBufferToolUpIcon);
		var icon = new google.maps.MarkerImage(iconURL, new google.maps.Size(pointBufferToolSize.width, pointBufferToolSize.height),
				new google.maps.Point(0, 0), new google.maps.Point(0, 0), new google.maps.Size(pointBufferToolSize.width, pointBufferToolSize.height));
		pointBufferToolMarker = new google.maps.Marker({
			position: gLatlng,
			icon: icon,
			title: globalConfigure.langs.selectTooltip,
			map: map
		});
	});
	PubSub.on("MOECC_MAP_INITIALIZATION", function(configure) {
		globalConfigure = configure;
		var center = new google.maps.LatLng(configure.orgLatitude, configure.orgLongitude);
		var mapOptions = {
			zoom: configure.orgzoomLevel,
			center: center,
			scaleControl: true,
			streetViewControl: true,
			mapTypeId: configure.defaultMapTypeId
		};
		if (configure.hasOwnProperty('extraImageServices')) {
			var ids = _.map(configure.extraImageServices, function(extraImageService) {return extraImageService.id;});
			mapOptions.mapTypeControlOptions = {
				mapTypeIds: ids.concat([google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN])
			};
		}
		map = new google.maps.Map($('#' + configure.mapCanvasDivId)[0], mapOptions);
		if (configure.hasOwnProperty('extraImageServices')) {
			_.each(configure.extraImageServices, function(extraImageService) {
				var agsType = new gmaps.ags.MapType(extraImageService.url, {
					name: extraImageService.name
				});
				map.mapTypes.set(extraImageService.id, agsType);
			});			
		}
		google.maps.event.addListener(map, 'mousemove', function(event) {
			PubSub.emit("MOECC_MAP_MOUSE_MOVE", {lat: event.latLng.lat(), lng: event.latLng.lng()});
		});
		google.maps.event.trigger(map, 'mousemove', {latLng: center});
		google.maps.event.addListener(map, 'zoom_changed', function () {
			var zoomLevel = map.getZoom();
			if ((!!marker) &&(!!infoWindow) && (zoomLevel <= configure.maxMapScale) && (zoomLevel >= configure.minMapScale)) {
				infoWindow.setPosition(calculatePosition(infoWindow.originalPosition));
			}
			if (zoomLevel > configure.maxMapScale) {
				map.setZoom(configure.maxMapScale);
			}
			if (zoomLevel < configure.minMapScale) {
				map.setZoom(configure.minMapScale);
			}
		});
		if (!configure.disallowMouseClick) {
			google.maps.event.addListener(map, 'click', function(event) {
				PubSub.emit("MOECC_MAP_MOUSE_CLICK", {lat: event.latLng.lat(), lng: event.latLng.lng()});
			});
		}
		google.maps.event.addListener(map, 'bounds_changed', function () {
			if (globalConfigure.pointBufferToolAvailable) {
				PubSub.emit("MOECC_MAP_BUFFERTOOL_STATUS_CHANGE", {status: false});
				var container = "";
				(function (container, pointBufferToolMarker) {
					google.maps.event.addListener(pointBufferToolMarker, 'click', function () {
						PubSub.emit("MOECC_MAP_BUFFERTOOL_STATUS_CHANGE", {status: true});
					});
				})(container, pointBufferToolMarker);
			}
			if (globalConfigure.legendAvailable) {
				var sw = bounds.getSouthWest();
				var ne = bounds.getNorthEast();
				var latDiff = ne.lat() - sw.lat();
				var lngDiff = ne.lng() - sw.lng();
				var location = globalConfigure.legendLocation;
				var gLatLng = new google.maps.LatLng(sw.lat() + location.ratioY*latDiff, sw.lng() + location.ratioX*lngDiff);
				if(legendMarker){
					legendMarker.setMap(null);
				}
				var size = globalConfigure.legendSize;
				var icon = new google.maps.MarkerImage(globalConfigure.legendURL, new google.maps.Size(size.width, size.height),
					new google.maps.Point(0, 0), new google.maps.Point(0, 0), new google.maps.Size(size.width, size.height));
				legendMarker = new google.maps.Marker({
					position: gLatLng,
					icon: icon,
					map: map
				});
			}
		});
		PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED", {map: map});
	});
};

var api = {
	init: init,
	map: map //For testing purpose
};

module.exports = api;