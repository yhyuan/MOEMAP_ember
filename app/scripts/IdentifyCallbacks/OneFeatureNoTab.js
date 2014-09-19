var Util = require('../Util');

var api = function(params) {
	var results = params.results;
	var featuresLength = Util.computeFeaturesNumber (results);
	if (featuresLength === 0) {
		return false;
	}	
	var features = Util.combineFeatures(results);
	var attrs = features[0].attributes;  // The attributes for the first feature.
	var globalConfigure = params.globalConfigure;
	var container;
	if($.isArray(globalConfigure.identifyTemplate)) {
		var settings = {
			infoWindowWidth: globalConfigure.infoWindowWidth,
			infoWindowHeight: globalConfigure.infoWindowHeight,
			infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
			infoWindowContentWidth: globalConfigure.infoWindowContentWidth
		};
		container = Util.createTabBar (_.map(globalConfigure.identifyTemplate, function(template) {
			return {
				label: _.template(template.label,  {attrs: attrs}),
				content: _.template(template.content,  {attrs: attrs})
			};
		}), settings);	
	} else {
		container = document.createElement('div');
		container.style.width = globalConfigure.infoWindowWidth;
		container.style.height = globalConfigure.infoWindowHeight;
		container.innerHTML = _.template(globalConfigure.identifyTemplate, {attrs: attrs});
	}	
	return container;
};

module.exports = api;