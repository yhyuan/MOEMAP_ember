/* global _, $, google */
'use strict';
var GoogleMapsAdapter = require('../../scripts/GoogleMapsAdapter');
var Util = require('../../scripts/Util');

window.GoogleMapsAdapter = GoogleMapsAdapter;
GoogleMapsAdapter.init({
	/*English Begins*/
	language: "EN",
	/*English Ends*/
	/**/
	mapServices: [{
		/*url: "http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer",
		visibleLayers: [0, 1, 2]*/
		url: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/wells/MapServer',
		visibleLayers: [0]
	}],
	/*English Begins*/
	otherInfoHTML: "<h2>Find a map error?</h2> 		<p>It is possible you may encounter inaccuracies with map locations.</p> 		<p>If you find an error in the location of a lake, river or stream, please contact us.  Use the <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Error'>Report an error</a> link within the map pop-up.</p> 		<h2>Comments</h2> 		<p>For comments and suggestions, email us at <a href='mailto:sportfish.moe@ontario.ca?subject=Sport Fish Map Feedback'>sportfish.moe@ontario.ca</a>.</p>",
	/*English Ends*/
	/**/
	/*English Begins*/
	report_URL: "fish-consumption-report",
	/*English Ends*/
	/**/	
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>		<label class="element-invisible" for="map_query">Search the map</label>		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>		<label class="element-invisible" for="search_submit">Search</label>		<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>		<fieldset>			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Search Map Location" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(this)"></input>			<span class="tooltip" title="Search Map Location: Enter the name of an Ontario lake/river, city/town/township or street address to find fish consumption advice">			<label class="option" for="searchMapLocation">Search Map Location</label>			</span>			<br/>			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Search Fish Species" name="species" value="species" onclick="GoogleMapsAdapter.searchChange(this)"></input>			<span class="tooltip" title="Search Fish Species: Enter the name of a fish species to find lakes with fish consumption advice for the species">			<label class="option" for="searchFishSpecies">Search Fish Species</label>			</span>			<br/>			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>		</fieldset>		<div id="information"></div>',
	/*English Ends*/
	/**/
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
	//postIdentifyCallbackName: "SportFish",
	//infoWindowWidth: '280px',
	tableSimpleTemplateTitleLang: "",
	/*English Begins*/
	tableFieldList: [
		{name: "Waterbody", value: "{LOCNAME_EN}"}, 
		{name: "Location", value: "{globalConfig.addBRtoLongText(GUIDELOC_EN)}"}, 
		{name: "Latitude", value: "{globalConfig.deciToDegree(LATITUDE)}"}, 
		{name: "Longitude", value: "{globalConfig.deciToDegree(LONGITUDE)}"}, 	
		{name: "Consumption Advisory Table", value: "<a target='_blank' href='" + this.report_URL + "?id={WATERBODYC}'>Consumption Advisory Table</a>"}
	],
	/*English Ends*/
	/**/
	postIdentifyCallbackName: 'ManyFeaturesOneTab',
	Wells_Report_URL: "well-record-information",
	/*English Begins*/
	identifySettings: {
		/* radius: 1, // 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		/*identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
			layerID: 0,
			outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
		}],
		identifyTemplate: '<strong><%= attrs.LOCNAME_EN %></strong><br><%= Util.addBRtoLongText(attrs.GUIDELOC_EN) %><br><br>			<a target=\'_blank\' href=\'<%= globalConfigure.report_URL %>?id=<%= attrs.WATERBODYC %>\'>Consumption Advisory Table</a><br><br>			Latitude <b><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></b> Longitude <b><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></b><br>			<a href=\'mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission <%= attrs.LOCNAME_EN %>)\'>Report an error for this location</a>.<br><br>'*/
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/wells/MapServer',
			layerID: 0,
			outFields: ['BORE_HOLE_ID', 'WELL_ID', 'DEPTH_M', 'YEAR_COMPLETED', 'WELL_COMPLETED_DATE', 'AUDIT_NO', 'TAG_NO', 'CONTRACTOR', 'PATH']
		}],
		identifyTemplate: 'Total features returned: <strong><%= features.length %><strong><br>			<table class=\'tabtable\'><tr><th>Well ID</th><th>Well Tag # (since 2003)</th><th>Audit # (since 1986)</th><th>Contractor Lic#</th><th>Well Depth (m)</th><th>Date of Completion (MM/DD/YYYY)</th><th>Well Record Information</th></tr>			<%  var convertDepthFormat = function (val){if (val === "N/A") {	return "N/A";}	var res = parseFloat(val);	return res.toFixed(1);};				var convertDateFormat = function (str){	if (str === "N/A") {		return "N/A";	}	var strArray = str.split("/");	if(strArray.length == 3){		str = strArray[1] + "/" + strArray[2] + "/" + strArray[0];	}	return str;};				var calculatePDFURL = function(PATH, WELL_ID) {	if((!!PATH) && (PATH.length > 0) && (PATH !== "N/A")) {		return "| <a target=\'_blank\' href=\'http://files.ontario.ca/moe_mapping/downloads/2Water/Wells_pdfs/" + WELL_ID.substring(0,3) + "/" + WELL_ID + ".pdf\'>PDF</a>";	}	return "";};			_.each(features, function(feature) {					var attrs = feature.attributes; %> 				<tr><td><%= Util.processNA(attrs.WELL_ID) %></td><td><%= Util.processNA(attrs.TAG_NO) %></td><td><%= Util.processNA(attrs.AUDIT_NO) %></td><td><%= Util.processNA(attrs.CONTRACTOR) %></td><td><%= convertDepthFormat(attrs.DEPTH_M) %></td><td><%= convertDateFormat(attrs.WELL_COMPLETED_DATE) %></td><td><a target=\'_blank\' href=\'well-record-information?id=<%= attrs.BORE_HOLE_ID %>\'>HTML</a><%= calculatePDFURL(attrs.PATH, attrs.WELL_ID) %></td></tr>			<% }); %>			</tbody></table>'
	},
	/*English Ends*/
	/**/
	queryLayerList: [{
		url: this.url + "/0",
		tabsTemplate: [{
			label: this.InformationLang,
			content:this.tabsTemplateContent
		}], 
		tableSimpleTemplate: {
			title: this.tableSimpleTemplateTitleLang, 
			content: this.tableFieldList
		} 
	}],
	getSearchParams: function(searchString, globalConfigure){
		var getLakeNameSearchCondition = function(searchString) {
			var coorsArray = searchString.split(/\s+/);
			var str = coorsArray.join(" ").toUpperCase();
			str = Util.replaceChar(str, "'", "''");
			str = Util.replaceChar(str, "\u2019", "''");
			/*English Begins*/
			return "UPPER(LOCNAME_EN) LIKE '%" + str + "%'";
			/*English Ends*/
			/**/
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
						/**/
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
						/**/
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
			//infoWindowTemplate: globalConfigure.identifyTemplate,
			/*English Begins*/
			outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
			/*English Ends*/
			/**/
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
	computeValidResultsTable: function(results, globalConfigure) {
		var features = Util.combineFeatures(results);
		var template = '<table id=\"<%= globalConfigure.tableID %>\" class=\"<%= globalConfigure.tableClassName %>\" width=\"<%= globalConfigure.tableWidth %>\" border=\"0\" cellpadding=\"0\" cellspacing=\"1\"><thead>			<tr><th><center>Waterbody</center></th><th><center>Location</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Consumption Advisory Table</center></th></tr></thead><tbody>			<% _.each(features, function(feature) {				var attrs = feature.attributes; %> 				<tr><td><%= attrs.LOCNAME_EN %></td><td><%= Util.addBRtoLongText(attrs.GUIDELOC_EN) %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></td><td><a target=\'_blank\' href=\'<%= globalConfigure.report_URL %>?id=<%= attrs.WATERBODYC  %>\'>Consumption Advisory Table</a></td></tr>			<% }); %>			</tbody></table>';
		return _.template(template, {features: features, globalConfigure: globalConfigure, Util: Util});
	},
	computeInvalidResultsTable: function () {
		return globalConfigure.computeValidResultsTable;
	}, 	
	generateSearchResultsMarkers: function(results, globalConfigure) {
		var features = Util.combineFeatures(results);
		return _.map(features, function(feature) {
			var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
			var container = document.createElement('div');
			container.style.width = globalConfigure.infoWindowWidth;
			container.style.height = globalConfigure.infoWindowHeight;
			container.innerHTML = _.template(globalConfigure.identifySettings.identifyTemplate, {attrs: feature.attributes, globalConfigure: globalConfigure, Util: Util});
			//console.log(container.innerHTML);
			var marker = new google.maps.Marker({
				position: gLatLng
			});		
			(function (container, marker) {
				google.maps.event.addListener(marker, 'click', function () {
					GoogleMapsAdapter.openInfoWindow(marker.getPosition(), container);
				});
			})(container, marker);
			return marker;			
		});
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