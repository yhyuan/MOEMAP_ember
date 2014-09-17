var Util = require('../Util');

var api = function(params) {
	var PubSub = params.PubSub;
	var results = params.results;
	var featuresLength = Util.computeFeaturesNumber (results);
	var settings = params.settings;
	if ((featuresLength === 0) && settings.hasOwnProperty('geocodeWhenQueryFail') && settings.geocodeWhenQueryFail && settings.hasOwnProperty('searchString')) {
		var geocodingParams = settings.searchString;
		PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_READY", {address: settings.searchString});
		/*
		if (settings.hasOwnProperty('GeocoderList')) {
			geocodingParams = {
				GeocoderList: settings.GeocoderList,
				address: settings.searchString
			};
		}
		var geocodePromise = geocode(geocodingParams);
		geocodePromise.done(function(result){
			if (result.status === "OK") {
				//result.latlng result.geocodedAddress, map zoom to specific area, add a location pin to the location, update search message.
			} else {
				//update search meesage
			}
		});
		return;
		*/
	} else {
		var splited = Util.splitResults(results, settings.invalidFeatureLocations);
		var invalidNumber = Util.computeFeaturesNumber (splited.invalidResults);
		var validFeatures, invalidFeatures;
		var validTableID = Util.getTableIDFromTableTemplate(params.tableTemplate);
		if (invalidNumber > 0) {
			validFeatures = Util.combineFeatures(splited.validResults);
			invalidFeatures = Util.combineFeatures(splited.invalidResults);
			var str1 = _.template(params.tableTemplate, {features: validFeatures});
			var str2 = _.template(params.invalidTableTemplate, {features: invalidFeatures});
			var invalidtableID = Util.getTableIDFromTableTemplate(params.invalidTableTemplate);
			PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY", {tableContent: str1 + '<br><br>' + str2, validTableID: validTableID, invalidtableID: invalidtableID});
		} else {
			validFeatures = Util.combineFeatures(results);
			PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY", {tableContent: _.template(params.tableTemplate, {features: validFeatures}), validTableID: validTableID});
		}
		
		var markers = _.map(validFeatures, function(feature) {
			var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
			var container = document.createElement('div');
			container.style.width = settings.infoWindowWidth;
			container.style.height = settings.infoWindowHeight;
			var identifyTemplate = params.identifyTemplate;
			if (typeof identifyTemplate == 'string' || identifyTemplate instanceof String) {
				container.innerHTML = _.template(identifyTemplate, {attrs: feature.attributes});
			} else if($.isArray(identifyTemplate)) {
				var infoWindowSettings = {
					infoWindowWidth: settings.infoWindowWidth,
					infoWindowHeight: settings.infoWindowHeight,
					infoWindowContentHeight: settings.infoWindowContentHeight,
					infoWindowContentWidth: settings.infoWindowContentWidth
				};
				container = Util.createTabBar (_.map(identifyTemplate, function(template) {
					return {
						label: _.template(template.label,  {attrs: feature.attributes}),
						content: _.template(template.content,  {attrs: feature.attributes})
					};
				}), infoWindowSettings);
			}
			return {container: container, latlng: {lat: feature.geometry.y, lng: feature.geometry.x}};
		});
		PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: markers});
		if(settings.hasOwnProperty('withinExtent') && !settings.withinExtent) {
			var bounds = Util.computePointsBounds(_.map(validFeatures, function(feature) {
				return {lng: feature.geometry.x, lat: feature.geometry.y};
			}));
			PubSub.emit("MOECC_MAP_SEARCH_BOUNDS_CHANGED", {bounds: bounds});
		}
		var messageParams = {
			totalCount: featuresLength,
			searchString: settings.searchString,
			withinExtent: settings.withinExtent
		};
		if (invalidNumber > 0) {
			messageParams.invalidCount = invalidNumber;
		}
		PubSub.emit("MOECC_MAP_SEARCH_MESSAGE_READY", {messageParams: messageParams});
	}
};

module.exports = api;