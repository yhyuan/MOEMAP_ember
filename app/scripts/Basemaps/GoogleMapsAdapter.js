/* global _, $, google, goog, yepnope */
'use strict';
//var Geocoder = require('./Geocoder');
var Util = require('../Util');
//var ArcGISServerAdapter = require('./ArcGISServerAdapter');
//var ImageOverlay = require('./GoogleMaps/ImageOverlay');
//var PubSub = require('./PubSub');
var PubSub;

var map;
var overlays = [];
var globalConfigure;
var arcGISMapServices = [];
var previousBounds;
var previousBoundsCreatedTime;
var isBoundsChanged = false;
var infoWindow;
//var infoWindowPosition;
var marker;
var pointBufferToolMarker;
var isCenterSet;
var center;
var bufferCircle;

var clear = function () {
	if (infoWindow) {
		infoWindow.setMap(null);
	}
	if (marker) {
		marker.setMap(null);
	}
	if (overlays) {
		_.each(overlays,function (overlay) {
			overlay.setMap(null);	
		});
	}
	$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
	$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
	$("#" + globalConfigure.queryTableDivId).html('');
	$('#' + globalConfigure.informationDivId).html(globalConfigure.searchHelpText);
	var center = new google.maps.LatLng(globalConfigure.orgLatitude, globalConfigure.orgLongitude);
	map.setCenter(center);
	map.setZoom(globalConfigure.orgzoomLevel);
};
/*
var transformInfoWindowPosition = function (latlng) {
	var alatlng = latlng;
	if ((typeof latlng.lat === 'number') && (typeof latlng.lng === 'number')) {
		alatlng = new google.maps.LatLng(latlng.lat, latlng.lng);
	}
	return {
		lat: alatlng.lat() + (map.getBounds().getNorthEast().lat() - map.getBounds().getSouthWest().lat()) * 0.045,
		lng: alatlng.lng()
	};
};*/

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

var openInfoWindow = function (latlng, container){
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
};

var closeInfoWindow = function (){
	if (infoWindow) {
		infoWindow.setMap(null);
	}
};

var search = function(input) {
	var searchString = (!!input) ? input : $('#' + globalConfigure.searchInputBoxDivId).val().trim();

	if(searchString.length === 0){
		return;
	}
	$('#' + globalConfigure.queryTableDivId).html('');
	_.each(overlays, function(overlay){
		overlay.setMap(null);
	});
	overlays = [];
	if (infoWindow) {
		infoWindow.setMap(null);
	}
	if (marker) {
		marker.setMap(null);
	}
	
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
		searchString: searchString, 
		currentMapExtent: getCurrentMapExtent()
	});
};



var entsub = function(event){
	if (event && event.which === 13){
		search();
	}else{
		return true;
	}
};

var searchChange = function (type) {
	if (globalConfigure.hasOwnProperty('searchChange'))  {
		globalConfigure.searchChange(type);
	}
};

var removeTiles = function () {
	_.each(arcGISMapServices, function(arcGISMapService) {
		if ($.isArray(arcGISMapService)) {
			_.each(arcGISMapService, function(element) {
				element.setMap(null);
			});
		} else {
			arcGISMapService.setMap(null);
		}
	});
};

