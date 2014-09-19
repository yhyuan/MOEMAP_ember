
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);
PubSub.on("MOECC_MAP_GEOCODING_ADDRESS_READY", function(initParams) {
	var params = _.defaults(initParams, GeocoderSettings);
	Geocoder.geocode(params).done(function(result) {
		PubSub.emit("MOECC_MAP_GEOCODING_RESULT_READY", {address: initParams.address, result: result, withinExtent: initParams.withinExtent});
	});
})
PubSub.on("MOECC_MAP_IDENTIFY_REQUEST_READY", function(params) {
	var promises = _.map(globalConfigure.identifyParamsList, function (identifyParams) {
		var p = _.clone(identifyParams);
		p.geometry = params.geometry;
		return ArcGISServerAdapter.query(p)
	});
	$.when.apply($, promises).done(function() {
		var container = identifyCallback({results: globalConfigure.transformResults(arguments), globalConfigure: globalConfigure});
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
	var searchString = params.searchString;
	var geometry = globalConfigure.getSearchGeometry(params);
	var promises = _.map(globalConfigure.queryParamsList, function (queryParams) {
		var p = _.clone(queryParams);
		p.where = globalConfigure.getSearchCondition(params);
		if (geometry) {
			p.geometry = geometry;
		}
		return ArcGISServerAdapter.query(p);
	});
	var settings = globalConfigure.getSearchSettings(params);
	$.when.apply($, promises).done(function() {
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
$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);