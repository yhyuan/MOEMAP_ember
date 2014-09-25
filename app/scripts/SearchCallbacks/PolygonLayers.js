var Util = require('../Util');

var api = function(params) {
	var results = params.results;
	var features = Util.combineFeatures(results);
	var globalConfigure = params.globalConfigure;
	var geocodingResult = params.geocodingResult;
	var featuresLength = Util.computeFeaturesNumber (results);
	var attrs = {
		featuresLength: featuresLength,
		geocodingAddress: (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A")
	};
	if (featuresLength > 0) {
		attrs = _.defaults(features[0].attributes, attrs);
	}
	var tableContent = _.template(globalConfigure.tableTemplate, {attrs: attrs});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
};

module.exports = api;