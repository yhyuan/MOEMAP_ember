/* global _ */
'use strict';

var EARTH_RADIUS = 6378137; // in meter

var toRad = function (degree) {
	return degree * Math.PI / 180;
};

var toDegree = function (rad) {
	return rad * 180 / Math.PI;
};

var computeOffset = function(latlng, radius, heading) {
	var distRad = radius/EARTH_RADIUS;
	var headingRad = toRad(heading);
	var latRad = toRad(latlng.lat);
	var cosDist = Math.cos(distRad);
	var sinDist = Math.sin(distRad);
	var cosLat = Math.cos(latRad);
	var sinLat = Math.sin(latRad);
	var sc = cosDist * sinLat + sinDist * cosLat * Math.cos(headingRad);
	var lat = toDegree(Math.asin(sc));
	var dlng = Math.atan2(sinDist*cosLat*Math.sin(headingRad), cosDist - sinLat * sc);
	var lng = toDegree(toRad(latlng.lng) - dlng);
	return {lat: lat, lng: lng};
};

var computeCircle = function (latlng, radius) {
	return _.map(_.range(0, 361, 10), function(heading) {
		return computeOffset(latlng, radius, heading);
	});
};

var computeDistance = function (fromLatlng, toLatlng) {
	var lat1 = toRad(fromLatlng.lat);
	var lng1 = toRad(fromLatlng.lng);
	var lat2 = toRad(toLatlng.lat);
	var lng2 = toRad(toLatlng.lng);
	var d = EARTH_RADIUS*Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lng1 - lng2));
	return d;
};

var computePointsBounds = function (latlngs){
	var getLat = function(latlng){ return latlng.lat;};
	var getLng = function(latlng){ return latlng.lng;};
	return {
		southWest: {lat: _.min(latlngs, getLat).lat, lng: _.min(latlngs, getLng).lng},
		northEast: {lat: _.max(latlngs, getLat).lat, lng: _.max(latlngs, getLng).lng}
	};
};

var computeClusters = function (features){
	var size = features.length;
	var groups = _.groupBy(features, function(feature) {
		return '' + feature.latlng.lat.toFixed(6) + ':' + feature.latlng.lng.toFixed(6);
	});
	var keys = _.keys(groups);
	var values = _.values(groups);	
	return _.map(_.range(keys.length), function(index) {
		var key = keys[index].split(':');
		var latlng = {lat: parseFloat(key[0]), lng: parseFloat(key[1])};
		return {latlng: latlng, list: values[index]};
	});
};

var convertLatLngtoUTM = function(lat, lng) {
	var pi = 3.14159265358979; //PI
	var a = 6378137; //equatorial radius for WGS 84
	var k0 = 0.9996; //scale factor
	var e = 0.081819191; //eccentricity
	var e_2 = 0.006694380015894481; //e'2
	var A0 = 6367449.146;
	var B0 = 16038.42955;
	var C0 = 16.83261333;
	var D0 = 0.021984404;
	var E0 = 0.000312705;

	var zone = 31 + Math.floor(lng / 6);
	var lat_r = lat * pi / 180.0;
	var t1 = Math.sin(lat_r); // SIN(LAT)
	var t2 = e * t1 * e * t1;
	var t3 = Math.cos(lat_r); // COS(LAT)
	var t4 = Math.tan(lat_r); // TAN(LAT)
	var nu = a / (Math.sqrt(1 - t2));
	var S = A0 * lat_r - B0 * Math.sin(2 * lat_r) + C0 * Math.sin(4 * lat_r) - D0 * Math.sin(6 * lat_r) + E0 * Math.sin(8 * lat_r);
	var k1 = S * k0;
	var k2 = nu * t1 * t3 * k0 / 2.0;
	var k3 = ((nu * t1 * t2 * t2 * t2) / 24) * (5 - t4 * t4 + 9 * e_2 * t3 * t3 + 4 * e_2 * e_2 * t3 * t3 * t3 * t3) * k0;
	var k4 = nu * t3 * k0;
	var k5 = t3 * t3 * t3 * (nu / 6) * (1 - t4 * t4 + e_2 * t3 * t3) * k0;

	//var lng_r = lng*pi/180.0;
	var lng_zone_cm = 6 * zone - 183;
	var d1 = (lng - lng_zone_cm) * pi / 180.0;
	var d2 = d1 * d1;
	var d3 = d2 * d1;
	var d4 = d3 * d1;

	var x = 500000 + (k4 * d1 + k5 * d3);
	var rawy = (k1 + k2 * d2 + k3 * d4);
	var y = rawy;
	if (y < 0) {
		y = y + 10000000;
	}
	var res = {
		Zone: zone,
		Easting: x.toFixed(0),
		Northing: y.toFixed(0)
	};
	return res;
};
/**
 * Replace the char A with char B in a String. 
 *
 * @param {str} The string to be processed.
 * @param {charA} the char to be replaced.
 * @param {charB} the char to replace.
 * @return {String} An ojbect sendt to Geocoder.
 **/
