var identifyCallback = require('../scripts/IdentifyCallbacks/PolygonLayers');
//var searchCallback = require('../scripts/SearchCallbacks/PolygonLayers');
var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');
var GreatLakesReverseGeocoder = {
	'name': 'GoogleReverseGeocoder',
	'match': function (params) {
		var latlng = params.latlng;
		return _.some([{lat: 42.261049,lng: -81.128540}, {lat: 45.313529,lng: -81.886597}, {lat: 43.651976,lng: -77.997437}, {lat: 47.802087,lng: -86.989746}, {lat: 44.439805,lng: -75.848505}], function (loc) {
			return Math.abs(latlng.lat - loc.lat) + Math.abs(latlng.lng - loc.lng) < 0.0001;
		});
	},
	'geocode': function(params) {
		var latlng = params.latlng;
		/*English Begins*/
		var data = [{name: "LAKE ERIE", location: {lat: 42.261049,lng: -81.128540}},
			{name: "LAKE HURON", location: {lat: 45.313529,lng: -81.886597}},
			{name: "LAKE ONTARIO", location: {lat: 43.651976,lng: -77.997437}},
			{name: "LAKE SUPERIOR", location: {lat: 47.802087,lng: -86.989746}},
			{name: "UPPER ST. LAWRENCE", location: {lat: 44.439805,lng: -75.848505}},
			{name: "ST. LAWRENCE RIVER", location: {lat: 44.439805,lng: -75.848505}}
		];
		/*English Ends*/
		/*French Begins*/		
		var data = [{name: "LAC \u00c9RI\u00c9", location: {lat: 42.261049,lng: -81.128540}},
			{name: "LAC HURON", location: {lat: 45.313529,lng: -81.886597}},
			{name: "LAC ONTARIO", location: {lat: 43.651976,lng: -77.997437}},
			{name: "LAC SUP\u00c9RIEUR", location: {lat: 47.802087,lng: -86.989746}},
			{name: "HAUT SAINT-LAURENT", location: {lat: 44.439805,lng: -75.848505}},
			{name: "FLEUVE SAINT-LAURENT", location: {lat: 44.439805,lng: -75.848505}}
		];
		/*French Ends*/
				
		var dfd = new $.Deferred();
		var found = _.find(data, function (item) {
			var loc = item.location;
			return Math.abs(latlng.lat - loc.lat) + Math.abs(latlng.lng - loc.lng) < 0.0001;
		});
		if (found) {
			var result = {
				address: found.name,
				latlng: params.latlng,
				status: 'OK'
			};
			dfd.resolve(result);
		} else {
			dfd.resolve({status: 'No_Result'});
		}
		return dfd.promise();
	}
};
var globalConfigure = {
	langs: langSetting,
	//minMapScale: 1,
	reverseGeocoder: {
		GeocoderList: [GreatLakesReverseGeocoder],
		defaultGeocoder: GoogleReverseGeocoder
	},
	extraImageServices: [{
		id: "arcgis",
		name: "ESRI",
		url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
	}],	
	/*English Begins*/
	otherInfoHTML: '<br>Data source: Land Information Ontario (LIO).<br>',
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: '<br>Source: Information sur les terres de l\'Ontario (ITO).<br>',
	/*French Ends*/	
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Search" title="Search" />\
		<label class="element-invisible" for="search_clear">Clear</label>\
		<input type="submit" value="&nbsp;Clear&nbsp;" id="search_clear" title="Clear" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information">You may search by <strong>address</strong>, <strong>city name</strong>, <strong>coordinates</strong> or see help for advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Recherche" title="Recherche" />\
		<label class="element-invisible" for="search_clear">Effacer</label>\
		<input type="submit" value="&nbsp;Effacer&nbsp;" id="search_clear" title="Effacer" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information">Vous pouvez rechercher par <strong>adresse</strong>, <strong>ville</strong>, <strong>coordonn\u00e9es</strong> ou consulter l\'aide pour de l\'information sur les recherches avanc&eacute;es.</div>',
	/*French Ends*/
	identifyRadius: 1,
	reverseGeocodingForIdentify: true,
	displayIdentifyMarker: true,
	/*English Begins*/		
	identifyTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.address %>.</i><br><br><strong>Result located within</strong><br> No Great Lakes Watershed found\
				<%} else { %>\
					<i><%= attrs.address %></i><br><br><i><strong>Latitude:</strong> <%= attrs.latlng.lat.toFixed(6) %>  <strong>Longitude:</strong> <%= attrs.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>UTM Zone:</strong>  <%= attrs.utmCoordinates.Zone %> <strong>Easting:</strong>  <%= attrs.utmCoordinates.Easting %>  <strong>Northing:</strong>  <%= attrs.utmCoordinates.Northing %>  </i><br><br>\
					<strong>Result located within</strong><br><%= attrs.LABEL %> WATERSHED\
				<% } %>',
				
	/*English Ends*/
	/*French Begins*/
	identifyTemplate:  '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.address %>.</i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br> Le syst\u00e8me n\u2019a pas trouv\u00e9 de bassin versant des Grands Lacs\
				<%} else {%>\
					<i><%= attrs.address %></i><br><br><i><strong>Latitude:</strong> <%= attrs.latlng.lat.toFixed(6) %>  <strong>Longitude:</strong> <%= attrs.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>Zone UTM:</strong>  <%= attrs.utmCoordinates.Zone %> <strong>abscisse:</strong>  <%= attrs.utmCoordinates.Easting %>  <strong>ordonn\u00e9e:</strong>  <%= attrs.utmCoordinates.Northing %>  </i><br><br>\
					<strong>R\u00e9sultat situ\u00e9 dans le</strong><br><%= attrs.LABEL %> WATERSHED\
				<% } %>',
	/*French Ends*/
	/*English Begins*/	
	tableTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.address %>.</i><br><br><strong>Result located within</strong><br> No Great Lakes Watershed found\
				<%} else { %>\
					<i><%= attrs.address %></i><br><br><i><strong>Latitude:</strong> <%= attrs.latlng.lat.toFixed(6) %>  <strong>Longitude:</strong> <%= attrs.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>UTM Zone:</strong>  <%= attrs.utmCoordinates.Zone %> <strong>Easting:</strong>  <%= attrs.utmCoordinates.Easting %>  <strong>Northing:</strong>  <%= attrs.utmCoordinates.Northing %>  </i><br><br>\
					<strong>Result located within</strong><br><%= attrs.LABEL %> WATERSHED\
				<% } %>',
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.address %>.</i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br> Le syst\u00e8me n\u2019a pas trouv\u00e9 de bassin versant des Grands Lacs\
				<%} else {%>\
					<i><%= attrs.address %></i><br><br><i><strong>Latitude:</strong> <%= attrs.latlng.lat.toFixed(6) %>  <strong>Longitude:</strong> <%= attrs.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>Zone UTM:</strong>  <%= attrs.utmCoordinates.Zone %> <strong>abscisse:</strong>  <%= attrs.utmCoordinates.Easting %>  <strong>ordonn\u00e9e:</strong>  <%= attrs.utmCoordinates.Northing %>  </i><br><br>\
					<strong>R\u00e9sultat situ\u00e9 dans le</strong><br><%= attrs.LABEL %> WATERSHED\
				<% } %>',
	/*French Ends*/

	identifyParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/GreatLakes_WS_Bnd/MapServer',
		layerID: 0,
		returnGeometry: false,
		outFields: ["LABEL"]
	}],
	exportParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/GreatLakes_WS_Bnd/MapServer',
		visibleLayers: [0, 1]
	}],
	transformGeocodingResults: function (geocodingResult) {
		var result = _.clone(geocodingResult);
		if (!result.hasOwnProperty("address")) {
			result.address = "N/A";
		}
		result.utmCoordinates = Util.convertLatLngtoUTM(geocodingResult.latlng.lat, geocodingResult.latlng.lng);
		return result;
	},
	transformResults: function (results) {
		/*English Begins*/		
		return results;
		/*English Ends*/
		/*French Begins*/
		var translateLakeName = function (lakeName) {
			var GL = {
				"LAKE ONTARIO":  "Bassin versant du lac Ontario",
				"LAKE ERIE": "Bassin versant du lac \u00c9ri\u00e9",
				"LAKE HURON": "Bassin versant du lac Huron",
				"LAKE SUPERIOR": "Bassin versant du lac Sup\u00e9rieur",
				"UPPER ST. LAWRENCE": "Bassin versant du haut Saint-Laurent"
			};
			return GL[lakeName];
		};
		return _.map(results, function(layer) {
				layer.features = _.map(layer.features, function(feature) {
					feature.attributes["LABEL"] = translateLakeName(feature.attributes["LABEL"]);
					return feature;
				})
				return layer;
			});
		/*French Ends*/
	},
};

