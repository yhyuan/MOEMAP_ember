/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/Basemaps/GoogleMapsAdapter');
window.GoogleMapsAdapter = GoogleMapsAdapter;
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
//defaultConfiguration.Geocoder = Geocoder;

PubSub.on("MOECC_MAP_GEOCODING_ADDRESS_READY", function(initParams) {
	var params = _.defaults(initParams, GeocoderSettings);
	Geocoder.geocode(params).done(function(result) {
		PubSub.emit("MOECC_MAP_GEOCODING_RESULT_READY", {address: initParams.address, result: result, withinExtent: initParams.withinExtent});
	});
})
PubSub.on("MOECC_MAP_IDENTIFY_REQUEST_READY", function(params) {
	var latLng = params.latlng;
	/*Point Layer Only Begins*/
	var radius = params.radius; //Zoom Level related identify radius. For Google maps, the radius can be [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1] by using zoom level as the index for the array. 
	/*Point Layer Only Ends */
	/*Polygon Layer Only Begins*/
	//var radius = 1; //It is a good idea to use a small identify radius for polygon layer. 
	/*Polygon Layer Only Ends */
	var circle = Util.computeCircle(latLng, radius);
	var settings = {
		latlng: latLng
	};
	var paramsList = _.map(globalConfigure.identifyParamsList, function (identifyParams) {
		var p = _.clone(identifyParams);
		p.geometry = circle;
		return p;
	});
	/*
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
	}
	*/	
	ArcGISServerAdapter.queryLayers(params.paramsList).done(function() {
		/*var geocodingResult = params.settings.geocodingResult;
		if (globalConfigure.hasOwnProperty('transformGeocodingResults')) {
			geocodingResult = globalConfigure.transformGeocodingResults(geocodingResult);
		}*/
		var container = identifyCallback({results: globalConfigure.transformResults(arguments), globalConfigure: globalConfigure, geocodingResult: geocodingResult});
		if (!!container) {
			PubSub.emit("MOECC_MAP_IDENTIFY_RESPONSE_READY", {infoWindow: container, latlng: params.settings.latlng});
		}
	});
});
PubSub.on("MOECC_MAP_BOUNDS_CHANGED_REQUEST_READY", function (request) {
	var promises = _.map(globalConfigure.exportParamsList, function (exportParams) {
		var params = _.clone(exportParams);
		params.bounds = request.bounds;
		params.width = request.width;
		params.height = request.height;
		return ArcGISServerAdapter.exportMap(params)
	});
	$.when.apply($, promises).done(function() {
		PubSub.emit("MOECC_MAP_BOUNDS_CHANGED_RESPONSE_READY", arguments);
	});
});
PubSub.on("MOECC_MAP_SEARCH_REQUEST_READY", function (params) {
	var promises;
	var settings;
	if (params.hasOwnProperty('searchString')) {
		var searchString = params.searchString;
		var geometry = globalConfigure.getSearchGeometry(params);
		var where = globalConfigure.getSearchCondition(params);
		if(!where) {
			return;
		}
		promises = _.map(globalConfigure.queryParamsList, function (queryParams) {
			var p = _.clone(queryParams);
			p.where = where;
			if (geometry) {
				p.geometry = geometry;
			}
			return ArcGISServerAdapter.query(p);
		});
		settings = globalConfigure.getSearchSettings(params);
		settings.bufferGeometry = null;
	}
	if (params.hasOwnProperty('geometry')) {
		//console.log(params);	
		promises = _.map(globalConfigure.queryParamsList, function (queryParams) {
			var p = _.clone(queryParams);
			p.geometry = params.geometry;
			return ArcGISServerAdapter.query(p);
		});
		settings = {
			withinExtent: false,
			latlng: params.latlng,
			bufferGeometry: params.geometry
		};	
	}	
	$.when.apply($, promises).done(function() {
		//console.log(arguments);	
		globalConfigure = _.defaults(settings, globalConfigure);
		var responses = searchCallback({results: globalConfigure.transformResults(arguments), globalConfigure: globalConfigure});
		if (responses.status) { 
			PubSub.emit("MOECC_MAP_SEARCH_RESPONSE_READY", responses);
		} else {
			if (responses.requireGeocoding) {
				PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_READY", {address: responses.address, withinExtent: responses.withinExtent});
			}
		}
	});
});

PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function () {
	
});
GoogleMapsAdapter.init(PubSub);
