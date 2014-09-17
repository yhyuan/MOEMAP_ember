/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/GoogleMapsAdapter');
window.GoogleMapsAdapter = GoogleMapsAdapter;
var ArcGISServerAdapter = require('../scripts/ArcGISServerAdapter');
var Util = require('../scripts/Util');
/*English Begins*/
var langSetting = require('../scripts/Configures/Languages/English');
/*English Ends*/
/*French Begins*/
var langSetting = require('../scripts/Configures/Languages/French');
/*French Ends*/
var PubSub = require('../scripts/PubSub');
var defaultConfiguration = require('../scripts/Configures/Defaults');
var identifyCallback = require('../scripts/IdentifyCallbacks/OneFeatureNoTab');
var searchCallback = require('../scripts/SearchCallbacks/OneFeatureNoTab');

var url = 'http://files.ontariogovernment.ca/moe_mapping/mapping/js/MOEMap/';
var urls = [url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

	
var deciToDegree = function (degree){
	if(Math.abs(degree) <= 0.1){
		return "N/A";
	}
	var sym = "N";
	if(degree<0){
		degree = -degree;
		/*English Begins*/		
		sym = "W";
		/*English Ends*/
		/*French Begins*/
		sym = "O";
		/*French Ends*/			
	}
	var deg = Math.floor(degree);
	var temp = (degree - deg)*60;
	var minute = Math.floor(temp);
	var second = Math.floor((temp- minute)*60);
	var res = "";
	var degreeSymbolLang = "&deg;";
	if(second<1){
		res ="" + deg + degreeSymbolLang + minute + "'";
	}else if(second>58){
		res ="" + deg + degreeSymbolLang + (minute+1) + "'";
	}else{
		res ="" + deg + degreeSymbolLang + minute + "'" + second + "\"";
	}
	return res + sym;
};

var addBRtoLongText = function (text) {
	var lineCount = 0;
	var readyForBreak = false;
	if (text.length <= 40) {
		return text;
	}
	var textArray = text.split('');
	var result = "";	
	for (var i = 0; i < textArray.length; i++) {
		if (lineCount > 40) {
			readyForBreak = true;
		}
		result = result + textArray[i];
		if ((readyForBreak) && (textArray[i] === " ")) {
			lineCount = 0;
			result = result + "<br>";
			readyForBreak = false;
		}
		lineCount = lineCount + 1;
	}
	return result;
};	

/*
PubSub.on("MOECC_MAP_MOUSE_CLICK", function(latLng) {
	console.log("MOECC_MAP_MOUSE_CLICK in configuration");
});
*/
PubSub.on("MOECC_MAP_IDENTIFY_GEOMETRY_READY", function(params) {
	var identifyParams = {
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
		layerID: 0,
		returnGeometry: false,
		geometry: params.geometry,
		/*English Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
		/*English Ends*/
		/*French Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE']
		/*French Ends*/
	};
	var promises = [ArcGISServerAdapter.query(identifyParams)];
	PubSub.emit("MOECC_MAP_IDENTIFY_PROMISES_READY", {promises: promises, settings: params.settings});
});

/*English Begins*/		
var identifyTemplate = '<strong><%= attrs.LOCNAME_EN %></strong><br><%= attrs.GUIDELOC_EN %><br><br>\
	<a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC %>\'>Consumption Advisory Table</a><br><br>\
	Latitude <b><%= attrs.LATITUDE %></b> Longitude <b><%= attrs.LONGITUDE %></b><br>\
	<a href=\'mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission <%= attrs.LOCNAME_EN %>)\'>Report an error for this location</a>.<br><br>';
/*English Ends*/
/*French Begins*/
var identifyTemplate = '<strong><%= attrs.LOCNAME_FR %></strong><br><%= attrs.GUIDELOC_FR %><br><br>\
	<a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC %>\'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a><br><br>\
	Latitude <b><%= attrs.LATITUDE %></b> Longitude <b><%= attrs.LONGITUDE %></b><br>\
	<a href=\'mailto:sportfish.moe@ontario.ca?subject=Erreur de portail (Submission <%= attrs.LOCNAME_FR %>)\'>Signalez un probl\u00e8me pour ce lieu</a>.<br><br>';
/*French Ends*/

PubSub.on("MOECC_MAP_IDENTIFY_RESPONSE_READY", function(params) {
	var results = params.results;
	results = _.map(results, function(layer) {
		layer.features = _.map(layer.features, function(feature) {
			feature.attributes["LATITUDE"] = deciToDegree(feature.attributes["LATITUDE"]);
			feature.attributes["LONGITUDE"] = deciToDegree(feature.attributes["LONGITUDE"]);
			/*English Begins*/		
			feature.attributes["GUIDELOC_EN"] = addBRtoLongText(feature.attributes["GUIDELOC_EN"]);
			/*English Ends*/
			/*French Begins*/
			feature.attributes["GUIDELOC_FR"] = addBRtoLongText(feature.attributes["GUIDELOC_FR"]);
			/*French Ends*/
			return feature;
		})
		return layer;
	});	
	var container = identifyCallback({results: results, identifyTemplate: identifyTemplate, infoWindowWidth: params.settings.infoWindowWidth, infoWindowHeight: params.settings.infoWindowHeight});
	if (!!container) {
		PubSub.emit("MOECC_MAP_IDENTIFY_INFOWINDOW_READY", {infoWindow: container, latlng: params.settings.latlng});
	}
});

PubSub.on("MOECC_MAP_BOUNDS_CHANGED_REQUEST_READY", function (request) {
	/*var promises = _.map([{
		url: "http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer",
		visibleLayers: [0, 1, 2],
		type: 'ArcGISMapService'
	}], function(mapService) {
		var exportParams =  {
			bounds: request.bounds,
			width: request.width,
			height: request.height,
			mapService: mapService.url,
			visibleLayers: mapService.visibleLayers
		};
		return ArcGISServerAdapter.exportMap(exportParams);
	}); */
	var exportParams =  {
		bounds: request.bounds,
		width: request.width,
		height: request.height,
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
		visibleLayers: [0, 1, 2]
	};	
	var promises = [ArcGISServerAdapter.exportMap(exportParams)];
	PubSub.emit("MOECC_MAP_BOUNDS_CHANGED_PROMISES_READY", promises);	
});

PubSub.on("MOECC_MAP_SEARCH_STRING_READY", function (params) {
	var searchString = params.searchString;
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

	var queryParams = {
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
		layerID: 0,
		returnGeometry: true,
		where: ($('#searchMapLocation')[0].checked) ? getLakeNameSearchCondition(searchString) : getQueryCondition(searchString).condition,
		/*English Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
		/*English Ends*/
		/*French Begins*/
		outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE']
		/*French Ends*/
	};
	if ($('#currentMapExtent')[0].checked) {
		queryParams.geometry = params.currentMapExtent;
	}
	var promises = [ArcGISServerAdapter.query(queryParams)];
	var settings = {
		searchString: searchString,
		geocodeWhenQueryFail: ($('#searchMapLocation')[0].checked) ? true : false,
		withinExtent: $('#currentMapExtent')[0].checked/*,
		invalidFeatureLocations: [{
			lat: 0,
			lng: 0,
			difference: 0.0001
		}]*/
	};
	PubSub.emit("MOECC_MAP_SEARCH_PROMISES_READY", {promises: promises, settings: _.defaults(settings, params.settings)});
});

PubSub.on("MOECC_MAP_SEARCH_RESPONSE_READY", function(params) {
		/*English Begins*/	
	var tableTemplate = '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Waterbody</center></th><th><center>Location</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Consumption Advisory Table</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LOCNAME_EN %></td><td><%= attrs.GUIDELOC_EN %></td><td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td><td><a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC  %>\'>Consumption Advisory Table</a></td></tr>\
		<% }); %>\
		</tbody></table>';
		/*English Ends*/
		/*French Begins*/
	var tableTemplate = '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Plan d\'eau</center></th><th><center>Lieu</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Tableau des mises en garde en mati\u00e8re de consommation</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LOCNAME_FR %></td><td><%= attrs.GUIDELOC_FR %></td><td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td><td><a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC  %>\'>Tableau des mises en garde en mati\u00e8re de consommation</a></td></tr>\
		<% }); %>\
		</tbody></table>';		
		/*French Ends*/
	var results = params.results;
	results = _.map(results, function(layer) {
		layer.features = _.map(layer.features, function(feature) {
			feature.attributes["LATITUDE"] = deciToDegree(feature.attributes["LATITUDE"]);
			feature.attributes["LONGITUDE"] = deciToDegree(feature.attributes["LONGITUDE"]);
			/*English Begins*/		
			feature.attributes["GUIDELOC_EN"] = addBRtoLongText(feature.attributes["GUIDELOC_EN"]);
			/*English Ends*/
			/*French Begins*/
			feature.attributes["GUIDELOC_FR"] = addBRtoLongText(feature.attributes["GUIDELOC_FR"]);
			/*French Ends*/
			return feature;
		})
		return layer;
	});	
	
	searchCallback({results: results, tableTemplate: tableTemplate, identifyTemplate: identifyTemplate, settings: params.settings, PubSub: PubSub});
});
	
GoogleMapsAdapter.setPubSub(PubSub);

var configuration = {
	langs: langSetting,
	infoWindowHeight: '140px',
	/*English Begins*/
	otherInfoHTML: "<h2>Find a map error?</h2> \
		<p>It is possible you may encounter inaccuracies with map locations.</p> \
		<p>If you find an error in the location of a lake, river or stream, please contact us.  Use the <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Error'>Report an error</a> link within the map pop-up.</p> \
		<h2>Comments</h2> \
		<p>For comments and suggestions, email us at <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Feedback'>sportfish.moe@ontario.ca</a>.</p>",
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: '<h2>Une erreur sur la carte?</h2> \
		<p>Il est possible que des impr&eacute;cisions se soient gliss&eacute;es sur les emplacements.</p> \
		<p>Si vous trouvez une erreur d&rsquo;emplacement d&rsquo;un lac, d&rsquo;une rivi&egrave;re ou d&rsquo;un cours d&rsquo;eau, veuillez nous en avertir. Vous pouvez utiliser le lien &laquo; <a href="mailto:sportfish.moe@ontario.ca?subject=Sport%20Fish%20Map%20Error">Signaler une erreur</a> &raquo; du menu contextuel de la carte.</p> \
		<h2>Commentaires</h2> \
		<p>Veuillez formuler vos commentaires ou vos suggestions par courriel &agrave; <a href="mailto:sportfish.moe@ontario.ca">sportfish.moe@ontario.ca</a>.</p>',
	/*French Ends*/
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
		<fieldset>\
			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Search Map Location" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Search Map Location: Enter the name of an Ontario lake/river, city/town/township or street address to find fish consumption advice">\
			<label class="option" for="searchMapLocation">Search Map Location</label>\
			</span>\
			<br/>\
			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Search Fish Species" name="species" value="species" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Search Fish Species: Enter the name of a fish species to find lakes with fish consumption advice for the species">\
			<label class="option" for="searchFishSpecies">Search Fish Species</label>\
			</span>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
		</fieldset>\
		<div id="information"></div>'
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
		<fieldset>\
			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Recherche d\'emplacements" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'emplacements : Indiquer le lieu en Ontario (lac/rivi\u00e8re, ville/canton, adresse) pour avoir des conseils sur la consommation des poissons du lieu.">\
			<label class="option" for="searchMapLocation">Recherche d\'emplacements</label>\
			</span>\
			<br/>\
			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Recherche d\'esp\u00e8ces" name="species" value="species" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'esp\u00e8ces : Indiquer une esp\u00e8ce de poisson pour trouver des lacs sur lesquels existent des conseils sur la consommation de l\'esp\u00e8ce.">\
			<label class="option" for="searchFishSpecies">Recherche d\'esp\u00e8ces</label>\
			</span>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
		</fieldset>\
		<div id="information"></div>'
	/*French Ends*/
	/*
		identifyRadius: 1
	*/
};

PubSub.emit("MOECC_MAP_INITIALIZATION", _.defaults(configuration, defaultConfiguration));