var GreatLakesGeocoder = {		
	'match': function (params) {
		var lakeLocations = ["LAKE ERIE", "LAC \u00c9RI\u00c9", "LAKE HURON", "LAC HURON", "LAKE ONTARIO", "LAC ONTARIO", "LAKE SUPERIOR", "LAC SUP\u00c9RIEUR", "UPPER ST. LAWRENCE", "ST. LAWRENCE RIVER", "HAUT SAINT-LAURENT", "FLEUVE SAINT-LAURENT"];
		return _.contains(lakeLocations, params.address.split(/\s+/).join(" ").toUpperCase());
	},
	'format': function (params) {
		var lakeLocations = ["LAKE ERIE", "LAC \u00c9RI\u00c9", "LAKE HURON", "LAC HURON", "LAKE ONTARIO", "LAC ONTARIO", "LAKE SUPERIOR", "LAC SUP\u00c9RIEUR", "UPPER ST. LAWRENCE", "ST. LAWRENCE RIVER", "HAUT SAINT-LAURENT", "FLEUVE SAINT-LAURENT"];
		return _.contains(lakeLocations, params.address.split(/\s+/).join(" ").toUpperCase());
	},
	'geocode': function (params) {				
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
		var key = params.address.split(/\s+/).join(" ").toUpperCase();
		var result = {
			latlng: lakeLocations[key].location,
			zoomLevel: lakeLocations[key].zoomlevel,
			address: params.address,
			status: 'OK'
		};
		var dfd = new $.Deferred();
		dfd.resolve(result);
		return dfd.promise();
	}
};
Geocoder.addGeocoder(GreatLakesGeocoder);

