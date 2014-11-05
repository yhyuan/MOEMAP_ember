/* global _, $, google */
/*JAVASCRIPT
bower_components/underscore/underscore.js
bower_components/yepnope/yepnope.js
bower_components/arcgislink/arcgislink.js
JAVASCRIPT*/

'use strict';

if (!String.prototype.trim) {
  (function(){
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, "");
    }
  })();
}

var GoogleMapsAdapter = require('../scripts/Basemaps/GoogleMapsAdapter');
window.MOECC_UI = {
	entsub: function(event){
		if (event && event.which === 13){
			this.search();
		}else{
			return true;
		}
	},
	searchChange: function (type) {
		if (globalConfigure.hasOwnProperty('searchChange'))  {
			globalConfigure.searchChange(type);
		}
	},
	search: function(input) {
		var searchString = (!!input) ? input : $('#' + globalConfigure.searchInputBoxDivId).val().trim();
		if(searchString.length === 0){
			return;
		}
		PubSub.emit("MOECC_MAP_CLICK_SEARCH_BUTTON", {searchString: searchString});
	}
};

var ArcGISServerAdapter = require('../scripts/FeatureLayers/ArcGISServerAdapter');
var Util = require('../scripts/Util');
/*English Begins*/
var langSetting = require('../scripts/Configures/Languages/English');
/*English Ends*/
/*French Begins*/
var langSetting = require('../scripts/Configures/Languages/French');
/*French Ends*/
var PubSub = require('../scripts/PubSub');
var defaultConfiguration = require('../scripts/Configures/Defaults');
/*Geocoder setup starts*/
var GeographicTownship = require('../scripts/Geocoders/GeographicTownship');
var GeographicTownshipWithLotConcession = require('../scripts/Geocoders/GeographicTownshipWithLotConcession');
var LatLngInDecimalDegree = require('../scripts/Geocoders/LatLngInDecimalDegree');
var LatLngInDMSSymbols = require('../scripts/Geocoders/LatLngInDMSSymbols');
var LatLngInSymbols = require('../scripts/Geocoders/LatLngInSymbols');
var UTM = require('../scripts/Geocoders/UTM');
var UTMInDefaultZone = require('../scripts/Geocoders/UTMInDefaultZone');
var GoogleGeocoder = require('../scripts/Geocoders/GoogleGeocoder');
//var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');
var Geocoder = require('../scripts/Geocoders/Geocoder');
var defaultGeocoderConfigurations = require('../scripts/Geocoders/configurations/default');
var GeocoderSettings = {
	GeocoderList: [LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone, GeographicTownship, GeographicTownshipWithLotConcession],
	defaultGeocoder: GoogleGeocoder/*,
	reverseGeocoder: GoogleReverseGeocoder*/
};
GeocoderSettings = _.defaults(defaultGeocoderConfigurations, GeocoderSettings);
Geocoder.init(GeocoderSettings);
/*Geocoder setup ends*/

