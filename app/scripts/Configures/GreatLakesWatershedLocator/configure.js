var identifyCallback = require('../scripts/IdentifyCallbacks/PolygonLayers');
//var searchCallback = require('../scripts/SearchCallbacks/PolygonLayers');
var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');

var globalConfigure = {
	langs: langSetting,
	//minMapScale: 1,
	reverseGeocoder: GoogleReverseGeocoder,
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
					<i> <%= attrs.geocodingAddress %>.</i><br><br><strong>Result located within</strong><br><h3>No MOE District found</h3>\
				<%} else {%>\
					<i><%= attrs.geocodingAddress %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOECC District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>',
	/*English Ends*/
	/*French Begins*/
	identifyTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.geocodingAddress %>.</i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3> Le syst\u00e8me n\u2019a pas trouv\u00e9 de district du MEO</h3>\
				<%} else {%>\
					<i><%= attrs.geocodingAddress %></i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3><%= attrs.MOE_DISTRICT %></h3><br>Adresse du bureau: <br><%= attrs.STREET_NAME %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Sans frais: <%= attrs.TOLLFREENUMBER %><br>T\u00e9l\u00e9phone: <%= attrs.PHONENUMBER %>\
					T\u00e9l\u00e9copieur: <%= attrs.FAXNUMBER %>\
				<% } %>',
	/*French Ends*/
	/*English Begins*/	
	tableTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.geocodingAddress %>.</i><br><br><strong>Result located within</strong><br><h3>No MOE District found</h3>\
				<%} else {%>\
					<i><%= attrs.geocodingAddress %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOECC District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>',
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<% if (attrs.featuresLength === 0) {%>\
					<i> <%= attrs.geocodingAddress %>.</i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3> Le syst\u00e8me n\u2019a pas trouv\u00e9 de district du MEO</h3>\
				<%} else {%>\
					<i><%= attrs.geocodingAddress %></i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3><%= attrs.MOE_DISTRICT %></h3><br>Adresse du bureau: <br><%= attrs.STREET_NAME %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Sans frais: <%= attrs.TOLLFREENUMBER %><br>T\u00e9l\u00e9phone: <%= attrs.PHONENUMBER %>\
					T\u00e9l\u00e9copieur: <%= attrs.FAXNUMBER %>\
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