PubSub.remove("MOECC_MAP_SEARCH_REQUEST_READY");
PubSub.on("MOECC_MAP_SEARCH_REQUEST_READY", function (params) {
	var searchString = params.searchString;
	PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_READY", {address: params.searchString, withinExtent: false});
});

PubSub.on("MOECC_MAP_GEOCODING_RESULT_READY", function (params) {
	var address = params.address;
	var result = params.result;
	var status = result.status;
	var withinExtent = params.withinExtent;
	if (result.status === "OK") {
		PubSub.emit("MOECC_MAP_MOUSE_CLICK", result.latlng);
	}
	var message = (status === "No_Result") ? (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.address + '</strong> ' + globalConfigure.langs.returnedNoResultLang) : (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.address + '</strong> ' + globalConfigure.langs.returnedOneResultLang);
	$('#' + globalConfigure.informationDivId).html('<i>' + message + ' ' + ((params.withinExtent) ? globalConfigure.langs.inCurrentMapExtentLang : globalConfigure.langs.inGobalRegionLang) + '</i>');				
});
/*
PubSub.on("MOECC_MAP_IDENTIFY_REQUEST_READY", function(params) {
	var promises = _.map(globalConfigure.identifyParamsList, function (identifyParams) {
		var p = _.clone(identifyParams);
		p.geometry = params.geometry;
		return ArcGISServerAdapter.query(p)
	});
	$.when.apply($, promises).done(function() {
		var container = searchCallback({results: globalConfigure.transformResults(arguments), globalConfigure: globalConfigure, geocodingResult: params.settings.geocodingResult});
	});
});
*/
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);