PubSub.on("MOECC_MAP_SEARCH_REQUEST_READY", function (params) {
	var infoWindowHeight = '140px';
	var infoWindowWidth = '280px';
	if (params.type === 'search') {
		var initParams = {address: params.searchString, withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);
		Geocoder.geocode(geocodingParams).done(function(result) {
			if (result.status === "OK") {
				

				
				if (result.hasOwnProperty('geometry')) {
					PubSub.emit("MOECC_MAP_ADD_POLYLINES", {
						geometry: result.geometry,
						boundary: result.boundary
					});
				}
				var radius = $('#lstRadius')[0].value * 1000;
				//console.log(radius);
				var circle = Util.computeCircle(result.latlng, radius);
				
				PubSub.emit("MOECC_MAP_ADD_POLYLINES", {
					geometry: [
						{
							rings: [_.map(circle, function(latlng) {
								return [latlng.lng, latlng.lat];
							})]
						}
					],
					boundary: {
						color: '#FF0000',
						opacity: 1,
						weight: 2
					}
				});
				var zoomLevels = {
					1: 14,
					2: 13,
					5: 12,
					10: 11,
					25: 10,
					50: 9
				};
				PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {
					center: result.latlng,
					zoomLevel: zoomLevels[$('#lstRadius')[0].value]//(result.hasOwnProperty('zoomLevel')) ? result.zoomLevel : globalConfigure.maxQueryZoomLevel
				});				
				var queryParamsList = _.map(_.range(5), function(num){
					return {
						mapService: mainMapService,
						layerID: num,
						returnGeometry: false,
						geometry: (num === 4) ? Util.computeCircle(result.latlng, 1) : circle,
						outFields: (num === 4) ? ['*'] : ['TILE']
					};
				});
				ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
					var container = document.createElement('div');
					container.style.width = infoWindowWidth;
					container.style.height = infoWindowHeight;					
					if (arguments[4].features && arguments[4].features.length > 0) {
						var region = arguments[4].features[0].attributes.REGION.replace(' ', '_');
						var fields = ["Crops", "Forest", "Urban", "Raw"];
						var METLinks = _.map(fields, function(field) {
							return "<a href='https://www.ontario.ca/sites/default/files/moe_mapping/mapping/data/met_data/1996_2000_regional_dataset/" + region + "_" + field + ".zip'>" + field + "</a>";
						}).join(', ');						
						var tiles = _.map(Util.combineFeatures(_.initial(arguments)), function(feature) {
							return "<a href='https://www.ontario.ca/sites/default/files/moe_mapping/mapping/data/DEM/tile" + feature.attributes.TILE + ".zip'>" + feature.attributes.TILE + "</a>";
						}).join(', ');
						container.innerHTML = 'The DEM data for <strong>' + params.searchString + '</strong> with radius of <strong>' + $('#lstRadius')[0].value + '</strong> km can be downloaded at the following URLs:<strong>' + tiles + '</strong>';
						container.innerHTML = container.innerHTML + '<br>The MET data for <strong>' + params.searchString + '</strong> can be downloaded at the following URLs:<strong>' + METLinks + '</strong>';
					} else {
						container.innerHTML = 'The location you search is not inside Ontario.';
					}
					PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_MARKER_READY", {container: container, latlng: result.latlng});
					PubSub.emit("MOECC_MAP_OPEN_INFO_WINDOW", {container: container, latlng: result.latlng});
					
					//var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedOneResultLang);
					$('#' + globalConfigure.informationDivId).html('<i>' + container.innerHTML + '.</i>');		
				});
			} else {
				var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedNoResultLang);
				$('#' + globalConfigure.informationDivId).html('<i>' + message + '</i>');		
			}
		});	
	}
});

PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function (params) {
	var map = params.map;
	_.each([mainMapService], function(mapService) {
		var dynamap = new gmaps.ags.MapOverlay(mapService);
		dynamap.setMap(map);	
	});
});

PubSub.on("MOECC_MAP_MOUSE_MOVE_MESSAGE", function (params) {
	var latLng = params.latlng;
	var utm = Util.convertLatLngtoUTM(latLng.lat, latLng.lng);
	$("#" + globalConfigure.coordinatesDivId).html("Latitude:" + latLng.lat.toFixed(5) + ", Longitude:" + latLng.lng.toFixed(5) + " (" + globalConfigure.langs.UTM_ZoneLang + ":" + utm.Zone + ", " + globalConfigure.langs.EastingLang + ":" + utm.Easting + ", " + globalConfigure.langs.NorthingLang +":" + utm.Northing + ")<br>");
});
PubSub.on("MOECC_MAP_POINT_BUFFER_MESSAGE", function (params) {
	var lat = params.center.lat;
	var lng = params.center.lat;
	var radius = params.radiusInKM;
	$('#' + globalConfigure.informationDivId).html('<i>' + globalConfigure.langs.searchCenterLang + " (latitude:" + lat.toFixed(6) + ", longitude:" + lng.toFixed(6) + "), " + globalConfigure.langs.searchRadiusLang + " (" + radius.toFixed(2) + " " + globalConfigure.langs.searchKMLang + ")" + '</i>');
});
PubSub.on("MOECC_MAP_RESET_SEARCH_INPUTBOX", function (params) {
	$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
	$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
});
PubSub.on("MOECC_MAP_RESET_QUERY_TABLE", function (params) {
	$("#" + globalConfigure.queryTableDivId).html('');
});
PubSub.on("MOECC_MAP_RESET_MESSAGE_CENTER", function (params) {
	$('#' + globalConfigure.informationDivId).html(globalConfigure.searchHelpText);
});	
GoogleMapsAdapter.init(PubSub);
var mainMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/AirDispersionModellingMap1/MapServer';
var globalConfigure = {
	langs: langSetting,
	maxMapScale: 21
};
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

