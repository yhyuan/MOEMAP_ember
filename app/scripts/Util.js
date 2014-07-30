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
var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters,
	convertLatLngtoUTM: convertLatLngtoUTM
};

module.exports = api;