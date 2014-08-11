/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/GoogleMapsAdapter');
var Util = require('../scripts/Util');
window.GoogleMapsAdapter = GoogleMapsAdapter;

GoogleMapsAdapter.queryLayers({queryParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/TRAIS/MapServer',
		layerID: 7,
		/*English Begins*/
		outFields: ["ID", "sectorNameEn"],
		/*English Ends*/
		/*French Begins*/
		outFields: ["ID", "sectorNameFr"],
		/*French Ends*/
		returnGeometry: false,
		where: '1=1'
	},{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/TRAIS/MapServer',
		layerID: 3,
		/*English Begins*/
		outFields: ["CODE", "SUBSTANCE_EN", "CASNumber"],
		/*English Ends*/
		/*French Begins*/
		outFields: ["CODE", "SUBSTANCE_FR", "CASNumber"],
		/*French Ends*/
		returnGeometry: false,
		where: '1=1'
}]}).done(function() {
	var sectorNames = _.map(arguments[0].features, function(feature) {
		/*English Begins*/
		return feature.attributes.ID + " - " + feature.attributes.sectorNameEn;
		/*English Ends*/
		/*French Begins*/
		return feature.attributes.ID + " - " + feature.attributes.sectorNameFr;
		/*French Ends*/
	});
	var substancesNames = _.map(arguments[1].features, function(feature) {
		/*English Begins*/
		return feature.attributes.SUBSTANCE_EN + " " + feature.attributes.CASNumber;
		/*English Ends*/
		/*French Begins*/
		return feature.attributes.SUBSTANCE_FR + " " + feature.attributes.CASNumber;
		/*French Ends*/
	});
	var substancesDict = _.object(substancesNames, _.map(arguments[1].features, function(feature) {
		return feature.attributes.CODE;
	}));
	
	GoogleMapsAdapter.init({
		sectorNames: sectorNames,
		substancesNames: substancesNames,
		substancesDict: substancesDict,
		/*English Begins*/
		language: "EN",
		/*English Ends*/
		/*French Begins*/
		language: "FR",
		/*French Ends*/
		mapServices: [{
			url: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/TRAIS/MapServer',
			visibleLayers: [0, 1]
		}],
		/*English Begins*/
		otherInfoHTML: '<strong>Note: The information and data reflected in this report is a consolidation of data reported by facilities regulated under Toxics Reduction Act, 2009 and is up to date as of December 20, 2013. The facilities have the opportunity to notify the ministry of errors.</strong>',
		/*English Ends*/
		/*French Begins*/
		otherInfoHTML: '<strong>Note : l’information et les donn&eacute;es pr&eacute;sent&eacute;s dans ce rapport est une synth&egrave;se des renseignements d&eacute;clar&eacute;s par les installations et les entreprises  en vertu de la Loi de 2009 sur la r&eacute;duction des toxiques. Ces renseignements &eacute;taient &agrave; jour le 20 d&eacute;cembre, 2013. Les installations et les entreprises peuvent communiquer avec le minist&egrave;re en cas d’erreurs.</strong><br><br>Certaines donn\u00e9es scientifiques et de surveillance n\u0027existent qu\u0027en anglais.',
		/*French Ends*/
		/*English Begins*/
		searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Search the map</label>\
			<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Search</label>\
			<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
			<fieldset>\
				<input type="radio" id="searchLocation" name="searchGroup" checked="checked" title="Search Map Location or Facility" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(\'Location\')"></input>\
				<span class="tooltip" title="Search Map Location or Facility: Enter facility name or street address to find facilities">\
				<label class="option" for="searchLocation">Search Map Location or Facility</label>\
				</span>\
				<br/>\
				<input type="radio" id="searchSubstance" name="searchGroup" title="Search Substance" value="substance" onclick="GoogleMapsAdapter.searchChange(\'Substance\')"></input>\
				<span class="tooltip" title="Search Substance: Enter the name of a substance to find facilities">\
				<label class="option" for="searchSubstance">Search Substance</label>\
				</span>\
				<br/>\
				<input type="radio" id="searchSector" name="searchGroup" title="Search Sector" value="secteur" onclick="GoogleMapsAdapter.searchChange(\'Sector\')"></input>\
				<span class="tooltip" title="Search Sector: Enter the name of a sector to find facilities">\
				<label class="option" for="searchSector">Search Sector</label>\
				</span>\
				<br/>\
				<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
			</fieldset>\
			<div id="information">You may search by <strong>city</strong>, <strong>facility name</strong>, <strong>company</strong>, <strong>sector</strong>, <strong>substance</strong> or see help for advanced options.</div>',
		/*English Ends*/
		/*French Begins*/
		searchControlHTML = '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
			<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Recherche</label>\
			<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
			<fieldset>\
				<input type="radio" id="searchLocation" name="searchGroup" checked="checked" title="Recherche par lieu ou par installation" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(\'Location\')"></input>\
				<span class="tooltip" title="Recherche par lieu ou par installation : entrez le nom de l\u0027installation ou son adresse.">\
				<label class="option" for="searchLocation">Recherche par lieu ou par installation</label>\
				</span>\
				<br/>\
				<input type="radio" id="searchSubstance" name="searchGroup" title="Recherche par substance" value="substance" onclick="GoogleMapsAdapter.searchChange(\'Substance\')"></input>\
				<span class="tooltip" title="Recherche par substance : entrez le nom de la substance pour trouver les installations avec cette substance">\
				<label class="option" for="searchSubstance">Recherche par substance</label>\
				</span>\
				<br/>\
				<input type="radio" id="searchSector" name="searchGroup" title="Recherche par secteur" value="secteur" onclick="GoogleMapsAdapter.searchChange(\'Sector\')"></input>\
				<span class="tooltip" title="Recherche par secteur : entrez le nom d\u0027un secteur pour trouver les installations dans ce secteur">\
				<label class="option" for="searchSector">Recherche par secteur</label>\
				</span>\
				<br/>\
				<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
			</fieldset>\
			<div id="information">Vous pouvez rechercher par <strong>ville</strong>, <strong>installation</strong>, <strong>entreprise</strong>, <strong>substance</strong>, <strong>secteur</strong> ou consulter l\'aide pour de l\'information sur les recherches avancées.</div>',
		/*French Ends*/
		identifySettings: {
			/* radius: 1, // 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
			identifyLayersList: [{
				mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/TRAIS/MapServer',
				layerID: 0,
				outFields: ['Facility', 'Organisation', 'StreetAddress', 'City', 'NPRI_ID', 'Sector', 'NUMsubst', 'UniqueID', 'NUMPlanSummary', 'NUMRecord']
			}],
			/*English Begins*/
			identifyTemplate: '<% var displaySector = function (sector) {\
					var str = sector.toString().substring(0, 3);\
					for (var i = 0; i < globalConfigure.sectorNames.length; i++){\
						var arrayName = globalConfigure.sectorNames[i].split(" - ");\
						if(str === arrayName[0]) {\
							return arrayName[1];\
						}\
					}\
					return str;\
				}; %>\
				Facility: <strong><%= attrs.Facility %></strong><br>Organization: <strong><%= attrs.Organisation %></strong><br>\
				Adresse: <strong><%= attrs.StreetAddress %> / <%= attrs.City %></strong><br>N&deg; INRP: <strong><%= parseInt(attrs.NPRI_ID, 10) %></strong><br>\
				Sector: <strong><%= displaySector(attrs.Sector) %></strong><br>Toxic Substances: <strong><%= attrs.NUMsubst %></strong><br><br>\
				<% if (attrs.NUMsubst === 0) {%> No Annual Report submitted. <% } else {%> <a target=\'_blank\' href=\'annual-report?id=<%= attrs.UniqueID %>\'>Links to Annual Reports</a> <% } %><br>\
				<% if (attrs.NUMPlanSummary === 0) {%> No Plan Summary submitted. <% } else {%> <a target=\'_blank\' href=\'plan-summary-report?id=<%= attrs.UniqueID %>\'>Links to Plan Summaries</a> <% } %><br>\
				<% if (attrs.NUMRecord === 0) {%> No Record submitted. <% } else {%> <a target=\'_blank\' href=\'record-report?id=<%= attrs.UniqueID %>\'>Links to Records</a> <% } %><br>\
				<i>These links will open in a new browser window.</i><br>'
			/*English Ends*/
			/*French Begins*/
			identifyTemplate: '<% var displaySector = function (sector) {\
					var str = sector.toString().substring(0, 3);\
					for (var i = 0; i < globalConfigure.sectorNames.length; i++){\
						var arrayName = globalConfigure.sectorNames[i].split(" - ");\
						if(str === arrayName[0]) {\
							return arrayName[1];\
						}\
					}\
					return str;\
				}; %>\
				Installation: <strong><%= attrs.Facility %></strong><br>Entreprise: <strong><%= attrs.Organisation %></strong><br>\
				Physical Address: <strong><%= attrs.StreetAddress %> / <%= attrs.City %></strong><br>NPRI ID: <strong><%= parseInt(attrs.NPRI_ID, 10) %></strong><br>\
				Secteur: <strong><%= displaySector(attrs.Sector) %></strong><br>Substances toxiques: <strong><%= attrs.NUMsubst %></strong><br><br>\
				<% if (attrs.NUMsubst === 0) {%> Aucun rapport annuel pr&eacute;sent&eacute;. <% } else {%> <a target=\'_blank\' href=\'annual-report?id=<%= attrs.UniqueID %>\'>Lien aux rapports annuels</a> <% } %><br>\
				<% if (attrs.NUMPlanSummary === 0) {%> Aucun sommaire de plan pr&eacute;sent&eacute;. <% } else {%> <a target=\'_blank\' href=\'plan-summary-report?id=<%= attrs.UniqueID %>\'>Lien aux sommaires de plan</a> <% } %><br>\
				<% if (attrs.NUMRecord === 0) {%> Aucun document pr&eacute;sent&eacute;. <% } else {%> <a target=\'_blank\' href=\'record-report?id=<%= attrs.UniqueID %>\'>Lien aux documents</a> <% } %><br>\
				<i>En cliquant sur ces liens, vous ouvrirez une nouvelle fen&ecirc;tre dans votre navigateur.</i><br>'
			/*French Ends*/
		},
		infoWindowHeight: '200px',
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
		tableTemplate: '<table id="myTable" class="tablesorter" width="650" border="0" cellpadding="0" cellspacing="1">\
			<thead><tr><th><center>Waterbody</center></th><th><center>Location</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Consumption Advisory Table</center></th></tr></thead><tbody>\
			<% _.each(features, function(feature) {\
				var attrs = feature.attributes; %> \
				<tr><td><%= attrs.LOCNAME_EN %></td><td><%= Util.addBRtoLongText(attrs.GUIDELOC_EN) %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></td><td><a target=\'_blank\' href=\'fish-consumption-report?id=<%= attrs.WATERBODYC  %>\'>Consumption Advisory Table</a></td></tr>\
			<% }); %>\
			</tbody></table>',
		searchChange: function (type) {
			document.getElementById('map_query').value = "";
			if(type === "Substance"){
				$( "#map_query" ).autocomplete({source: substancesNames,
					select: function(e, ui) {
						var queryParams = {
							searchString: ui.item.value
						};	
						if (!globalConfig.accessible) {
							queryParams.withinExtent = document.getElementById(globalConfig.currentMapExtentDivId).checked;
						}
						MOEMAP.clearOverlays();			
						mapConfig.searchSubstances(queryParams);
					},
					disabled: false });
			}else if(type === "Sector"){
				$( "#map_query" ).autocomplete({source: sectorNames,
					select: function(e, ui) {
						var queryParams = {
							searchString: ui.item.value
						};	
						if (!globalConfig.accessible) {
							queryParams.withinExtent = document.getElementById(globalConfig.currentMapExtentDivId).checked;
						}
						MOEMAP.clearOverlays();
						mapConfig.searchSector(queryParams);
					},			
					disabled: false });
			}else{
				$( "#map_query" ).autocomplete({source: [], 
					disabled: true });
			}
		}
	});
	
});
