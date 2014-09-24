var identifyCallback = require('../scripts/IdentifyCallbacks/PolygonLayers');
var searchCallback = require('../scripts/SearchCallbacks/OneFeatureNoTab');
var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');

var globalConfigure = {
	langs: langSetting,
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
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Waterbody</center></th><th><center>Location</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Consumption Advisory Table</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LOCNAME_EN %></td><td><%= attrs.GUIDELOC_EN %></td><td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td><td><a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC  %>\'>Consumption Advisory Table</a></td></tr>\
		<% }); %>\
		</tbody></table>',
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Plan d\'eau</center></th><th><center>Lieu</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Tableau des mises en garde en mati\u00e8re de consommation</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LOCNAME_FR %></td><td><%= attrs.GUIDELOC_FR %></td><td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td><td><a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC  %>\'>Tableau des mises en garde en mati\u00e8re de consommation</a></td></tr>\
		<% }); %>\
		</tbody></table>',
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
	queryParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
		layerID: 0,
		returnGeometry: true,
		/*English Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
		/*English Ends*/
		/*French Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE']
		/*French Ends*/
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
	getSearchCondition: function (params) {
		var getLakeNameSearchCondition = function(searchString) {
			var coorsArray = searchString.split(/\s+/);
			var str = coorsArray.join(" ").toUpperCase();
			str = Util.replaceChar(str, "'", "''");
			str = Util.replaceChar(str, "\u2019", "''");
			/*English Begins*/
			return "UPPER(LOCNAME_EN) LIKE '%" + str + "%'";
			/*English Ends*/
			/*French Begins*/
			return "UPPER(LOCNAME_FR) LIKE '%" + str + "%'";
			/*French Ends*/
		};
		var getQueryCondition = function(name){
			var str = name.toUpperCase();
			str = Util.replaceChar(str, '&', ', ');
			str = Util.replaceChar(str, ' AND ', ', '); 
			str = str.trim();
			var nameArray = str.split(',');
			var max = nameArray.length;
			var res = [];
			var inform = [];
			var processAliasFishName = function(fishname){
				var aliasList = {
					GERMAN_TROUT: ["BROWN_TROUT"],
					SHEEPHEAD:	["FRESHWATER_DRUM"],
					STEELHEAD:	["RAINBOW_TROUT"],
					SUNFISH:	["PUMPKINSEED"],
					BARBOTTE:	["BROWN_BULLHEAD"],
					BLACK_BASS:	["LARGEMOUTH_BASS","SMALLMOUTH_BASS"],
					CALICO_BASS:	["BLACK_CRAPPIE"],
					CRAWPIE:	["BLACK_CRAPPIE","WHITE_CRAPPIE"],
					GREY_TROUT:	["LAKE_TROUT"],
					HUMPBACK_SALMON:	["PINK_SALMON"],
					KING_SALMON:	["CHINOOK_SALMON"],
					LAKER:	["LAKE_TROUT"],
					MENOMINEE:	["ROUND_WHITEFISH"],
					MUDCAT:	["BROWN_BULLHEAD"],
					MULLET:	["WHITE_SUCKER"],
					PANFISH:	["BLUEGILL","ROCK_BASS","PUMPKINSEED"],
					PICKEREL:	["WALLEYE"],
					SILVER_BASS:	["WHITE_BASS"],
					SILVER_SALMON:	["COHO_SALMON"],
					SPECKLED_TROUT:	["BROOK_TROUT"],
					SPRING_SALMON:	["CHINOOK_SALMON"]
				};
				var alias = aliasList[fishname];
				var fish = Util.wordCapitalize(Util.replaceChar(fishname, '_', ' '));
				if (typeof(alias) === "undefined"){
					var result = {
						/*English Begins*/
						condition: "(SPECIES_EN like '%" + fishname +"%')",
						/*English Ends*/
						/*French Begins*/
						condition: "(SPECIES_FR like '%" + fishname +"%')",
						/*French Ends*/
						information: fish
					};
					return result;
				}else{
					var res = [];
					var fishArray = [];
					for (var i = 0; i < alias.length; i++){
						/*English Begins*/
						res.push("(SPECIES_EN like '%" + alias[i] +"%')");
						/*English Ends*/
						/*French Begins*/
						res.push("(SPECIES_FR like '%" + alias[i] +"%')");
						/*French Ends*/
						var str = Util.wordCapitalize(Util.replaceChar(alias[i], '_', ' '));
						fishArray.push(str.trim());
					}
					var result = {
						condition: "(" + res.join(" OR ") + ")",
						information: fish + " ("  + fishArray.join(", ") + ")"
					};
					return result;
				}
			}
			for (var i = 0; i < max; i++){
				var str1 = (nameArray[i]).trim();
				if(str1.length > 0){
					var coorsArray = str1.split(/\s+/);
					str1 = coorsArray.join("_");
					var temp = processAliasFishName(str1);
					res.push(temp.condition);
					inform.push(temp.information);
				}
			}		
			var result = {
				condition: res.join(" AND "),
				information: inform.join(", ")
			};
			return result;
		};
		var searchString = params.searchString;
		return ($('#searchMapLocation')[0].checked) ? getLakeNameSearchCondition(searchString) : getQueryCondition(searchString).condition;
	},
	getSearchGeometry: function (params) {
		if ($('#currentMapExtent')[0].checked) {
			return params.currentMapExtent;
		} else {
			return null;
		}
	},
	getSearchSettings: function (params) {
		var settings = {
			searchString: params.searchString,
			geocodeWhenQueryFail: ($('#searchMapLocation')[0].checked) ? true : false,
			withinExtent: $('#currentMapExtent')[0].checked/*,
			invalidFeatureLocations: [{
				lat: 0,
				lng: 0,
				difference: 0.0001
			}]*/
		};
		return settings;
	}
};

globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);