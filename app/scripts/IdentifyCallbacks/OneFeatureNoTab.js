var Util = require('../Util');

var api = function(params) {
	var results = params.results;
	var featuresLength = Util.computeFeaturesNumber (results);
	if (featuresLength === 0) {
		return false;
	}	
	var features = Util.combineFeatures(results);
	var attrs = features[0].attributes;  // The attributes for the first feature. 
	var container = document.createElement('div');
	container.style.width = params.infoWindowWidth;
	container.style.height = params.infoWindowHeight;
	container.innerHTML = _.template(params.identifyTemplate, {attrs: attrs});
	return container;
};

module.exports = api;