var replaceChar = function (str, charA, charB) {
	var temp = [];
	temp = str.split(charA);
	var result = temp[0];
	if (temp.length >= 2) {
		for (var i = 1; i < temp.length; i++) {
			result = result + charB + temp[i];
		}
	}
	return result;
};

var wordCapitalize = function (str){
	var strArray = str.trim().split(' ');
	for(var i=0; i < strArray.length; i++) {
		strArray[i] = strArray[i].substring(0,1).toUpperCase() + strArray[i].substring(1,strArray[i].length).toLowerCase();
	}
	return strArray.join(' ');
};

var computeFeaturesNumber = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total + layer.features.length;
		} else {
			return total;
		}
	}, 0);
};

var combineFeatures = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total.concat (layer.features);
		} else {
			return total;
		}
	}, []);
};

var splitResults = function(results, invalidFeatureLocations) {
	var filterResults = function (results, invalidFeatureLocations, f) {
		return _.map(results, function(result) {
			var clone = _.clone(result);
			clone.features = _.filter(result.features, function (feature) {
				return f(_.some(invalidFeatureLocations, function(location) {
					return Math.abs(location.lng - feature.geometry.x) + Math.abs(location.lat - feature.geometry.y) < location.difference;
				}));
			});
			return clone;
		});
	};
	return {validResults: filterResults(results, invalidFeatureLocations, function(input) {return !input;}),
			invalidResults: filterResults(results, invalidFeatureLocations, function(input) {return input;})};
};

var deciToDegree = function (degree, language){
	if(Math.abs(degree) <= 0.1){
		return "N/A";
	}
	var sym = "N";
	if(degree<0){
		degree = -degree;
		if(language === "EN") {
			sym = "W";
		} else {
			sym = "O";
		}
	}
	var deg = Math.floor(degree);
	var temp = (degree - deg)*60;
	var minute = Math.floor(temp);
	var second = Math.floor((temp- minute)*60);
	var res = "";
	var degreeSymbolLang = "&deg;";
	if(second<1){
		res ="" + deg + degreeSymbolLang + minute + "'";
	}else if(second>58){
		res ="" + deg + degreeSymbolLang + (minute+1) + "'";
	}else{
		res ="" + deg + degreeSymbolLang + minute + "'" + second + "\"";
	}
	return res + sym;
};

var addBRtoLongText = function (text) {
	var lineCount = 0;
	var readyForBreak = false;
	if (text.length <= 40) {
		return text;
	}
	var textArray = text.split('');
	var result = "";	
	for (var i = 0; i < textArray.length; i++) {
		if (lineCount > 40) {
			readyForBreak = true;
		}
		result = result + textArray[i];
		if ((readyForBreak) && (textArray[i] === " ")) {
			lineCount = 0;
			result = result + "<br>";
			readyForBreak = false;
		}
		lineCount = lineCount + 1;
	}
	return result;
};

var processNA = function (str) {
	if (typeof(str) === 'undefined') {
		return "N/A";
	}
	if (str === "null") {
		return "N/A";
	}
	if (str === "Null") {
		return "N/A";
	}
	return str;
};	

var createTabBar = function (tabs, settings){
	// the following code based on ESRI sample
	// create and show the info-window with tabs, one for each map service layer
	var container = document.createElement('div');
	container.style.width = settings.infoWindowWidth;
	container.style.height = settings.infoWindowHeight;

        // =======START  TAB UI ================             
	var tabBar = new goog.ui.TabBar();
	for (var i = 0; i < tabs.length; i++) {
		var tab = new goog.ui.Tab(tabs[i].label);
		tab.content = tabs[i].content;
		tabBar.addChild(tab, true);
	}
	tabBar.render(container);
	goog.dom.appendChild(container, goog.dom.createDom('div', {
		'class': 'goog-tab-bar-clear'
	}));
	var contentDiv = goog.dom.createDom('div', {
		'class': 'goog-tab-content'
	});
	contentDiv.style.height = settings.infoWindowContentHeight;
	contentDiv.style.width = settings.infoWindowContentWidth;
			
	goog.dom.appendChild(container, contentDiv);            
	goog.events.listen(tabBar, goog.ui.Component.EventType.SELECT, function(e) {
		contentDiv.innerHTML = e.target.content;
	});
	tabBar.setSelectedTabIndex(0);
	return container;
        // =======END  TAB UI ================
};

var getTableIDFromTableTemplate = function (template) {
	var index = template.indexOf('<table id="');
	var str = template.substring(index + 11, template.length).trim();
	index = str.indexOf(' ');
	str = str.substring(0, index - 1).trim();
	//str = str.substring(1, str.length - 1);
	return str;
};

