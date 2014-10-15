/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/Basemaps/GoogleMapsAdapter');
window.GoogleMapsAdapter = GoogleMapsAdapter;
var ArcGISServerAdapter = require('../scripts/FeatureLayers/ArcGISServerAdapter');
var Util = require('../scripts/Util');
/*English Begins*/
var langSetting = require('../scripts/Configures/Languages/English');
/*English Ends*/
/*French Begins*/
var langSetting = require('../scripts/Configures/Languages/French');
/*French Ends*/
var PubSub = require('../scripts/PubSub');
var defaultConfiguration = require('../scripts/Configures/Defaults');
/*Geocoder setup starts*/
var GeographicTownship = require('../scripts/Geocoders/GeographicTownship');
var GeographicTownshipWithLotConcession = require('../scripts/Geocoders/GeographicTownshipWithLotConcession');
var LatLngInDecimalDegree = require('../scripts/Geocoders/LatLngInDecimalDegree');
var LatLngInDMSSymbols = require('../scripts/Geocoders/LatLngInDMSSymbols');
var LatLngInSymbols = require('../scripts/Geocoders/LatLngInSymbols');
var UTM = require('../scripts/Geocoders/UTM');
var UTMInDefaultZone = require('../scripts/Geocoders/UTMInDefaultZone');
var GoogleGeocoder = require('../scripts/Geocoders/GoogleGeocoder');
//var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');
var Geocoder = require('../scripts/Geocoders/Geocoder');
var defaultGeocoderConfigurations = require('../scripts/Geocoders/configurations/default');
var GeocoderSettings = {
	GeocoderList: [LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone, GeographicTownship, GeographicTownshipWithLotConcession],
	defaultGeocoder: GoogleGeocoder/*,
	reverseGeocoder: GoogleReverseGeocoder*/
};
GeocoderSettings = _.defaults(defaultGeocoderConfigurations, GeocoderSettings);
Geocoder.init(GeocoderSettings);
/*Geocoder setup ends*/

