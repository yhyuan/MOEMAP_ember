/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../scripts/GoogleMapsAdapter');
GoogleMapsAdapter.init({
	/*English Begins*/
	globalConfig.language: "EN",
	/*English Ends*/
	/*French Begins*/
	globalConfig.language: "FR",
	/*French Ends*/
	url: "http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer",
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
	report_URL: "fish-consumption-report",
	/*English Ends*/
	/*French Begins*/
	report_URL: "rapport-de-consommation-de-poisson",
	/*French Ends*/	
	/*English Begins*/
	tabsTemplateContent: "<strong>{LOCNAME_EN}</strong><br>{globalConfig.addBRtoLongText(GUIDELOC_EN)}<br><br><a target='_blank' href='" + globalConfig.report_URL + "?id={WATERBODYC}'>Consumption Advisory Table</a><br><br>Latitude <b>{globalConfig.deciToDegree(LATITUDE)}</b> Longitude <b>{globalConfig.deciToDegree(LONGITUDE)}</b><br><a href='mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission {LOCNAME_EN})'>Report an error for this location</a>.<br><br>"
	/*English Ends*/
	/*French Begins*/
	tabsTemplateContent: "<strong>{LOCNAME_FR}</strong><br>{globalConfig.addBRtoLongText(GUIDELOC_FR)}<br><br><a target='_blank' href='" + globalConfig.report_URL + "?id={WATERBODYC}'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a><br><br>Latitude <b>{globalConfig.deciToDegree(LATITUDE)}</b> Longitude <b>{globalConfig.deciToDegree(LONGITUDE)}</b><br><a href='mailto:sportfish.moe@ontario.ca?subject=Erreur de portail (Submission {LOCNAME_FR})'>Signalez un probl\u00e8me pour ce lieu</a>.<br><br>"
	/*French Ends*/	
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return globalConfig.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input id="search_submit" type="submit" title="Search" onclick="globalConfig.search()" value="Search"></input>\
		<fieldset>\
			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Search Map Location" name="location" value="location" onclick="globalConfig.searchChange(this)"></input>\
			<span class="tooltip" title="Search Map Location: Enter the name of an Ontario lake/river, city/town/township or street address to find fish consumption advice">\
			<label class="option" for="searchMapLocation">Search Map Location</label>\
			</span>\
			<br/>\
			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Search Fish Species" name="species" value="species" onclick="globalConfig.searchChange(this)"></input>\
			<span class="tooltip" title="Search Fish Species: Enter the name of a fish species to find lakes with fish consumption advice for the species">\
			<label class="option" for="searchFishSpecies">Search Fish Species</label>\
			</span>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
		</fieldset>\
		<div id="information"></div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return globalConfig.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input id="search_submit" type="submit" title="Recherche" onclick="globalConfig.search()" value="Recherche"></input>\
		<fieldset>\
			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Recherche d\'emplacements" name="location" value="location" onclick="globalConfig.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'emplacements : Indiquer le lieu en Ontario (lac/rivi\u00e8re, ville/canton, adresse) pour avoir des conseils sur la consommation des poissons du lieu.">\
			<label class="option" for="searchMapLocation">Recherche d\'emplacements</label>\
			</span>\
			<br/>\
			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Recherche d\'esp\u00e8ces" name="species" value="species" onclick="globalConfig.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'esp\u00e8ces : Indiquer une esp\u00e8ce de poisson pour trouver des lacs sur lesquels existent des conseils sur la consommation de l\'esp\u00e8ce.">\
			<label class="option" for="searchFishSpecies">Recherche d\'esp\u00e8ces</label>\
			</span>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
		</fieldset>\
		<div id="information"></div>',
	/*French Ends*/
	pointBufferTool: {available: false},
	extraImageService: {visible: false},
	usejQueryUITable: true,  //Avoid loading extra javascript files
	usePredefinedMultipleTabs: false, //Avoid loading extra javascript files
	allowMultipleIdentifyResult: false,
	displayTotalIdentifyCount: false,
	locationServicesList: [],
	maxQueryZoomLevel: 11,
	displayDisclaimer: true,
	InformationLang: "Information",
	postIdentifyCallbackName: "SportFish",
	infoWindowWidth: '280px',
	tableSimpleTemplateTitleLang = "",
	tableFieldList: [
		{name: globalConfig.chooseLang("Waterbody", "Plan d'eau"), value: "{LOCNAME_" + globalConfig.chooseLang("EN", "FR") + "}"}, 
		{name: globalConfig.chooseLang("Location", "Lieu"), value: "{globalConfig.addBRtoLongText(GUIDELOC_" + globalConfig.chooseLang("EN", "FR") + ")}"}, 
		{name: "Latitude", value: "{globalConfig.deciToDegree(LATITUDE)}"}, 
		{name: "Longitude", value: "{globalConfig.deciToDegree(LONGITUDE)}"}, 	
		{name: globalConfig.chooseLang("Consumption Advisory Table", "Tableau des mises en garde en mati\u00e8re de consommation"), value: "<a target='_blank' href='" + globalConfig.report_URL + "?id={WATERBODYC}'>" + globalConfig.chooseLang("Consumption Advisory Table", "Tableau des mises en garde en mati\u00e8re de<br> consommation") + "</a>"}
	],
	queryLayerList: [{
		url: globalConfig.url + "/0",
		tabsTemplate: [{
			label: globalConfig.InformationLang,
			content:globalConfig.tabsTemplateContent
		}], 
		tableSimpleTemplate: {
			title: globalConfig.tableSimpleTemplateTitleLang, 
			content: globalConfig.tableFieldList
		} 
	}],
	search: function(){
		var searchString = document.getElementById(globalConfig.searchInputBoxDivId).value.trim();
		if(searchString.length === 0){
			return;
		}
		MOEMAP.clearOverlays();
		var withinExtent = document.getElementById(globalConfig.currentMapExtentDivId).checked;
		var queryParams = {
			searchString: searchString,
			withinExtent: withinExtent
		};	
		if(document.getElementById('searchMapLocation').checked){
			var coorsArray = searchString.split(/\s+/);
			var str = coorsArray.join(" ").toUpperCase();
			str = globalConfig.replaceChar(str, "'", "''");
			str = globalConfig.replaceChar(str, "\u2019", "''");
			queryParams.where = "UPPER(LOCNAME_" + globalConfig.language + ") LIKE '%" + str + "%'";
			queryParams.requireGeocode = true;
			queryParams.address = searchString;
		}else{
			var getQueryCondition = function(name){
				var str = name.toUpperCase();
				str = globalConfig.replaceChar(str, '&', ', ');
				str = globalConfig.replaceChar(str, ' AND ', ', '); 
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
					var fish = globalConfig.wordCapitalize(globalConfig.replaceChar(fishname, '_', ' '));
					if (typeof(alias) === "undefined"){
						var result = {
							condition: "(SPECIES_" + globalConfig.language + " like '%" + fishname +"%')",
							information: fish
						};
						return result;
					}else{
						var res = [];
						var fishArray = [];
						for (var i = 0; i < alias.length; i++){
							res.push("(SPECIES_" + globalConfig.language + " like '%" + alias[i] +"%')");				
							var str = globalConfig.wordCapitalize(globalConfig.replaceChar(alias[i], '_', ' '));
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
			var temp = getQueryCondition(searchString);
			queryParams.where = temp.condition;
			queryParams.requireGeocode = false;
		}	
		MOEMAP.queryLayersWithConditionsExtent(queryParams);	
	},
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