/*
	params
		requried: totalCount, maxQueryReturn
		optional: searchString, withinExtent, invalidCount

*/
var generateMessage = function(params, langs){
	var totalCount = params.totalCount;
	var maxQueryReturn = params.maxQueryReturn;

	var regionName = "";
	if (typeof(params.withinExtent) !== "undefined") {
		regionName = " " + (params.withinExtent ? langs.inCurrentMapExtentLang : langs.inGobalRegionLang);
	}
	var searchString = " ";
	if (typeof(params.searchString) !== "undefined") {
		searchString = " " + langs.forLang + " <strong>"  + params.searchString + "</strong> ";
	}
	
	var message = "";
	if (params.hasOwnProperty("invalidCount") && (params.invalidCount > 0)) {
		var invalidResultMsg = (params.invalidCount === 1) ? langs.ResultDoesNotHaveValidCoordinates : langs.ResultsDoNotHaveValidCoordinates;
		if(totalCount === 0){
			message = langs.yourSearchLang + searchString + langs.returnedNoResultLang + regionName + ". " + langs.pleaseRefineSearchLang + ".";
		} else if(totalCount === 1){
			message = langs.oneResultFoundLang  + searchString + regionName + "." + langs.ThisResultDoesNotHaveValidCoordinates;
		} else if(totalCount >= maxQueryReturn){
			message = langs.moreThanLang + " " + maxQueryReturn + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.onlyLang + " " + maxQueryReturn + " " + langs.returnedLang + ". " + langs.seeHelpLang + "." + langs.AmongReturnedResults + ", " + params.invalidCount + invalidResultMsg;
		} else {
			message = totalCount + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.AmongReturnedResults + ", " + params.invalidCount + invalidResultMsg;
		}	
	} else {
		if(totalCount === 0){
			message = langs.yourSearchLang + searchString + langs.returnedNoResultLang + regionName + ". " + langs.pleaseRefineSearchLang + ".";
		} else if(totalCount === 1){
			message = langs.oneResultFoundLang  + searchString + regionName + ".";
		} else if(totalCount >= maxQueryReturn){
			message = langs.moreThanLang + " " + maxQueryReturn + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.onlyLang + " " + maxQueryReturn + " " + langs.returnedLang + ". " + langs.seeHelpLang + ".";
		} else {
			message = totalCount + " " + langs.resultsFoundLang + searchString + regionName + ".";
		}
	}
	return message;
};

var getSearchHelpText = function (searchControlHTML) {
	var str = searchControlHTML.split('id="information"')[1];
	var index1 = str.indexOf('>');
	var index2 = str.indexOf('</div>');
	return str.substring(index1 + 1, index2);
};
/*
var findGreatLakeWithLocation = function (latlng) {
	var lakeLocations = {
		"LAKE ERIE": {location: {lat: 42.261049,lng: -81.128540}, zoomlevel: 8},
		"LAC \u00c9RI\u00c9": {location: {lat: 42.261049,lng: -81.128540}, zoomlevel: 8},
		"LAKE HURON": {location: {lat: 45.313529,lng: -81.886597}, zoomlevel: 8},
		"LAC HURON": {location: {lat: 45.313529,lng: -81.886597}, zoomlevel: 8},
		"LAKE ONTARIO": {location: {lat: 43.651976,lng: -77.997437}, zoomlevel: 8},
		"LAC ONTARIO": {location: {lat: 43.651976,lng: -77.997437}, zoomlevel: 8},
		"LAKE SUPERIOR": {location: {lat: 47.802087,lng: -86.989746}, zoomlevel: 7},	
		"LAC SUP\u00c9RIEUR": {location: {lat: 47.802087,lng: -86.989746}, zoomlevel: 7},	
		"UPPER ST. LAWRENCE": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"ST. LAWRENCE RIVER": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"HAUT SAINT-LAURENT": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"FLEUVE SAINT-LAURENT": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9}
	};
	var lake = _.find(_.pairs(lakeLocations), function (items) {
		var lat = items[1].location.lat;
		var lng = items[1].location.lng;
		return Math.abs(lat - latlng.lat) + Math.abs(lng - latlng.lng) < 0.0001;
	});
	if (!!lake) {
		return wordCapitalize(lake[0]);
	} else {
		return null;
	}
};
*/
var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters,
	convertLatLngtoUTM: convertLatLngtoUTM,
	replaceChar: replaceChar,
	wordCapitalize: wordCapitalize,
	computeFeaturesNumber: computeFeaturesNumber,
	combineFeatures: combineFeatures,
	splitResults: splitResults,
	deciToDegree: deciToDegree,
	addBRtoLongText: addBRtoLongText,
	processNA: processNA,
	createTabBar: createTabBar,
	getTableIDFromTableTemplate: getTableIDFromTableTemplate,
	generateMessage: generateMessage,
	getSearchHelpText: getSearchHelpText/*,
	findGreatLakeWithLocation: findGreatLakeWithLocation*/
};

module.exports = api;