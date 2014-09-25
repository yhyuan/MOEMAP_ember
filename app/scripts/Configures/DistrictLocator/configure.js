var identifyCallback = require('../scripts/IdentifyCallbacks/PolygonLayers');
var searchCallback = require('../scripts/SearchCallbacks/PolygonLayers');
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
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/MOE_Districts_Full_Bnd/MapServer',
		layerID: 0,
		returnGeometry: false,
		outFields: ["OBJECTID","MOE_DISTRICT","STREET_NAME","CITY","POSTALCODE","PHONENUMBER","TOLLFREENUMBER","FAXNUMBER","MOE_DISTRICT_NAME"]
	}],
	exportParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/MOE_Districts_Full_Bnd/MapServer',
		visibleLayers: [0]
	}],
	transformResults: function (results) {
		/*English Begins*/		
		return results;
		/*English Ends*/
		/*French Begins*/
		var translateDistrictName = function (district) {
			var MOEDistrict = {
				"Barrie":  "District de Barrie du MEACC.",
				"Guelph":  "District de Guelph du MEACC.",
				"Halton-Peel": "District de Halton-Peel du MEACC.",
				"Hamilton":  "District de Hamilton du MEACC.",
				"Kingston":  "District de Kingston du MEACC.",
				"London":  "District de London du MEACC.",
				"Ottawa": "District d\u2019Ottawa du MEACC.",
				"Owen Sound": "District d\u2019Owen Sound du MEACC.",
				"Peterborough": "District de Peterborough du MEACC.",
				"Sarnia": "District de Sarnia du MEACC.",
				"Sudbury": "District de Sudbury du MEACC.",
				"Thunder Bay": "District de Thunder Bay du MEACC.",
				"Timmins": "District de Timmins du MEACC.",
				"Toronto": "District de Toronto du MEACC.",
				"Niagra": "District de Niagara du MEACC.",
				"York-Durham": "District de York-Durham du MEACC."
			};
			return MOEDistrict[district];
		};
		var translateDistrictStreet = function (district) {		
			var MOEDistrictStreet = {
				"Barrie":  "Bureau 1203, 54, alle Cedar Pointe",
				"Guelph":  "1, chemin Stone Ouest",
				"Halton-Peel": "Bureau 300, 4145 North Service Road",
				"Hamilton":  "9<sup>e</sup> \u00e9tage, 119, rue King Ouest",
				"Kingston":  "C. P. 22032, 1259 rue Gardiners",
				"London":  "733, chemin Exeter",
				"Ottawa": "2430 Don Reid Drive",
				"Owen Sound": "101, rue 17<sup>e</sup> Est",
				"Peterborough": "300, rue Water, Place Robinson",
				"Sarnia": "1094, chemin London",
				"Sudbury": "Bureau 1201, 199, rue Larch",
				"Thunder Bay": "3<sup>e</sup> \u00e9tage, bureau 331B, 435, rue James Sud",
				"Timmins": "Complexe du gouvernement de l\u2019Ontario, Sac postal 3080, Autoroute 101 Est",
				"Toronto": "8<sup>e</sup> \u00e9tage, 5775, rue Yonge",
				"Niagra": "9<sup>e</sup> \u00e9tage, 301, rue St. Paul",
				"York-Durham": "5<sup>e</sup> \u00e9tage, 230 chemin Westney Sud"
			};
			return MOEDistrictStreet[district];
		};
		var translateDistrictTollFreePhone = function (district, tollFree) {
			if (district === "Thunder Bay") {
				return "1-800-875-7772 (Dans la zone des indicatifs r\u00e9gionaux 705 et 807)";
			} else {
				return tollFree;
			}
		};
		var translateDistrictFax = function (district, fax) {
			if (district === "Thunder Bay") {
				return "(807) 473-3160 ou (807) 475-1754";
			} else {
				return fax;
			}
		};
		return _.map(results, function(layer) {
				layer.features = _.map(layer.features, function(feature) {
					feature.attributes["MOE_DISTRICT"] = translateDistrictName(feature.attributes["MOE_DISTRICT"]);
					feature.attributes["STREET_NAME"] = translateDistrictStreet(feature.attributes["STREET_NAME"]);
					feature.attributes["TOLLFREENUMBER"] = translateDistrictTollFreePhone(feature.attributes["MOE_DISTRICT"], feature.attributes["TOLLFREENUMBER"]);
					feature.attributes["FAXNUMBER"] = translateDistrictFax(feature.attributes["MOE_DISTRICT"], feature.attributes["FAXNUMBER"]);
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

globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);