/*English Begins*/
$('#' + globalConfigure.otherInfoDivId).html("");	
/*English Ends*/
/*French Begins*/
$('#' + globalConfigure.otherInfoDivId).html('');
/*French Ends*/
/*English Begins*/
$("#" + globalConfigure.searchControlDivId).html('<div id="searchTheMap"></div><div id="searchHelp"></div><br><label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return MOECC_UI.entsub(event)"></input>\
			<label class="option" for="location">\
				with Radius of\
				<select name="searchCriteria.radius" id="lstRadius">\
					<option value="1" >1 km</option>\
					<option value="2" >2 km</option>\
					<option value="5" >5 km</option>\
					<option value="10" >10 km</option>\
					<option value="25" >25 km</option>\
					<option value="50" >50 km</option>\
				</select>\
			</label>\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input id="search_submit" type="submit" title="Search" onclick="MOECC_UI.search()" value="Search"></input>\
	<div id="information">You may search by <strong>address</strong>, <strong>latitude & longitude</strong>, <strong>UTM coordinates</strong> or see help for advanced options.</div>');
/*English Ends*/
/*French Begins*/
$("#" + globalConfigure.searchControlDivId).html('<div id="searchTheMap"></div><div id="searchHelp"></div><br><label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return MOECC_UI.entsub(event)"></input>\
			<label class="option" for="location">\
				with Radius of\
				<select name="searchCriteria.radius" id="lstRadius">\
					<option value="1" >1 km</option>\
					<option value="2" >2 km</option>\
					<option value="5" >5 km</option>\
					<option value="10" >10 km</option>\
					<option value="25" >25 km</option>\
					<option value="50" >50 km</option>\
				</select>\
			</label>\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input id="search_submit" type="submit" title="Search" onclick="MOECC_UI.search()" value="Search"></input>\
	<div id="information">You may search by <strong>address</strong>, <strong>latitude & longitude</strong>, <strong>UTM coordinates</strong> or see help for advanced options.</div>');
/*French Ends*/

//PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);
PubSub.emit("MOECC_MAP_INITIALIZATION", {
	mapCanvasDivId: globalConfigure.mapCanvasDivId,
	orgLatitude: globalConfigure.orgLatitude,
	orgLongitude: globalConfigure.orgLongitude,
	orgzoomLevel: globalConfigure.orgzoomLevel,
	defaultMapTypeId: globalConfigure.defaultMapTypeId,
	maxQueryZoomLevel: globalConfigure.maxQueryZoomLevel,
	dynamicResourcesLoadingURL: globalConfigure.dynamicResourcesLoadingURL,
	maxMapScale: globalConfigure.maxMapScale,
	minMapScale: globalConfigure.minMapScale
});
/*
disallowMouseClick
extraImageServices
pointBufferToolCircle.color,  
pointBufferToolCircle.opacity,
pointBufferToolCircle.weight
pointBufferToolAvailable
legendAvailable
legendLocation
legendSize
legendURL
pointBufferToolSize
pointBufferToolLocation

pointBufferToolDownIcon
pointBufferToolUpIcon
langs.selectTooltip,
*/