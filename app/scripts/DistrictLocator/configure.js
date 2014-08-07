/* global _, $, google */
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
		url: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/MOE_Districts_Full_Bnd/MapServer',
		visibleLayers: [0]
	}],
	extraImageServices: [{
		id: "arcgis",
		name: "ESRI",
		url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
	}],
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Search" title="Search" />\
		<label class="element-invisible" for="search_clear">Clear</label>\
		<input type="submit" value="&nbsp;Clear&nbsp;" id="search_clear" title="Clear" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information">Search by <STRONG>Address</STRONG>, <STRONG>City Name</STRONG>, <STRONG>Postal Code</STRONG> or see help for more advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Recherche" title="Recherche" />\
		<label class="element-invisible" for="search_clear">Effacer</label>\
		<input type="submit" value="&nbsp;Effacer&nbsp;" id="search_clear" title="Effacer" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information">Rechercher par <STRONG>adresse</STRONG>, <STRONG>ville</STRONG>, <STRONG>code postal</STRONG> ou cliquer sur aide pour plus d\u2019information sur la recherche avanc\u00e9e.</div>',
	/*French Ends*/
	postIdentifyCallbackName: 'OneFeatureNoTabPolygon',

	identifySettings: {
		radius: 1, /* 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		requireReverseGeocoding: true,
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/MOE_Districts_Full_Bnd/MapServer',
			layerID: 0,
			/*returnGeometry: true,
			strokeOptions: {
				color: '#8583f3',
				opacity: 1, 
				weight: 4
			},*/
			outFields: ["OBJECTID","MOE_DISTRICT","STREET_NAME","CITY","POSTALCODE","PHONENUMBER","TOLLFREENUMBER","FAXNUMBER","MOE_DISTRICT_NAME"]
		}],

		identifyTemplate: function (results, Util, geocodingResult) {
		/*English Begins*/		
			var template = '<% var featuresLength = Util.computeFeaturesNumber (results); var address = (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A"); \
				if (featuresLength === 0) {%>\
					<i> <%= address %>.</i><br><br><strong>Result located within</strong><br><h3> No MOE District found</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= address %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOE District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>';
		/*English Ends*/
		/*French Begins*/
			var template = '<% var featuresLength = Util.computeFeaturesNumber (results); var address = (geocodingResult.hasOwnProperty("address") ? geocodingResult.address : "N/A");\
				var MOEDistrict = {\
					"Barrie":  "District de Barrie du MEO",\
					"Guelph":  "District de Guelph du MEO",\
					"Halton-Peel": "District de Halton-Peel du MEO",\
					"Hamilton":  "District de Hamilton du MEO",\
					"Kingston":  "District de Kingston du MEO",\
					"London":  "District de London du MEO",\
					"Ottawa": "District d\u2019Ottawa du MEO",\
					"Owen Sound": "District d\u2019Owen Sound du MEO",\
					"Peterborough": "District de Peterborough du MEO",\
					"Sarnia": "District de Sarnia du MEO",\
					"Sudbury": "District de Sudbury du MEO",\
					"Thunder Bay": "District de Thunder Bay du MEO",\
					"Timmins": "District de Timmins du MEO",\
					"Toronto": "District de Toronto du MEO",\
					"Niagra": "District de Niagara du MEO",\
					"York-Durham": "District de York-Durham du MEO"\
				};\
				var MOEDistrictStreet = {\
					"Barrie":  "Bureau 1203, 54, alle Cedar Pointe",\
					"Guelph":  "1, chemin Stone Ouest",\
					"Halton-Peel": "Bureau 300, 4145 North Service Road",\
					"Hamilton":  "9<sup>e</sup> \u00e9tage, 119, rue King Ouest",\
					"Kingston":  "C. P. 22032, 1259 rue Gardiners",\
					"London":  "733, chemin Exeter",\
					"Ottawa": "2430 Don Reid Drive",\
					"Owen Sound": "101, rue 17<sup>e</sup> Est",\
					"Peterborough": "300, rue Water, Place Robinson",\
					"Sarnia": "1094, chemin London",\
					"Sudbury": "Bureau 1201, 199, rue Larch",\
					"Thunder Bay": "3<sup>e</sup> \u00e9tage, bureau 331B, 435, rue James Sud",\
					"Timmins": "Complexe du gouvernement de l\u2019Ontario, Sac postal 3080, Autoroute 101 Est",\
					"Toronto": "8<sup>e</sup> \u00e9tage, 5775, rue Yonge",\
					"Niagra": "9<sup>e</sup> \u00e9tage, 301, rue St. Paul",\
					"York-Durham": "5<sup>e</sup> \u00e9tage, 230 chemin Westney Sud"\
				};\
				var moeDistrictThunderbayTollFreePhone = {\
					"Thunder Bay": "1-800-875-7772 (Dans la zone des indicatifs r\u00e9gionaux 705 et 807)"\
				};\
				var moeDistrictThunderbayFax = {\
					"Thunder Bay": "(807) 473-3160 ou (807) 475-1754"\
				};\
				if (featuresLength === 0) {%>\
					<i> <%= address %>.</i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3> Le syst\u00e8me n\u2019a pas trouv\u00e9 de district du MEO</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= address %></i><br><br><strong>R\u00e9sultat situ\u00e9 dans le</strong><br><h3><%= MOEDistrict[attrs.MOE_DISTRICT] %></h3><br>Adresse du bureau: <br><%= MOEDistrictStreet[attrs.MOE_DISTRICT] %><br>\
					<%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Sans frais: <%= (attrs.MOE_DISTRICT === "Thunder Bay") ? moeDistrictThunderbayTollFreePhone["Thunder Bay"] : attrs.TOLLFREENUMBER %><br>T\u00e9l\u00e9phone: <%= attrs.PHONENUMBER %>\
					T\u00e9l\u00e9copieur: <%= (attrs.MOE_DISTRICT === "Thunder Bay") ? moeDistrictThunderbayFax["Thunder Bay"] : attrs.FAXNUMBER %>\
				<% } %>';
		/*French Ends*/
			var contain = _.template(template, {results: results, Util: Util, geocodingResult: geocodingResult});			
			return {
				infoWindow: contain,
				table: contain
			}; 
		}
	},	
	preSearchCallbackName: 'Geocode',
	searchCallbackName: 'Geocode',
	postSearchCallbackName: 'Geocode',
	searchZoomLevel: 12,
	searchChange: function () {}
});

//globalConfig.chooseLang = function (en, fr) {return (globalConfig.language === "EN") ? en : fr;};

//globalConfig.report_URL = globalConfig.chooseLang("SportFish_Report.htm", "SportFish_Report.htm");

//globalConfig.searchableFieldsList = [{en: "waterbody name", fr: "plan d'eau"}, {en: "location", fr: "un lieu"}, {en: "species name", fr: "une espèce"}];


	

//globalConfig.infoWindowWidth = '320px';
//globalConfig.infoWindowHeight = "140px";
//globalConfig.infoWindowContentHeight = "200px";
//globalConfig.infoWindowContentWidth = "300px";


//globalConfig.tableSimpleTemplateTitleLang = globalConfig.chooseLang("Note: Data is in English only.", "\u00c0 noter : Les donn\u00e9es sont en anglais seulement.");
//globalConfig.



