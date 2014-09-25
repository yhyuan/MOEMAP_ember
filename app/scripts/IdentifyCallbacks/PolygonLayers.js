var Util = require('../Util');

var api = function(params) {
	//console.log(params);
	var results = params.results;
	var features = Util.combineFeatures(results);
	var globalConfigure = params.globalConfigure;
	var geocodingResult = params.geocodingResult;
	var featuresLength = Util.computeFeaturesNumber (results);
	
	var attrs = {
		featuresLength: featuresLength,
		geocodingAddress: (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A"),
		utmCoordinates: Util.convertLatLngtoUTM(geocodingResult.latlng.lat, geocodingResult.latlng.lng)
	};
	var container = document.createElement('div');
	container.style.width = globalConfigure.infoWindowWidth;
	container.style.height = globalConfigure.infoWindowHeight;
	if (featuresLength > 0) {
		attrs = _.defaults(features[0].attributes, attrs);
	}
	container.innerHTML = _.template(globalConfigure.identifyTemplate, {attrs: attrs});
	
	var tableContent = _.template(globalConfigure.tableTemplate, {attrs: attrs});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	
	return container;
};

module.exports = api;