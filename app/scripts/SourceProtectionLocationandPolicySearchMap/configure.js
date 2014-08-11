/* global _, $, google */
/*
	Enhancements: 1) Fix a bug. When the clear button is clicked, the table below the map is still there in the existing application. The new version fixed this issue by removing it when the Clear button is clicked. 
	Meanwhile, the message information become empty. The new version change the message information back to help information. 
	2) When the user clicks on the map, it will display the information. 
*/

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
		url: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
		visibleLayers: [0,1,2,3,4,6,7,8,9,10,11,12]
	}],
	extraImageServices: [{
		id: "arcgis",
		name: "ESRI",
		url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
	}],
	/*English Begins*/
	searchControlHTML: '<input id = "map_query" type="text" title="Term" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)" maxlength="100" autocomplete="off"></input>\
		&nbsp;&nbsp;<input type="submit" onclick="GoogleMapsAdapter.search()" value="Search" title="Search"></input>\
		<input type="submit" onclick="GoogleMapsAdapter.clear()" title="Clear" value="&nbsp;Clear&nbsp;"></input>\
		<div id="information">"Search by <STRONG>Address</STRONG>, <STRONG>City Name</STRONG>, <STRONG>Postal Code</STRONG> or see help for more advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<input id = "map_query" type="text" title="Term" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)" maxlength="100" autocomplete="off"></input>\
		&nbsp;&nbsp;<input type="submit" onclick="GoogleMapsAdapter.search()" value="Search" title="Search"></input>\
		<input type="submit" onclick="GoogleMapsAdapter.clear()" title="Clear" value="&nbsp;Clear&nbsp;"></input>\
		<div id="information">"Search by <STRONG>Address</STRONG>, <STRONG>City Name</STRONG>, <STRONG>Postal Code</STRONG> or see help for more advanced options.</div>',
	/*French Ends*/
	postIdentifyCallbackName: 'OneFeatureNoTabPolygon',

	identifySettings: {
		radius: 1, /* 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		requireReverseGeocoding: true,
		identifyLayersList: 	[{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: "Source Protection Area - 2011",
			layerID: 0,
			outFields: ["LABEL", "SPP_ID"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: "Municipal Boundaries - Upper Tier",
			layerID: 1,
			outFields: ["LEGAL_NAME"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: "Municipal Boundaries - Single and Lower Tier",
			layerID: 2,
			outFields: ["LEGAL_NAME"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: "Lots and Concessions",
			layerID: 3,
			outFields: ["LABEL"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Assessment Parcels",
			//mapService: "http://intra.giscoeservices.lrc.gov.on.ca/ArcGIS/rest/services/MNR/GIB_AssessmentParcel/MapServer",
			//layerID: 2,
			//outFields: ["ASSESSMENT_ROLL_NUMBER", "MPAC_STREET_ADDRESS", "MUNICIPALITY_NAME"]
			layerID: 4,
			returnFields: ["ARN", "MPAC_STREET_ADDRESS", "MUNICIPALITY_NAME"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Ownership Parcels",
			layerID: 5,
			outFields: ["PIN"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Issue Contributing Areas",
			layerID: 6,
			returnFields: ["OBJECTID", "IssueContributingGlobalID"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: "Well Head Protection Zones",
			layerID: 7,
			outFields: ["ZoneName"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"WHPA Groundwater Under Direct Influence: WHPA-E)",
			layerID: 8,
			outFields: ["ZoneName"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Intake Protection Zones",
			layerID: 9,
			outFields: ["IPZType"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Vulnerable Scoring Area - Groundwater",
			layerID: 10,
			outFields: ["vsg_vulnerabilityScore", "vsg_whpa_id", "vsg_spp_id"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Vulnerable Scoring Area - Groundwater Under Direct Influence",
			layerID: 11,
			outFields: ["vsu_vulnerabilityScore_GUDI"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Vulnerable Scoring Area - Surface Water",
			layerID: 12,
			outFields: ["vss_vulnerabilityScore", "vss_spp_id", "vss_ipz_id"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Highly Vulnerable Areas",
			layerID: 13,
			outFields: ["IntrinsicVulnerabilityLevel"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Significant Groundwater Recharge Area - SPPID NO BORDERS",
			layerID: 14,
			outFields: ["OBJECTID"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"Niagara Escarpment Area of Development Control",
			layerID: 15,
			outFields: ["OBJECTID"]
		},{
			mapService: 'http://lrcprrvspaap007/ArcGIS/rest/services/Interactive_Map_Internal/SourceProtectionLocationandPolicySearchMap/MapServer',
			name: 	"OakRidgesMorainePlanningArea",
			layerID: 16,
			outFields: ["OBJECTID"]
		}],
		identifyTemplate: function (results, Util, geocodingResult, searchString) {

			console.log(results);
			console.log(geocodingResult);
			/*English Begins*/			
			var infoWindowTemplate = '<% if (results[0].features.length > 0) { %> Source Protection Area Name: <strong><%= _.map(results[0].features, function(feature) {return feature.attributes.LABEL;}).join(", ") %> </strong><br><% } %>\
			MPAC Address: <strong><% if (results[4].features.length > 0 && (results[4].features[0].attributes.ARN)) { %> <%= _.map(results[4].features, function(feature) {return feature.attributes.MPAC_STREET_ADDRESS;}).join(", ") + _.map(results[4].features, function(feature) {return feature.attributes.MUNICIPALITY_NAME;}).join(", ") %> <% } else { %> "N/A" <% } %></strong><br>';

			/*
			var queryTableTemplate = '<table class="lakepartner" border="1">\
				<caption>Search Results</caption>\
				<tbody>\
					<tr><td>Latitude: <strong><%= globalConfig.identifyResults["LatLng"].lat().toFixed(6) %></strong>  Longitude:<strong><%= globalConfig.identifyResults["LatLng"].lng().toFixed(6) %></strong></td>\
						<td>UTM Zone: <strong><%= globalConfig.identifyResults["UTM"].Zone %></strong>   Easting: <strong><%= parseFloat(globalConfig.identifyResults["UTM"].Easting).toFixed(0) %></strong>     Northing: <strong><%= parseFloat(globalConfig.identifyResults["UTM"].Northing).toFixed(0) %></strong></td></tr>\
					<tr><td>Municipal - Upper Tier: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Municipal Boundaries - Upper Tier")) ? globalConfig.concatenateAttributes("Municipal Boundaries - Upper Tier", "LEGAL_NAME") : "N/A" %></strong></td>\
						<td>Municipal - Single and Lower Tier: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Municipal Boundaries - Single and Lower Tier")) ? globalConfig.concatenateAttributes("Municipal Boundaries - Single and Lower Tier", "LEGAL_NAME") : "N/A" %></strong></td></tr>\
					<tr><td>MPAC Street Address: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Assessment Parcels")) ? globalConfig.concatenateAttributes("Assessment Parcels", "MPAC_STREET_ADDRESS") + " " + globalConfig.concatenateAttributes("Assessment Parcels", "MUNICIPALITY_NAME"): "N/A" %></strong></td>\
						<td>Township, Concession and Lot: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Lots and Concessions")) ? globalConfig.concatenateAttributes("Lots and Concessions", "LABEL") : "N/A" %></strong></td></tr>\
					<tr><td>Assessment Roll Number: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Assessment Parcels")) ? globalConfig.concatenateAttributes("Assessment Parcels", "ASSESSMENT_ROLL_NUMBER") : "N/A" %></strong></td>\
						<td>Property Information Number: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Ownership Parcels")) ?  globalConfig.concatenateAttributes("Ownership Parcels", "PIN") : "N/A" %></strong></td></tr>\
					<tr><td colspan = "2">Source Protection Area Name: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Source Protection Area - 2011")) ? globalConfig.concatenateAttributes("Source Protection Area - 2011", "LABEL") : "N/A" %></strong></td>\
						</tr>\
					<tr><td>Wellhead Protection Area (WHPA): <strong><%= (globalConfig.identifyResults.hasOwnProperty("Well Head Protection Zones")) ? globalConfig.concatenateAttributes("Well Head Protection Zones", "ZoneName") : "No" %></strong></td>\
						<td>Groundwater Vulnerability Score: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Vulnerable Scoring Area - Groundwater")) ? globalConfig.concatenateAttributes("Vulnerable Scoring Area - Groundwater", "vsg_vulnerabilityScore") : "N/A" %></strong></td></tr>\
					<%= (globalConfig.identifyResults.hasOwnProperty("Vulnerable Scoring Area - Groundwater")) ? "<tr><td colspan = \'2\'>" + _.map(globalConfig.identifyResults["Vulnerable Scoring Area - Groundwater"],   function(feature) {return "<a target=\'_blank\' href=\'http://maps.thamesriver.on.ca/swpPolicyEntry/parseLink/parse.aspx?zone=" + feature.attributes["vsg_whpa_id"]+ "&score=" + feature.attributes["vsg_vulnerabilityScore"] + "&sppid=" + feature.attributes["vsg_spp_id"] + "\'>Groundwater Policies – Score " + feature.attributes["vsg_vulnerabilityScore"] + " (link to external site)</a>";}).join("<br>")  + "<br></td></tr>": "" %>\
					<tr><td>Intake Protection Zone 1 or 2: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Intake Protection Zones")) ? globalConfig.concatenateAttributes("Intake Protection Zones", "IPZType") : "No" %></strong></td>\
						<td>Surface Water Vulnerability Score (if &ge; 8) : <strong><%= (globalConfig.identifyResults.hasOwnProperty("Vulnerable Scoring Area - Surface Water")) ? globalConfig.concatenateAttributes("Vulnerable Scoring Area - Surface Water", "vss_vulnerabilityScore") : "N/A" %></strong></td></tr>\
					<%= (globalConfig.identifyResults.hasOwnProperty("Vulnerable Scoring Area - Surface Water")) ? "<tr><td colspan = \'2\'>" + _.map(globalConfig.identifyResults["Vulnerable Scoring Area - Surface Water"], function(feature) {return "<a target=\'_blank\' href=\'http://maps.thamesriver.on.ca/swpPolicyEntry/parseLink/parse.aspx?zone=" + feature.attributes["vss_ipz_id"] + "&score=" + feature.attributes["vss_vulnerabilityScore"] + "&sppid=" + feature.attributes["vss_spp_id"] + "&source=sw\'>Surface Water Policies – Score " + feature.attributes["vss_vulnerabilityScore"] + " (link to external site)</a>";}).join("<br>") + "<br></td></tr>": "" %>\
					<tr><td>WHPA – Groundwater Under Direct Influence (GUDI): <strong><%= (globalConfig.identifyResults.hasOwnProperty("WHPA Groundwater Under Direct Influence: WHPA-E)")) ? globalConfig.concatenateAttributes("WHPA Groundwater Under Direct Influence: WHPA-E)", "ZoneName") : "No" %></strong></td>\
						<td>GUDI Vulnerability Score: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Vulnerable Scoring Area - Groundwater Under Direct Influence")) ? globalConfig.concatenateAttributes("Vulnerable Scoring Area - Groundwater Under Direct Influence", "vsu_vulnerabilityScore_GUDI") : "N/A" %></strong></td></tr>\
					<tr><td>Significant Groundwater Recharge Area: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Significant Groundwater Recharge Area - SPPID NO BORDERS")) ? "Yes" : "No" %></strong></td>\
						<td>Highly Vulnerable Aquifer: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Highly Vulnerable Areas")) ? globalConfig.concatenateAttributes("Highly Vulnerable Areas", "IntrinsicVulnerabilityLevel") : "N/A" %></strong></td></tr>\
					<tr><td>Issue Contributing areas (ICA): <strong><%= (globalConfig.identifyResults.hasOwnProperty("Issue Contributing Areas")) ? "Yes" : "No" %></strong></td>\
						<td>ICA Issues: <strong><%= (globalConfig.identifyResults.hasOwnProperty("ICA_ISSUES")) ? globalConfig.identifyResults["ICA_ISSUES"] : "N/A" %></strong></td></tr>\
					<tr><td>Niagara Escarpment Development Control Area: <strong><%= (globalConfig.identifyResults.hasOwnProperty("Niagara Escarpment Area of Development Control")) ? "Yes" : "No" %></strong></td>\
						<td>Oak Ridges Moraine Planning Area: <strong><%= (globalConfig.identifyResults.hasOwnProperty("OakRidgesMorainePlanningArea")) ? "Yes" : "No" %></strong></td></tr>\
				</tbody>\
			</table>';*/
		/*English Ends*/
		/*French Begins*/

		/*French Ends*/
			return {
				infoWindow: _.template(infoWindowTemplate, {results: results, Util: Util, geocodingResult: geocodingResult}),
				table: ''//_.template(queryTableTemplate, {results: results, Util: Util, geocodingResult: geocodingResult})
			}; 
		}
	},	
	preSearchCallbackName: 'OneFeatureNoTabPolygon',
	searchCallbackName: 'OneFeatureNoTabPolygon',
	postSearchCallbackName: 'OneFeatureNoTabPolygon',
	generateMessage: function (results, geocodingResult, searchString) {
		var address = geocodingResult.address;
		if (!!results && !!results[0].features && results[0].features.length === 0) {
			/*English Begins*/
			return '<strong>' + address + '</strong> located within <strong>No MOECC District found.</strong>';
			/*English Ends*/
			/*French Begins*/
			return '<strong>' + address + '</strong> est dans le <strong>Le système n’a pas trouvé de district du MEACC.</strong>';
			/*French Ends*/
		}
		var district = results[0].features[0].attributes.MOE_DISTRICT;
		/*English Begins*/
		return '<strong>' + address + '</strong> located within <strong>' + district + ' MOECC District.</strong>';
		/*English Ends*/
		/*French Begins*/
		return '<strong>' + address + '</strong> est dans le <strong>District de ' + district + ' du MEACC.</strong>';
		/*French Ends*/		
	},
	searchZoomLevel: 12
});
