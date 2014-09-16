/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/GoogleMapsAdapter');
var Util = require('../scripts/Util');
window.GoogleMapsAdapter = GoogleMapsAdapter;
GoogleMapsAdapter.init({
	mapServices: [{
		url: "http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer",
		visibleLayers: [0, 1, 2]
	}],
	identifySettings: {
		/* radius: 1, // 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
			layerID: 0,
			/*English Begins*/
			outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
			/*English Ends*/
			/*French Begins*/
			outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE']
			/*French Ends*/
		}],
		/*English Begins*/		
		identifyTemplate: '<strong><%= attrs.LOCNAME_EN %></strong><br><%= Util.addBRtoLongText(attrs.GUIDELOC_EN) %><br><br>\
			<a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC %>\'>Consumption Advisory Table</a><br><br>\
			Latitude <b><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></b> Longitude <b><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></b><br>\
			<a href=\'mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission <%= attrs.LOCNAME_EN %>)\'>Report an error for this location</a>.<br><br>'
		/*English Ends*/
		/*French Begins*/
		identifyTemplate: '<strong><%= attrs.LOCNAME_FR %></strong><br><%= Util.addBRtoLongText(attrs.GUIDELOC_FR) %><br><br>\
			<a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC %>\'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a><br><br>\
			Latitude <b><%= Util.deciToDegree(attrs.LATITUDE, "FR") %></b> Longitude <b><%= Util.deciToDegree(attrs.LONGITUDE, "FR") %></b><br>\
			<a href=\'mailto:sportfish.moe@ontario.ca?subject=Erreur de portail (Submission <%= attrs.LOCNAME_FR %>)\'>Signalez un probl\u00e8me pour ce lieu</a>.<br><br>'
		/*French Ends*/
	},
	infoWindowHeight: '140px',
	getSearchParams: function(searchString){
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
		var queryParamsList = [{
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
		}];
		var options = {
			searchString: searchString,
			geocodeWhenQueryFail: ($('#searchMapLocation')[0].checked) ? true : false,
			withinExtent: $('#currentMapExtent')[0].checked/*,
			invalidFeatureLocations: [{
				lat: 0,
				lng: 0,
				difference: 0.0001
			}]*/
		};
		return {
			queryParamsList: queryParamsList,
			options: options
		}
	},
	searchChange: function (type) {
		$('#' + this.searchInputBoxDivId)[0].value = '';
		if(type === "Substance"){
			$('#' + this.searchInputBoxDivId).autocomplete({
				source: this.substancesNames,
				select: function(e, ui) {
					GoogleMapsAdapter.search(ui.item.value);
				},
				disabled: false});
		}else if(type === "Sector"){
			$('#' + this.searchInputBoxDivId).autocomplete({
				source: this.sectorNames,
				select: function(e, ui) {
					GoogleMapsAdapter.search(ui.item.value);
				},			
				disabled: false });
		}else{
			$('#' + this.searchInputBoxDivId).autocomplete({source: [], 
				disabled: true });
		}
	}
});
