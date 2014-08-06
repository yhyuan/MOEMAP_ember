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
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Search" title="Search" />\
		<label class="element-invisible" for="search_clear">Clear</label>\
		<input type="submit" value="&nbsp;Clear&nbsp;" id="search_clear" title="Clear" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information"></div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" onkeypress="return GoogleMapsAdapter.entsub(event)" size="50" />\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input type="submit" onclick="GoogleMapsAdapter.search()" id="search_submit" value="Recherche" title="Recherche" />\
		<label class="element-invisible" for="search_clear">Effacer</label>\
		<input type="submit" value="&nbsp;Effacer&nbsp;" id="search_clear" title="Effacer" onclick="GoogleMapsAdapter.clear()" />\
		<div id="information"></div>';
	/*French Ends*/
	postIdentifyCallbackName: 'OneFeatureNoTabPolygon',

	identifySettings: {
		radius: 1, /* 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		requireReverseGeocoding: true,
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/MOE_Districts_Full_Bnd/MapServer',
			layerID: 0,
			outFields: ["OBJECTID","MOE_DISTRICT","STREET_NAME","CITY","POSTALCODE","PHONENUMBER","TOLLFREENUMBER","FAXNUMBER","MOE_DISTRICT_NAME"]
		}],
		/*English Begins*/		
		identifyTemplate: {
			infoWindow: '<% var featuresLength = Util.computeFeaturesNumber (results);\
				if (featuresLength === 0) {%>\
					<i> <%= geocodingResult.address %>.</i><br><br><strong>Result located within</strong><br><h3> No MOE District found</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= geocodingResult.address %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOE District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br><%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>',
			table: '<% var featuresLength = Util.computeFeaturesNumber (results);\
				if (featuresLength === 0) {%>\
					<i> <%= geocodingResult.address %>.</i><br><br><strong>Result located within</strong><br><h3> No MOE District found</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= geocodingResult.address %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOE District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br><%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>'
		}
		/*English Ends*/
		/*French Begins*/
		identifyTemplate: {
			infoWindow: '<% var featuresLength = Util.computeFeaturesNumber (results);\
				if (featuresLength === 0) {%>\
					<i> <%= geocodingResult.address %>.</i><br><br><strong>Result located within</strong><br><h3> No MOE District found</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= geocodingResult.address %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOE District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br><%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>',
			table: '<% var featuresLength = Util.computeFeaturesNumber (results);\
				if (featuresLength === 0) {%>\
					<i> <%= geocodingResult.address %>.</i><br><br><strong>Result located within</strong><br><h3> No MOE District found</h3>\
				<%} else { var attrs = results[0].features[0].attributes;%>\
					<i><%= geocodingResult.address %></i><br><br><strong>Result located within</strong><br><h3><%= attrs.MOE_DISTRICT %> MOE District</h3><br>Office Address: <br><%= attrs.STREET_NAME %><br><%= attrs.CITY %> <%= attrs.POSTALCODE %><br>Toll Free: <%= attrs.TOLLFREENUMBER %><br>Tel: <%= attrs.PHONENUMBER %> Fax: <%= attrs.FAXNUMBER %>\
				<% } %>'
		}
		/*French Ends*/			
	},	
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
	/*French Begins*/
	tableFieldList: [
		{name: "Plan d'eau", value: "{LOCNAME_FR}"}, 
		{name: "Lieu", value: "{globalConfig.addBRtoLongText(GUIDELOC_FR)}"}, 
		{name: "Latitude", value: "{globalConfig.deciToDegree(LATITUDE)}"}, 
		{name: "Longitude", value: "{globalConfig.deciToDegree(LONGITUDE)}"}, 	
		{name: "Tableau des mises en garde en mati\u00e8re de consommation", value: "<a target='_blank' href='" + this.report_URL + "?id={WATERBODYC}'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a>"}
	],
	/*French Ends*/
	

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
			//infoWindowTemplate: globalConfigure.identifyTemplate,
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
	computeValidResultsTable: function(results, globalConfigure) {
		var features = Util.combineFeatures(results);
		var template = '<table id=\"<%= globalConfigure.tableID %>\" class=\"<%= globalConfigure.tableClassName %>\" width=\"<%= globalConfigure.tableWidth %>\" border=\"0\" cellpadding=\"0\" cellspacing=\"1\"><thead>\
			<tr><th><center>Waterbody</center></th><th><center>Location</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Consumption Advisory Table</center></th></tr></thead><tbody>\
			<% _.each(features, function(feature) {\
				var attrs = feature.attributes; %> \
				<tr><td><%= attrs.LOCNAME_EN %></td><td><%= Util.addBRtoLongText(attrs.GUIDELOC_EN) %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></td><td><a target=\'_blank\' href=\'<%= globalConfigure.report_URL %>?id=<%= attrs.WATERBODYC  %>\'>Consumption Advisory Table</a></td></tr>\
			<% }); %>\
			</tbody></table>';
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



