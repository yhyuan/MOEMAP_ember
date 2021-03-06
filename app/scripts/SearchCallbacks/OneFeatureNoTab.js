var Util = require('../Util');
var defaultConfiguration = require('../Configures/Defaults');

var url = defaultConfiguration.dynamicResourcesLoadingURL;
var urls = [url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

var api = function(params) {
	//console.log(params.latlng);
	var results = params.results;
	var featuresLength = Util.computeFeaturesNumber (results);
	var globalConfigure = params.globalConfigure;
	if ((featuresLength === 0) && globalConfigure.hasOwnProperty('geocodeWhenQueryFail') && globalConfigure.geocodeWhenQueryFail && globalConfigure.hasOwnProperty('searchString')) {
		return {
			status: false,
			requireGeocoding: true,
			address: globalConfigure.searchString,
			withinExtent: globalConfigure.withinExtent
		};
	} else {
		if (featuresLength === 0) {
			var messageParams = {
				totalCount: featuresLength,
				searchString: globalConfigure.searchString,
				withinExtent: globalConfigure.withinExtent
			};
			messageParams.maxQueryReturn = globalConfigure.maxQueryReturn;
			$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
			return {
				status: false,
				requireGeocoding: false
			};			
		}
		var splited = Util.splitResults(results, globalConfigure.invalidFeatureLocations);
		var invalidNumber = Util.computeFeaturesNumber (splited.invalidResults);
		var validFeatures, invalidFeatures;
		var validTableID = Util.getTableIDFromTableTemplate(globalConfigure.tableTemplate);
		var tableContent;
		if (invalidNumber > 0) {
			validFeatures = Util.combineFeatures(splited.validResults);
			invalidFeatures = Util.combineFeatures(splited.invalidResults);
			var str1 = _.template(globalConfigure.tableTemplate, {features: validFeatures});
			var str2 = _.template(globalConfigure.invalidTableTemplate, {features: invalidFeatures});
			var invalidtableID = Util.getTableIDFromTableTemplate(globalConfigure.invalidTableTemplate);
			tableContent = str1 + '<br><br>' + str2;
		} else {
			validFeatures = Util.combineFeatures(results);
			tableContent = _.template(globalConfigure.tableTemplate, {features: validFeatures});
		}
		$('#' + globalConfigure.queryTableDivId).html(tableContent);
		var dataTableOptions = {
			'bJQueryUI': true,
			'sPaginationType': 'full_numbers' 
		};
		if (globalConfigure.langs.hasOwnProperty('dataTableLang')) {
			dataTableOptions['oLanguage'] = globalConfigure.langs.dataTableLang;
		}
		$('#' + validTableID).dataTable(dataTableOptions);		
		if (invalidNumber > 0) {
			$('#' + invalidtableID).dataTable(dataTableOptions);				
		}
		var markers;
		if (globalConfigure.identifyMultipleFeatures) {
			var groups = _.groupBy(validFeatures, function(feature){
				return feature.geometry.y.toFixed(6) + ',' + feature.geometry.x.toFixed(6);
			});
			markers = _.map(_.keys(groups), function(latlngInString) {
				var infoWindowSettings = {
					infoWindowWidth: globalConfigure.infoWindowWidth,
					infoWindowHeight: globalConfigure.infoWindowHeight,
					infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
					infoWindowContentWidth: globalConfigure.infoWindowContentWidth
				};
				var container = Util.createTabBar ([{
						label: globalConfigure.langs.InformationLang,
						content: _.template(globalConfigure.identifyTemplate,  {features: groups[latlngInString]})
					}], infoWindowSettings);
				var latlngInArray = latlngInString.split(',');
				return {container: container, latlng: {
					lat: parseFloat(latlngInArray[0]),
					lng: parseFloat(latlngInArray[1])
				}};
			});
		} else {
			markers = _.map(validFeatures, function(feature) {
				//var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
				var container;
				var identifyTemplate = globalConfigure.identifyTemplate;
				if (typeof identifyTemplate == 'string' || identifyTemplate instanceof String) {
					container = document.createElement('div');
					container.style.width = globalConfigure.infoWindowWidth;
					container.style.height = globalConfigure.infoWindowHeight;
					container.innerHTML = _.template(identifyTemplate, {attrs: feature.attributes});
				} else if($.isArray(identifyTemplate)) {
					var infoWindowSettings = {
						infoWindowWidth: globalConfigure.infoWindowWidth,
						infoWindowHeight: globalConfigure.infoWindowHeight,
						infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
						infoWindowContentWidth: globalConfigure.infoWindowContentWidth
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
		}
		var responses = {
			status: true,
			markers: markers
		};
		if(globalConfigure.hasOwnProperty('withinExtent') && !globalConfigure.withinExtent) {
			var latlngs = _.map(validFeatures, function(feature) {
				return {lng: feature.geometry.x, lat: feature.geometry.y};
			});
			if(globalConfigure.hasOwnProperty('bufferGeometry') && globalConfigure.bufferGeometry) {
				latlngs = latlngs.concat(globalConfigure.bufferGeometry);
			}
			responses.bounds = Util.computePointsBounds(latlngs);
		}
		var messageParams = {
			totalCount: featuresLength,
			searchString: globalConfigure.searchString,
			withinExtent: globalConfigure.withinExtent
		};
		if (invalidNumber > 0) {
			messageParams.invalidCount = invalidNumber;
		}
		//PubSub.emit("MOECC_MAP_SEARCH_MESSAGE_READY", {messageParams: messageParams});
		//responses.messageParams = messageParams;
		messageParams.maxQueryReturn = globalConfigure.maxQueryReturn;
		$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');		

		return responses;
	}
};

module.exports = api;