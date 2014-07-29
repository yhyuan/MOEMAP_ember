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
	var getLat = function(latlng){ return latlng.lat};
	var getLng = function(latlng){ return latlng.lng};
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

var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters
};

module.exports = api;