var init = function (thePubSub) {
	PubSub = thePubSub;
	/*
	PubSub.on("MOECC_MAP_BOUNDS_CHANGED", function(googleBounds) {
		if (!googleBounds) {
			return;
		}	
		removeTiles();
		var convertBounds = function(latLngBounds) {
			var latLngNE = latLngBounds.getNorthEast();
			var latLngSW = latLngBounds.getSouthWest();
			return {
				southWest: {lat: latLngSW.lat(), lng: latLngSW.lng()},
				northEast: {lat: latLngNE.lat(), lng: latLngNE.lng()}
			};
		};
		var div = document.getElementById(globalConfigure.mapCanvasDivId);
		PubSub.emit("MOECC_MAP_BOUNDS_CHANGED_REQUEST_READY", {
			bounds: convertBounds(googleBounds),
			width: div.offsetWidth,
			height: div.offsetHeight,
			zoomLevel: map.getZoom()
		});		
	});
	PubSub.on("MOECC_MAP_BOUNDS_CHANGED_RESPONSE_READY", function (results) {
		arcGISMapServices = _.map(results, function(result) {
			if (result.hasOwnProperty('href')) { 
				return new ImageOverlay(map.getBounds(), result.href, map);
			}
		});
	});
	*/
	/*
	PubSub.on("MOECC_MAP_SEARCH_RESPONSE_READY", function (params) {
		PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: params.markers});
		if (params.hasOwnProperty('bounds')) {
			PubSub.emit("MOECC_MAP_SEARCH_BOUNDS_CHANGED", {bounds: params.bounds});
		}
	});
	*/
	PubSub.on("MOECC_MAP_SEARCH_MARKERS_READY", function (params) {
		var markers = _.map(params.markers, function(m) {
			var container = m.container;
			var gLatLng = new google.maps.LatLng(m.latlng.lat, m.latlng.lng);
			var marker = new google.maps.Marker({
				position: gLatLng
			});		
			(function (container, marker) {
				google.maps.event.addListener(marker, 'click', function () {
					openInfoWindow(marker.getPosition(), container);
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
		removeTiles();
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
				openInfoWindow(marker.getPosition(), container);
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
	
	/*
	PubSub.on("MOECC_MAP_GEOCODING_RESULT_READY", function (params) {
		var result = params.result;
		var status = result.status;
		if (result.status === "OK") {
			var gLatLng = new google.maps.LatLng(result.latlng.lat, result.latlng.lng);
			if (params.withinExtent && !map.getBounds().contains(gLatLng)) {
				status = "No_Result";
			} else {
				removeTiles();
				var container = document.createElement('div');
				container.style.width = globalConfigure.infoWindowWidth;
				container.style.height = globalConfigure.infoWindowHeight;
				container.innerHTML = result.address;
				
				marker = new google.maps.Marker({
					position: gLatLng
				});
				(function (container, marker) {
					google.maps.event.addListener(marker, 'click', function () {
						openInfoWindow(marker.getPosition(), container);
					});
				})(container, marker);
				marker.setMap(map);
				
				if(!params.withinExtent) {
					map.setCenter(result.latlng);
					if (result.hasOwnProperty('zoomLevel')) {
						map.setZoom(result.zoomLevel);
					} else {
						map.setZoom(globalConfigure.maxQueryZoomLevel);
					}
				}
				
				if (result.hasOwnProperty('geometry')) {
					_.each(result.geometry, function(elm) {
						_.each(elm.rings, function (ring) {
							var polyline = new google.maps.Polyline({
								path: _.map(ring, function(latlng) {return new google.maps.LatLng(latlng[1], latlng[0]);}),
								geodesic: true,
								strokeColor: result.boundary.color,
								strokeOpacity: result.boundary.opacity,
								strokeWeight: result.boundary.weight
							});
							polyline.setMap(map);
							overlays.push(polyline);
						});
					});
				}
				//console.log((document.getElementById(globalConfigure.searchRadiusDivId) && document.getElementById(globalConfigure.searchRadiusDivId).value));
				if (document.getElementById(globalConfigure.searchRadiusDivId) && document.getElementById(globalConfigure.searchRadiusDivId).value) {
					var radius = document.getElementById(globalConfigure.searchRadiusDivId).value * 1000;
					if(bufferCircle){
						bufferCircle.setMap(null);
					}
					var circle = _.map(Util.computeCircle(result.latlng, radius), function(latlng) {
						return {lat: parseFloat(latlng.lat.toFixed(6)), lng: parseFloat(latlng.lng.toFixed(6))};
					});

					bufferCircle = new google.maps.Polyline({
						path: circle,
						strokeColor: globalConfigure.pointBufferToolCircle.color,  
						strokeOpacity: globalConfigure.pointBufferToolCircle.opacity,
						strokeWeight: globalConfigure.pointBufferToolCircle.weight
					});				
					bufferCircle.setMap(map);					

					PubSub.emit("MOECC_MAP_SEARCH_REQUEST_READY", {
						geometry: circle,
						latlng: result.latlng
					});
				}
			}
		}
		var message = (status === "No_Result") ? (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.address + '</strong> ' + globalConfigure.langs.returnedNoResultLang) : (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.address + '</strong> ' + globalConfigure.langs.returnedOneResultLang);
		$('#' + globalConfigure.informationDivId).html('<i>' + message + ' ' + ((params.withinExtent) ? globalConfigure.langs.inCurrentMapExtentLang : globalConfigure.langs.inGobalRegionLang) + '</i>');		
	});
	*/
	PubSub.on("MOECC_MAP_MOUSE_MOVE", function(latLng) {
		if(globalConfigure.isCoordinatesVisible){
			var utm = Util.convertLatLngtoUTM(latLng.lat, latLng.lng);
			$("#" + globalConfigure.coordinatesDivId).html("Latitude:" + latLng.lat.toFixed(5) + ", Longitude:" + latLng.lng.toFixed(5) + " (" + globalConfigure.langs.UTM_ZoneLang + ":" + utm.Zone + ", " + globalConfigure.langs.EastingLang + ":" + utm.Easting + ", " + globalConfigure.langs.NorthingLang +":" + utm.Northing + ")<br>");
		}
		/*Make sure the user is in the middle of drawing.*/
		if(isCenterSet){							
			if(!!latLng){
				//Calculate the current radius
				var radius = Util.computeDistance(center, latLng);
				//console.log();
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
					finishBufferSearch(radius);
				});
				//update the message to give the user the current circle's centre and radius. 
				drawingCircleMessage(center.lat, center.lng, radius/1000);
			}
		}
	});
	PubSub.on("MOECC_MAP_MOUSE_CLICK", function(latLng) {
		if(isPointBufferToolSelected()){
			if(!isCenterSet){
				center = latLng;
				isCenterSet = true;
			} else {
				var radius = Util.computeDistance(center, latLng);
				finishBufferSearch(radius);
			}
			return;
		}	
		closeInfoWindow();
		var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
		PubSub.emit("MOECC_MAP_IDENTIFY_REQUEST_READY", {latlng: latLng, radius: identifyRadiusZoomLevels[map.getZoom()]});
		
		/*var radius = (globalConfigure.hasOwnProperty('identifyRadius')) ?  globalConfigure.identifyRadius : identifyRadiusZoomLevels[map.getZoom()];
		var circle = Util.computeCircle(latLng, radius);
		var settings = {
			latlng: latLng
		};
		var paramsList = _.map(globalConfigure.identifyParamsList, function (identifyParams) {
			var p = _.clone(identifyParams);
			p.geometry = circle;
			return p;
		});		
		if (globalConfigure.reverseGeocodingForIdentify && globalConfigure.hasOwnProperty('reverseGeocoder')) {
			var reverseGeocoder = _.find(globalConfigure.reverseGeocoder.GeocoderList, function (geocoder) {
				return geocoder.match({latlng: latLng});
			});
			var promise = (reverseGeocoder) ? reverseGeocoder.geocode({latlng: latLng}) : globalConfigure.reverseGeocoder.defaultGeocoder.geocode({latlng: latLng});
			promise.done(function (geocodingResult) {
				settings.geocodingResult = geocodingResult;
				PubSub.emit("MOECC_MAP_IDENTIFY_REQUEST_READY", {settings: settings, paramsList: paramsList});
			});
		} else {
			PubSub.emit("MOECC_MAP_IDENTIFY_REQUEST_READY", {settings: settings, paramsList: paramsList});
		}*/
	});
	PubSub.on("MOECC_MAP_OPEN_INFOWINDOW", function (params) {
		/*if (globalConfigure.hasOwnProperty('displayIdentifyMarker') && globalConfigure.displayIdentifyMarker) {
			if(marker) {
				marker.setMap(null);
			}
			marker = new google.maps.Marker({
				position: params.latlng,
				draggable: true
			});
			var container = params.infoWindow;
			(function (container, marker) {
				google.maps.event.addListener(marker, 'click', function () {
					openInfoWindow(marker.getPosition(), container);
				});
			})(container, marker);
			google.maps.event.addListener(marker, 'dragend', function (e) {
				$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
				$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
				$("#" + globalConfigure.queryTableDivId).html('');
				var latlng = marker.getPosition();
				map.setCenter(latlng);
				google.maps.event.trigger(map, 'click', {latLng: latlng});
			});
			marker.setMap(map);
		} */
		openInfoWindow(params.latlng, params.infoWindow);
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
			//yepnope({load: 'http://lrcdrrvsdvap002/web/arcgislink.js',callback: function(){
				_.each(configure.extraImageServices, function(extraImageService) {
					var agsType = new gmaps.ags.MapType(extraImageService.url, {
						name: extraImageService.name
					});
					map.mapTypes.set(extraImageService.id, agsType);
				});			
			//}});
		}
/*		setInterval(function () {
			if(previousBounds) {
				var computeBoundsDifference = function(b1, b2) {
					return Math.abs(b1.getNorthEast().lat() - b2.getNorthEast().lat()) + Math.abs(b1.getNorthEast().lng() - b2.getNorthEast().lng()) + Math.abs(b1.getSouthWest().lat() - b2.getSouthWest().lat()) + Math.abs(b1.getSouthWest().lng() - b2.getSouthWest().lng());
				};
				var currentBoundsCreatedTime = new Date();
				//console.log(currentBoundsCreatedTime - previousBoundsCreatedTime);
				if ((computeBoundsDifference(map.getBounds(), previousBounds) < 0.000000001) || (currentBoundsCreatedTime - previousBoundsCreatedTime < 1000))  {
					return;
				}
			}
			console.log("MOECC_MAP_BOUNDS_CHANGED");
			var googleBounds = map.getBounds();
			PubSub.emit("MOECC_MAP_BOUNDS_CHANGED", googleBounds);
			previousBounds = googleBounds;
			previousBoundsCreatedTime = new Date();
		},1000);
		*/
		google.maps.event.addListener(map, 'mousemove', function(event) {
			PubSub.emit("MOECC_MAP_MOUSE_MOVE", {lat: event.latLng.lat(), lng: event.latLng.lng()});
		});
		google.maps.event.trigger(map, 'mousemove', {latLng: center});
		google.maps.event.addListener(map, 'zoom_changed', function () {
			var zoomLevel = map.getZoom();
			//console.log(zoomLevel);
			//console.log(map.getBounds().getNorthEast().lat() - map.getBounds().getSouthWest().lat())
			if ((!!marker) &&(!!infoWindow) && (zoomLevel <= configure.maxMapScale) && (zoomLevel >= configure.minMapScale)) {
				//console.log(zoomLevel);
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
		/*setInterval(function () {
			if (isBoundsChanged && previousBoundsCreatedTime && (new Date()  - previousBoundsCreatedTime > globalConfigure.refreshInterval)) {
				var googleBounds = map.getBounds();
				isBoundsChanged = false;
				PubSub.emit("MOECC_MAP_BOUNDS_CHANGED", googleBounds);
			}		
		}, 1);*/
		google.maps.event.addListener(map, 'bounds_changed', function () {
			if (globalConfigure.pointBufferToolAvailable) {
				setPointBufferTool(false);  //The buffer Tool is unselected. 
				var container = "";
				(function (container, pointBufferToolMarker) {
					google.maps.event.addListener(pointBufferToolMarker, 'click', function () {
						setPointBufferTool(true);   //The buffer Tool is selected. 
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
			/*
			removeTiles();
			previousBoundsCreatedTime =  new Date();
			isBoundsChanged = true;
			*/
		});
		PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED", {map: map});
	});
	
	//console.log("OK");
};

var drawingCircleMessage = function(lat, lng, radius){
	$('#' + globalConfigure.informationDivId).html('<i>' + globalConfigure.langs.searchCenterLang + " (latitude:" + lat.toFixed(6) + ", longitude:" + lng.toFixed(6) + "), " + globalConfigure.langs.searchRadiusLang + " (" + radius.toFixed(2) + " " + globalConfigure.langs.searchKMLang + ")" + '</i>');
};

var finishBufferSearch = function(radius) {
	//var circle = Util.computeCircle(center, radius);
	var circle = _.map(Util.computeCircle(center, radius), function(latlng) {
		return {lat: parseFloat(latlng.lat.toFixed(6)), lng: parseFloat(latlng.lng.toFixed(6))};
	});
	$('#' + globalConfigure.queryTableDivId).html('');
	_.each(overlays, function(overlay){
		overlay.setMap(null);
	});
	overlays = [];
	if (infoWindow) {
		infoWindow.setMap(null);
	}
	if (marker) {
		marker.setMap(null);
	}				
	PubSub.emit("MOECC_MAP_SEARCH_REQUEST_READY", {
		geometry: circle,
		latlng: center
	});
	isCenterSet = false;
	setPointBufferTool(false);
	var container = "";
	(function (container, pointBufferToolMarker) {
		google.maps.event.addListener(pointBufferToolMarker, 'click', function () {
			setPointBufferTool(true);   //The buffer Tool is selected. 
		});
	})(container, pointBufferToolMarker);
};
	/*Change the Status of Buffer Tool. If the paramter is true, the Tool is slected. If it is flase, this Tool is unselected.*/
var setPointBufferTool = function (isDownIcon){
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
	//console.log(pointBufferToolMarker.getIcon().url);
};

var isPointBufferToolSelected = function () {
	if (!pointBufferToolMarker)  {
		return false;
	}
	return pointBufferToolMarker.getIcon().url === (globalConfigure.dynamicResourcesLoadingURL + 'images/' + globalConfigure.pointBufferToolDownIcon);
};

var api = {
	init: init,
    //geocode: geocode,
    //createPolylines: createPolylines,
	search: search,
	entsub: entsub,
	searchChange: searchChange,
	openInfoWindow: openInfoWindow,
	//queryLayers: queryLayers,
	clear: clear,
	map: map //For testing purpose
};

module.exports = api;