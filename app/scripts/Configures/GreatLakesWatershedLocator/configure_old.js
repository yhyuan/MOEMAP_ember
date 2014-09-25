/* global _, $, google */

/*
	Enhancements: 1) Fix a bug. When the clear button is clicked, the table below the map is still there in the existing application. The new version fixed this issue by removing it when the Clear button is clicked. 
	Meanwhile, the message information become empty. The new version change the message information back to help information. 
	2) When the user clicks on the map, it will display the information. 
*/


'use strict';
var GoogleMapsAdapter = require('../scripts/GoogleMapsAdapter');
var Util = require('../scripts/Util');
window.GoogleMapsAdapter = GoogleMapsAdapter;
GoogleMapsAdapter.init({
	/*English Begins*/
	language: "EN",
	/*English Ends*/
	/*French Begins*/
	language: "FR",
	/*French Ends*/
	mapServices: [{
		url: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/GreatLakes_WS_Bnd/MapServer',
		visibleLayers: [0, 1]
	}],
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
	postIdentifyCallbackName: 'OneFeatureNoTabPolygon',
	
	identifySettings: {
		radius: 1, /* 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		requireReverseGeocoding: true,
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/GreatLakes_WS_Bnd/MapServer',
			layerID: 0,
			/*returnGeometry: true,
			strokeOptions: {
				color: '#8583f3',
				opacity: 1, 
				weight: 4
			},*/
			outFields: ["LABEL"]
		}],

		identifyTemplate: function (results, Util, geocodingResult, searchString) {
			var utm = Util.convertLatLngtoUTM(geocodingResult.latlng.lat, geocodingResult.latlng.lng);
			var latlng = geocodingResult.latlng;
			var test = _.some([{lat: 42.261049,lng: -81.128540}, {lat: 45.313529,lng: -81.886597}, {lat: 43.651976,lng: -77.997437}, {lat: 47.802087,lng: -86.989746}, {lat: 44.439805,lng: -75.848505}], function (loc) {
				return Math.abs(latlng.lat - loc.lat) + Math.abs(latlng.lng - loc.lng) < 0.0001;
			});
			if (test) {
				geocodingResult.address = searchString;
			}
			
			/*var address = Util.findGreatLakeWithLocation(latlng);
			if (!!address) {
				geocodingResult.address = address;
			}*/
		/*English Begins*/		
			var template = '<% var featuresLength = Util.computeFeaturesNumber (results); var address = (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A"); \
				if (featuresLength === 0) {%>\
					<i> <%= address %>.</i><br><br><strong>Result located within</strong><br> No Great Lakes Watershed found\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= address %></i><br><br><i><strong>Latitude:</strong> <%= geocodingResult.latlng.lat.toFixed(6) %>  <strong>Longitude:</strong> <%= geocodingResult.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>UTM Zone:</strong>  <%= utm.Zone %> <strong>Easting:</strong>  <%= utm.Easting %>  <strong>Northing:</strong>  <%= utm.Northing %>  </i><br><br>\
					<strong>Result located within</strong><br><%= attrs.LABEL %> WATERSHED\
				<% } %>';
		/*English Ends*/
		/*French Begins*/
			var template = '<% var featuresLength = Util.computeFeaturesNumber (results); var address = (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A");\
				var GL = {\
					"LAKE ONTARIO":  "Bassin versant du lac Ontario",\
					"LAKE ERIE": "Bassin versant du lac \u00c9ri\u00e9",\
					"LAKE HURON": "Bassin versant du lac Huron",\
					"LAKE SUPERIOR": "Bassin versant du lac Sup\u00e9rieur",\
					"UPPER ST. LAWRENCE": "Bassin versant du haut Saint-Laurent"\
				};\
				if (featuresLength === 0) {%>\
					<i> <%= address %>.</i><br><br><strong>Result located within</strong><br> Le syst\u00e8me n\u2019a pas trouv\u00e9 de bassin versant des Grands Lacs\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= address %></i><br><br><i><strong>Latitude:</strong> <%= geocodingResult.latlng.lat.toFixed(6) %>   <strong>Longitude:</strong> <%= geocodingResult.latlng.lng.toFixed(6) %></i><br>\
					<i><strong>Zone UTM:</strong>  <%= utm.Zone %> <strong>abscisse:</strong>  <%= utm.Easting %>  <strong>ordonn\u00e9e:</strong>  <%= utm.Northing %>  </i><br><br>\
					<strong>R\u00e9sultat situ\u00e9 dans le</strong><br><%= GL[attrs.LABEL] %>\
				<% } %>';
		/*French Ends*/
			var contain = _.template(template, {results: results, Util: Util, geocodingResult: geocodingResult, utm: utm});			
			return {
				infoWindow: contain,
				table: contain
			}; 
		}
	},
	searchGeocoderList: {
		'GreatLakes' : {		
			'match': function (params) {
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
		}
	},
	preSearchCallbackName: 'OneFeatureNoTabPolygon',
	searchCallbackName: 'OneFeatureNoTabPolygon',
	postSearchCallbackName: 'OneFeatureNoTabPolygon',
	searchZoomLevel: 12,
	generateMessage: function (results, geocodingResult, searchString) {
		var latlng = geocodingResult.latlng;
		var test = _.some([{lat: 42.261049,lng: -81.128540}, {lat: 45.313529,lng: -81.886597}, {lat: 43.651976,lng: -77.997437}, {lat: 47.802087,lng: -86.989746}, {lat: 44.439805,lng: -75.848505}], function (loc) {
			return Math.abs(latlng.lat - loc.lat) + Math.abs(latlng.lng - loc.lng) < 0.0001;
		});
		if (test) {
			geocodingResult.address = searchString;
		}
		/*var address = Util.findGreatLakeWithLocation(latlng);
		if (!address) {
			address = geocodingResult.address;
		}*/
		var address = geocodingResult.address;
		if (!!results && !!results[0].features && results[0].features.length === 0) {
			/*English Begins*/
			return '<strong>' + address + '</strong> located within <strong>No Great Lakes Watershed found.</strong>';
			/*English Ends*/
			/*French Begins*/
			return '<strong>' + address + '</strong> est dans le <strong>Le système n’a pas trouvé de bassin versant des Grands Lacs.</strong>';
			/*French Ends*/
		}
		var lake = results[0].features[0].attributes.LABEL;
		/*English Begins*/
		return '<strong>' + address + '</strong> located within <strong>' + lake + ' WATERSHED.</strong>';
		/*English Ends*/
		/*French Begins*/
		var GL = {
			"LAKE ONTARIO":  "Bassin versant du lac Ontario",
			"LAKE ERIE": "Bassin versant du lac \u00c9ri\u00e9",
			"LAKE HURON": "Bassin versant du lac Huron",
			"LAKE SUPERIOR": "Bassin versant du lac Sup\u00e9rieur",
			"UPPER ST. LAWRENCE": "Bassin versant du haut Saint-Laurent"
		};
		return '<strong>' + address + '</strong> est dans le <strong> ' + GL[lake] + ' .</strong>';
		/*French Ends*/		
	}
});