/*
	The following message response function provides the response for identifying on the map. 
	The params provides the latlng and radius for the identification. 
	1) Calculate the circle using the latlng and radius. 
	2) Generate paramList and perform the query of the layers
	3) Transform the results to a required format
	4) Get the first result and generate the infowindow content
	5) Send the infoWindow content and the click location back to Google maps to display the pin and infowindow. 
*/
PubSub.on("MOECC_MAP_IDENTIFY_REQUEST_READY", function(params) {
	var latLng = params.latlng;
	var radius = params.radius; //Zoom Level related identify radius. For Google maps, the radius can be [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1] by using zoom level as the index for the array. 
	var circle = Util.computeCircle(latLng, radius);
	var identifyParamsList = [{
		mapService: globalConfigure.mainMapService,
		layerID: 0,
		returnGeometry: false,
		geometry: circle,
		outFields: globalConfigure.outFields
	}];

	ArcGISServerAdapter.queryLayers(identifyParamsList).done(function() {
		var results = globalConfigure.transformResults(arguments);
		var features = Util.combineFeatures (results);
		if (features.length === 0) {
			return false;
		}
		var attrs = features[0].attributes;  // The attributes for the first feature.
		var container = document.createElement('div');
		container.style.width = globalConfigure.infoWindowWidth;
		container.style.height = globalConfigure.infoWindowHeight;
		container.innerHTML = _.template(globalConfigure.identifyTemplate, {attrs: attrs});
		PubSub.emit("MOECC_MAP_OPEN_INFOWINDOW", {infoWindow: container, latlng: latLng});
	});
});
var url = defaultConfiguration.dynamicResourcesLoadingURL;
var urls = [url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

PubSub.on("MOECC_MAP_SEARCH_REQUEST_READY", function (params) {
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
	var where = globalConfigure.getSearchCondition(params.searchString);
	if(!where) {
		return;
	}
	var queryParamsList = [{
		mapService: globalConfigure.mainMapService,
		layerID: 0,
		returnGeometry: true,
		where: where,
		outFields: globalConfigure.outFields
	}];
	var geometry = globalConfigure.getSearchGeometry(params.currentMapExtent);
	if (geometry) {
		_.each(queryParamsList, function(p) {
			p.geometry = geometry;
		});
	}
	var settings = globalConfigure.getSearchSettings(params.searchString);
	ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
		var results = globalConfigure.transformResults(arguments);
		var features = Util.combineFeatures(results);
		if (features.length === 0) {
			if (settings.geocodeWhenQueryFail) {
				var initParams = {address: params.searchString, withinExtent: settings.withinExtent};
				var geocodingParams = _.defaults(initParams, GeocoderSettings);
				Geocoder.geocode(geocodingParams).done(function(result) {
					var insideExtent = function (ex, latlng) {
						var lat = latlng.lat;
						var lng = latlng.lng;
						var minLat = ex[0].lat;
						var maxLat = ex[2].lat;
						var minLng = ex[0].lng;
						var maxLng = ex[1].lng;
						if ((lat < minLat) || (lat > maxLat) || (lng < minLng) || (lng > maxLng)) {
							return false;
						} else {
							return true;
						}						
					};
					if (((result.status === "OK") && !settings.withinExtent) || ((result.status === "OK") && settings.withinExtent && insideExtent(params.currentMapExtent, result.latlng))) {
						var container = document.createElement('div');
						container.style.width = globalConfigure.infoWindowWidth;
						container.style.height = globalConfigure.infoWindowHeight;
						container.innerHTML = result.address;
						PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_MARKER_READY", {container: container, latlng: result.latlng});
						
						if(!settings.withinExtent) {
							PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {
								center: result.latlng,
								zoomLevel: (result.hasOwnProperty('zoomLevel')) ? result.zoomLevel : globalConfigure.maxQueryZoomLevel
							});
						}
						
						if (result.hasOwnProperty('geometry')) {
							PubSub.emit("MOECC_MAP_ADD_POLYLINES", {
								geometry: result.geometry,
								boundary: result.boundary
							});
						}
						var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedOneResultLang);
						$('#' + globalConfigure.informationDivId).html('<i>' + message + ' ' + ((params.withinExtent) ? globalConfigure.langs.inCurrentMapExtentLang : globalConfigure.langs.inGobalRegionLang) + '</i>');		
					} else {
						var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedNoResultLang);
						$('#' + globalConfigure.informationDivId).html('<i>' + message + ' ' + ((settings.withinExtent) ? globalConfigure.langs.inCurrentMapExtentLang : globalConfigure.langs.inGobalRegionLang) + '</i>');		
					}
				});				
			} else {
				var messageParams = {
					totalCount: 0,
					searchString: params.searchString,
					withinExtent: settings.withinExtent,
					maxQueryReturn: globalConfigure.maxQueryReturn
				};
				$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
			}
		} else {
			var tableContent = _.template(tableTemplate, {features: features});
			$('#' + globalConfigure.queryTableDivId).html(tableContent);
			var dataTableOptions = {
				'bJQueryUI': true,
				'sPaginationType': 'full_numbers' 
			};
			if (globalConfigure.langs.hasOwnProperty('dataTableLang')) {
				dataTableOptions['oLanguage'] = globalConfigure.langs.dataTableLang;
			}
			var tableID = Util.getTableIDFromTableTemplate(tableTemplate);
			$('#' + tableID).dataTable(dataTableOptions);

			var markers = _.map(features, function(feature) {
				var container = document.createElement('div');
				container.style.width = globalConfigure.infoWindowWidth;
				container.style.height = globalConfigure.infoWindowHeight;
				container.innerHTML = _.template(globalConfigure.identifyTemplate, {attrs: feature.attributes});
				return {container: container, latlng: {lat: feature.geometry.y, lng: feature.geometry.x}};
			});
			PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: markers});
			
			if(!settings.withinExtent) {
				var latlngs = _.map(features, function(feature) {
					return {lng: feature.geometry.x, lat: feature.geometry.y};
				});
				PubSub.emit("MOECC_MAP_SEARCH_BOUNDS_CHANGED", {bounds:  Util.computePointsBounds(latlngs)});
			}
			var messageParams = {
				totalCount: features.length,
				searchString: globalConfigure.searchString,
				withinExtent: globalConfigure.withinExtent,
				maxQueryReturn: globalConfigure.maxQueryReturn
			};
			$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
		}
	});
});

PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function (params) {
	var map = params.map;
	_.each(globalConfigure.mapServices, function(mapService) {
		var dynamap = new gmaps.ags.MapOverlay(mapService);
		dynamap.setMap(map);	
	});
});
GoogleMapsAdapter.init(PubSub);

var globalConfigure = {
	mainMapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
	mapServices: ['http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer'],
	/*English Begins*/
	outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE'],
	/*English Ends*/
	/*French Begins*/
	outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE'],
	/*French Ends*/	
	langs: langSetting,
	//minMapScale: 1,
	infoWindowHeight: '140px',
	/*English Begins*/		
	identifyTemplate: '<strong><%= attrs.LOCNAME_EN %></strong><br><%= attrs.GUIDELOC_EN %><br><br>\
		<a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC %>\'>Consumption Advisory Table</a><br><br>\
		Latitude <b><%= attrs.LATITUDE %></b> Longitude <b><%= attrs.LONGITUDE %></b><br>\
		<a href=\'mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission <%= attrs.LOCNAME_EN %>)\'>Report an error for this location</a>.<br><br>',
	/*English Ends*/
	/*French Begins*/
	identifyTemplate: '<strong><%= attrs.LOCNAME_FR %></strong><br><%= attrs.GUIDELOC_FR %><br><br>\
		<a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC %>\'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a><br><br>\
		Latitude <b><%= attrs.LATITUDE %></b> Longitude <b><%= attrs.LONGITUDE %></b><br>\
		<a href=\'mailto:sportfish.moe@ontario.ca?subject=Erreur de portail (Submission <%= attrs.LOCNAME_FR %>)\'>Signalez un probl\u00e8me pour ce lieu</a>.<br><br>',
	/*French Ends*/
	transformResults: function (results) {
		var deciToDegree = function (degree, language){
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
		return _.map(results, function(layer) {
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
	},
	getSearchCondition: function (searchString) {
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
		return ($('#searchMapLocation')[0].checked) ? getLakeNameSearchCondition(searchString) : getQueryCondition(searchString).condition;
	},
	getSearchGeometry: function (currentMapExtent) {
		if ($('#currentMapExtent')[0].checked) {
			return currentMapExtent;
		} else {
			return null;
		}
	},
	getSearchSettings: function (searchString) {
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
		return settings;
	}
};

globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

/*English Begins*/
$('#' + globalConfigure.otherInfoDivId).html("<h2>Find a map error?</h2> \
		<p>It is possible you may encounter inaccuracies with map locations.</p> \
		<p>If you find an error in the location of a lake, river or stream, please contact us.  Use the <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Error'>Report an error</a> link within the map pop-up.</p> \
		<h2>Comments</h2> \
		<p>For comments and suggestions, email us at <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Feedback'>sportfish.moe@ontario.ca</a>.</p>");	
/*English Ends*/
/*French Begins*/
$('#' + globalConfigure.otherInfoDivId).html('<h2>Une erreur sur la carte?</h2> \
		<p>Il est possible que des impr&eacute;cisions se soient gliss&eacute;es sur les emplacements.</p> \
		<p>Si vous trouvez une erreur d&rsquo;emplacement d&rsquo;un lac, d&rsquo;une rivi&egrave;re ou d&rsquo;un cours d&rsquo;eau, veuillez nous en avertir. Vous pouvez utiliser le lien &laquo; <a href="mailto:sportfish.moe@ontario.ca?subject=Sport%20Fish%20Map%20Error">Signaler une erreur</a> &raquo; du menu contextuel de la carte.</p> \
		<h2>Commentaires</h2> \
		<p>Veuillez formuler vos commentaires ou vos suggestions par courriel &agrave; <a href="mailto:sportfish.moe@ontario.ca">sportfish.moe@ontario.ca</a>.</p>');
/*French Ends*/
/*English Begins*/
$("#" + globalConfigure.searchControlDivId).html('<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
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
		<div id="information"></div>');
/*English Ends*/
/*French Begins*/
$("#" + globalConfigure.searchControlDivId).html('<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
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
		<div id="information"></div>');
/*French Ends*/	
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);
