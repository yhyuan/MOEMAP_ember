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
		url: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PGMN/MapServer',
		visibleLayers: [0, 1]
	}],
	/*English Begins*/
	otherInfoHTML: '<p>Some scientific/monitoring data is only provided in English.</p>',
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: '<p>Certaines donn&eacute;es scientifiques et de surveillance n&rsquo;existent qu&rsquo;en anglais.</p>',
	/*French Ends*/
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Search the map</label>\
			<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Search</label>\
			<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
			<div id="information">You may search by <strong>PGMN well ID</strong>, <strong>well depth</strong>, <strong>address</strong> or see help for advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
			<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Recherche</label>\
			<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
			<div id="information">Vous pouvez rechercher par <strong>num\u00e9ro du puits du r\u00e9seau</strong>, <strong>profondeur du puits</strong>, <strong>adresse</strong> ou consulter l\'aide pour de l\'information sur les recherches avancées.</div>',
	/*French Ends*/
	postIdentifyCallbackName: 'OneFeatureManyTabs',
	infoWindowWidth: '470px',
	infoWindowHeight: '400px',
	infoWindowContentHeight: '330px',
	infoWindowContentWidth: '450px',
	identifySettings: {
		/* radius: 1, // 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PGMN/MapServer',
			layerID: 0,
			outFields: ['PGMN_WELL', 'CONS_AUTHO', 'COUNTY', 'TOWNSHIP', 'CONCESSION', 'LOT', 'SiteID', 'LATITUDE', 'LONGITUDE', 'ELVA_GROUN', 'WELL_DEPTH', 'AQUIFER_TY', 'AQUIFER_LI', 'STRATIGRAP', 'STRATI_DES', 'NO_RECORD', 'WEL_PIEZOM', 'SCREEN_HOL', 'Level_Avai', 'Chem_Avai', 'Prep_Avai', 'CHEM_CONTE']
		},{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PGMN/MapServer',
			layerID: 1,
			outFields: ['PGMN_WELL', 'CONS_AUTHO', 'COUNTY', 'TOWNSHIP', 'CONCESSION', 'LOT', 'SiteID', 'LATITUDE', 'LONGITUDE', 'ELVA_GROUN', 'WELL_DEPTH', 'AQUIFER_TY', 'AQUIFER_LI', 'STRATIGRAP', 'STRATI_DES', 'NO_RECORD', 'WEL_PIEZOM', 'SCREEN_HOL', 'Level_Avai', 'Chem_Avai', 'Prep_Avai', 'CHEM_CONTE']
		}],
		/*English Begins*/
		identifyTemplate: [{
			label: 'Well',
			content:'PGMN Well ID: <strong><%= attrs.PGMN_WELL %></strong><br>Conservation Authority: <strong><%= attrs.CONS_AUTHO %></strong><br>\
				County: <strong><%= Util.wordCapitalize(attrs.COUNTY) %></strong><br>\
				Township: <strong><%= Util.wordCapitalize(attrs.TOWNSHIP) %></strong>, <strong><%= attrs.CONCESSION %></strong>, <strong><%= attrs.LOT %></strong><br>\
				Site ID: <strong><%= attrs.SiteID %></strong><br>\
				Latitude <strong><%= Util.deciToDegree(attrs.LATITUDE) %></strong>&nbsp;&nbsp;&nbsp;Longitude <strong><%= Util.deciToDegree(attrs.LONGITUDE) %></strong><br>\
				<BR>Ground Elevation (m.a.s.l.):<strong><%= attrs.ELVA_GROUN %></strong> meters<br>\
				Well Depth (meters below ground): <strong><%= attrs.WELL_DEPTH %></strong><br>\
				Aquifer Type: <strong><%= attrs.AQUIFER_TY %></strong><br>Lithology of Aquifer: <strong><%= attrs.AQUIFER_LI %></strong><br>\
				Water Well Record Number (WWR): <strong><%= attrs.STRATIGRAP %></strong><br>\
				Stratigraphy Description from reports or notes: <strong><%= attrs.STRATI_DES %></strong><br>\
				WWR for wells near to the PGMN well: <strong><%= attrs.NO_RECORD %></strong><br>\
				Diameter of Well or Piezometer: <strong><%= attrs.WEL_PIEZOM %></strong> cm<br>\
				Screen Interval or Open Hole Interval (meters below ground): <strong><%= attrs.SCREEN_HOL %></strong>',
		},{
			label: '<%= (attrs.Level_Avai > 0) ? "Water Level" : "" %>',
			content:'<img height=300 width=400 src=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/png/EN/<%= attrs.PGMN_WELL %>.png\'/><br>\
			<a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/csv/<%= attrs.PGMN_WELL %>.zip\'>Water Level Data (zipped CSV)</a>',
		},{
			label: '<%= (attrs.Chem_Avai > 0) ? "Chemistry" : "" %>',
			content:'Each PGMN well is initially sampled and chemically analyzed at the Ministry of Environment laboratory for a comprehensive set of chemical parameters including: \
			general chemistry, metals, major ions, a suite of volatile organic compounds, and a suite of pesticides and herbicides. Bacteria are not monitored under the PGMN program. \
			Approximately 380 of the PGMN wells have been selected for long-term annual water chemistry monitoring. The long-term monitoring parameters include: general chemistry, metals, \
			and major ions. Samples are collected from the wells in the Fall season and chemically analyzed at either the Ministry laboratory or a number of private laboratories.<br><br>\
			Water samples have been collected from this well on <%= globalConfigure.getTable(attrs.CHEM_CONTE) %>. <br><br>By clicking on the Water Chemistry Report link below, you can view the list of \
			chemical parameters, the chemical results and chemical parameter graphs for this well.<br><br><a target=\'_blank\' href=\'water-chemistry-report?id=<%= attrs.PGMN_WELL %>\'>\
			Water Chemistry Report</a>',
		},{
			label: '<%= (attrs.Prep_Avai > 0) ? "Precipitation" : "" %>',
			content:'<img height=300 width=400 src=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/png/EN/<%= attrs.Site_ID %>.png\'/><br>\
			<a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/csv/<%= attrs.Site_ID %>.csv\'>Precipitation Data (CSV)</a>',
		}]
		/*English Ends*/
		/*French Begins*/
		identifyTemplate: [{
			label: 'Puits',
			content:'Num\u00e9ro du puits du r\u00e9seau: <strong><%= attrs.PGMN_WELL %></strong><br>Office de protection de la nature: <strong><%= attrs.CONS_AUTHO %></strong><br>\
				Comt\u00e9: <strong><%= Util.wordCapitalize(attrs.COUNTY) %></strong><br>\
				Canton: <strong><%= Util.wordCapitalize(attrs.TOWNSHIP) %></strong>, <strong><%= attrs.CONCESSION %></strong>, <strong><%= attrs.LOT %></strong><br>\
				Num\u00e9ro du site: <strong><%= attrs.SiteID %></strong><br>\
				Latitude <strong><%= Util.deciToDegree(attrs.LATITUDE) %></strong>&nbsp;&nbsp;&nbsp;Longitude <strong><%= Util.deciToDegree(attrs.LONGITUDE) %></strong><br>\
				<BR>Altitude (a.n.m.):<strong><%= attrs.ELVA_GROUN %></strong> m\u00e8tres<br>\
				Profondeur du puits (m\u00e8tres sous le sol): <strong><%= attrs.WELL_DEPTH %></strong><br>\
				Type d\'aquif\u00e8re: <strong><%= attrs.AQUIFER_TY %></strong><br>Lithologie de l\'aquif\u00e8re: <strong><%= attrs.AQUIFER_LI %></strong><br>\
				Num\u00e9ro du registre de puits d\'eau (NRPE): <strong><%= attrs.STRATIGRAP %></strong><br>\
				Description stratigraphique des rapports ou notes: <strong><%= attrs.STRATI_DES %></strong><br>\
				NRPE des puits situ\u00e9s pr\u00e8s d\'un puits du r\u00e9seau: <strong><%= attrs.NO_RECORD %></strong><br>\
				Diam\u00e8tre du puits ou pi\u00e9zom\u00e8tre: <strong><%= attrs.WEL_PIEZOM %></strong> cm<br>\
				Intervalle d\'\u00e9cran ou intervalle \u00e0 trou ouvert (m\u00e8tres sous terre): <strong><%= attrs.SCREEN_HOL %></strong>',
		},{
			label: '<%= (attrs.Level_Avai > 0) ? "Water Level" : "" %>',
			content:'<img height=300 width=400 src=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/png/FR/<%= attrs.PGMN_WELL %>.png\'/><br>\
			<a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/csv/<%= attrs.PGMN_WELL %>.zip\'>Donn\u00e9es sur le niveau d\'eau (Fichier compress&eacute; CSV)</a>',
		},{
			label: '<%= (attrs.Chem_Avai > 0) ? "Chemistry" : "" %>',
			content:'Le minist\u00e8re de l\'Environnement effectue en laboratoire une analyse chimique de l\'eau de chaque puits du r\u00e9seau, notamment les param\u00e8tres chimiques g\u00e9n\u00e9raux, \
			les m\u00e9taux, les ions majeurs, les compos\u00e9s organiques volatils et divers pesticides et herbicides. Le programme ne surveille pas les bact\u00e9ries. Environ 380 des puits du r\u00e9seau\
			ont \u00e9t\u00e9 d\u00e9sign\u00e9s comme devant faire l\'objet d\'une surveillance chimique de l\'eau \u00e0 long terme. Les param\u00e8tres de surveillance \u00e0 long terme sont les suivants : \
			param\u00e8tres chimiques g\u00e9n\u00e9raux, m\u00e9taux, ions majeurs. Des \u00e9chantillons sont pr\u00e9lev\u00e9s \u00e0 l\'automne, puis analys\u00e9s soit dans un laboratoire du minist\u00e8re, \
			soit dans un laboratoire priv\u00e9.<br><br>Des \u00e9chantillons d\'eau ont \u00e9t\u00e9 pr\u00e9lev\u00e9s dans ce puits les dates suivantes: <%= globalConfigure.getTable(attrs.CHEM_CONTE) %>. <br><br>\
			En cliquant sur le rapport des donn\u00e9es chimiques de l\'eau ci-dessous, on peut voir la liste des param\u00e8tres chimiques, les r\u00e9sultats d\'analyse chimique et les diagrammes des param\u00e8tres \
			chimiques de ce puits.<br><br><a target=\'_blank\' href=\'le-rapport-des-donnees-chimiques-de-leau?id=<%= attrs.PGMN_WELL %>\'>Rapport des donn\u00e9es chimiques de l\'eau</a>',
		},{
			label: '<%= (attrs.Prep_Avai > 0) ? "Precipitation" : "" %>',
			content:'<img height=300 width=400 src=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/png/FR/<%= attrs.Site_ID %>.png\'/><br>\
			<a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/csv/<%= attrs.Site_ID %>.csv\'>Donn\u00e9es sur les pr\u00e9cipitations (CSV)</a>',
		}]
		/*French Ends*/
	},
	getTable: function (data){
		var strArray = data.split(",");
		var result = "";
		var andStr = "and";
		if(this.language == "FR"){
			andStr = "et";
		}
		if(strArray.length == 1){				
			result = data;
		}else if(strArray.length == 2){
			result = strArray[0] + " " + andStr + " " + strArray[1];
		}else{
			for(var i=0;i<strArray.length-1;i++){
				result = result + strArray[i] + ", ";
			}
			result = result + andStr + " " + strArray[strArray.length-1];
		}
		return result;
	},
	getSearchParams: function(searchString){
		var createPGMNWellIDQuery = function (name){
			var reg = /^\d+$/;
			//W0000119-2		
			if(name.length == 10){		
				var firstLetter = name.substring(0,1);
				var middleNumber = name.substring(1, 8);
				var lastLetter = name.substring(9);
				var secondLastLetter = name.substring(8, 9);
				if(firstLetter === "W" && reg.test(middleNumber) && reg.test(lastLetter) &&(secondLastLetter === "-")){
					return "PGMN_WELL = '" + name + "'";
				}			
			}
			//W0000119
			if(name.length == 8){		
				var firstLetter = name.substring(0,1);
				var middleNumber = name.substring(1, 8);
				if(firstLetter === "W" && reg.test(middleNumber)){
					return "PGMN_WELL LIKE '" +  name + "-_'";
				}			
			}
			//119-1, 2-1, 18-2
			if((name.length <= 5)&&(name.indexOf("-") > 0)){		
				var middleNumber = name.substring(0, name.length-2);
				var lastLetter = name.substring(name.length-1);
				var secondLastLetter = name.substring(name.length-2, name.length-1);			
				if(reg.test(middleNumber) && reg.test(lastLetter) &&(secondLastLetter === "-")){
					if( name.length === 5){
						return "PGMN_WELL = 'W0000" + name + "'";
					}
					if( name.length === 4){
						return "PGMN_WELL = 'W00000" + name + "'";
					}
					if( name.length === 3){
						return "PGMN_WELL = 'W000000" + name + "'";
					}
					if( name.length < 3){
						return "";
					}				
				}			
			}
			//119, 2, 18
			if(name.length <= 3){		
				if(reg.test(name)){
					if( name.length === 3){
						return "PGMN_WELL LIKE 'W0000" + name + "-_'";
					}
					if( name.length === 2){
						return "PGMN_WELL LIKE 'W00000" + name + "-_'";
					}
					if( name.length === 1){
						return "PGMN_WELL LIKE 'W000000" + name + "-_'";
					}
				}			
			}		
			return "";
		};
		var isAquiferTypeSearch = function (name){
			if(name === "BEDROCK" || name === "OVERBURDEN" || name === "INTERFACE"){
				return true;
			}else{
				return false;
			}			
		};
		var isWellDepthSearch = function(name){
			var coorsArray = name.split(/\s+/);
			if (coorsArray.length != 2) {
				return false;
			}
			if((coorsArray[1] != "M")&&(coorsArray[1] != "METER")&&(coorsArray[1] != "METRE")&&(coorsArray[1] != "METERS")&&(coorsArray[1] != "METRES")){
				return false;
			}
			var reg = /^(-?\d+)(\.\d+)?$/;
			if(!reg.test(coorsArray[0])){
				return false;
			}
			return true;
		};
		var isFromAndTo = function(name){
			var str = name;
			if ((str.indexOf("FROM ") == 0)&&(str.split(" TO ").length == 2)){
				return 1;
			}
			if ((str.indexOf("DU ") == 0)&&(str.split(" AU ").length == 2)){
				return 2;
			}
			if ((str.indexOf("DE ") == 0)&&(str.split(" A ").length == 2)){
				return 3;
			}
		};

		var options = {
			searchString: searchString,
			geocodeWhenQueryFail: false,
			withinExtent: $('#currentMapExtent')[0].checked
		};

		var where = '';
		var queryString = createPGMNWellIDQuery(searchString.toUpperCase());
		if(queryString !== ''){
			where = queryString;
		} else if (isAquiferTypeSearch(searchString.toUpperCase())) {
			where = "AQUIFER_TY = '" + searchString.toUpperCase() +  "'";
		} else if (isWellDepthSearch (searchString.toUpperCase())) {
			var coorsArray = searchString.toUpperCase().split(/\s+/);
			var depth = parseFloat(coorsArray[0]);
			where = "((WELL_DEPTH > " + (depth-0.1) +  ") AND (WELL_DEPTH < " +  (depth+0.1) + "))";
		} else if (isFromAndTo(name)>0) {
			var strArray = name.substring(5).split(" TO ");
			if(isFromAndTo(name) == 2){
				strArray = name.substring(3).split(" AU ");
			}
			if(isFromAndTo(name) == 3){
				strArray = name.substring(3).split(" A ");
			}
			var isFromAndToDepth = function(strArray){
				var maxArray = (strArray[1]).split(/\s+/);
				if(maxArray.length == 2){
					if((maxArray[1] == "M")||(maxArray[1] == "METER")||(maxArray[1] == "METRE")||(maxArray[1] == "METERS")||(maxArray[1] == "METRES")){
						var minDepth = strArray[0];
						var maxDepth = maxArray[0];
						var reg = /^(-?\d+)(\.\d+)?$/;
						if(reg.test(minDepth)&&reg.test(maxDepth)){
							var minDep = parseFloat(minDepth);
							var maxDep = parseFloat(maxDepth);
							if((maxDep > minDep)&&(maxDep < 999999)){
								return true;
							}
						}
					}
				}		
				return false;
			};		
			if (isFromAndToDepth(strArray)) {
				var minDepth = (strArray[0]).split(/\s+/)[0];
				var maxDepth = (strArray[1]).split(/\s+/)[0];
				//queryParams.requireGeocode = false;
				where = "((WELL_DEPTH >= " + minDepth +  ") AND (WELL_DEPTH <= " +  maxDepth + "))";
			} /*else{
				queryParams.totalCount = 0;
				globalConfig.resultFoundSimple(queryParams);
			}*/
		}else{
			var coorsArray = name.split(/\s+/);
			var str = coorsArray.join(" ").toUpperCase();
			where = "UPPER(CONS_AUTHO) LIKE '%" + str + "%'";
			options.geocodeWhenQueryFail = true;
		}	
	
		var queryParamsList = [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PGMN/MapServer',
			layerID: 0,
			returnGeometry: true,
			where: where,
			outFields: ['PGMN_WELL', 'CONS_AUTHO', 'COUNTY', 'TOWNSHIP', 'CONCESSION', 'LOT', 'SiteID', 'LATITUDE', 'LONGITUDE', 'ELVA_GROUN', 'WELL_DEPTH', 'AQUIFER_TY', 'AQUIFER_LI', 'STRATIGRAP', 'STRATI_DES', 'NO_RECORD', 'WEL_PIEZOM', 'SCREEN_HOL', 'Level_Avai', 'Chem_Avai', 'Prep_Avai', 'CHEM_CONTE']
		},{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PGMN/MapServer',
			layerID: 1,
			returnGeometry: true,
			where: where,
			outFields: ['PGMN_WELL', 'CONS_AUTHO', 'COUNTY', 'TOWNSHIP', 'CONCESSION', 'LOT', 'SiteID', 'LATITUDE', 'LONGITUDE', 'ELVA_GROUN', 'WELL_DEPTH', 'AQUIFER_TY', 'AQUIFER_LI', 'STRATIGRAP', 'STRATI_DES', 'NO_RECORD', 'WEL_PIEZOM', 'SCREEN_HOL', 'Level_Avai', 'Chem_Avai', 'Prep_Avai', 'CHEM_CONTE']
		}];
		return {
			queryParamsList: queryParamsList,
			options: options
		}
	},
	/*English Begins*/	
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>PGMN Well ID</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Water Level</center></th><th><center>Water Chemistry</center></th><th><center>Precipitation</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.PGMN_WELL %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "EN") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "EN") %></td>\
			<td> <% if (attrs.Level_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/csv/<%= attrs.PGMN_WELL %>.zip\'>Zipped CSV</a> <% } %></td>\
			<td> <% if (attrs.Chem_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'water-chemistry-report?id=<%= attrs.PGMN_WELL %>\'>HTML</a> <% } %></td>\
			<td> <% if (attrs.Prep_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/csv/<%= attrs.Site_ID %>.csv\'>CSV</a> <% } %></td></tr>\
		<% }); %>\
		</tbody></table>'
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Num\u00e9ro du puits du r\u00e9seau</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>niveau de l\'eau</center></th><th><center>Chimie de l\'eau</center></th><th><center>précipitation</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.PGMN_WELL %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "FR") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "FR") %></td>\
			<td> <% if (attrs.Level_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/WaterLevel/csv/<%= attrs.PGMN_WELL %>.zip\'>Zipped CSV</a> <% } %></td>\
			<td> <% if (attrs.Chem_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'water-chemistry-report?id=<%= attrs.PGMN_WELL %>\'>HTML</a> <% } %></td>\
			<td> <% if (attrs.Prep_Avai === 0) { %> N/A <% } else { %> <a target=\'_blank\' href=\'http://files.ontariogovernment.ca/moe_mapping/mapping/PGMN/Precipitation/csv/<%= attrs.Site_ID %>.csv\'>CSV</a> <% } %></td></tr>\
		<% }); %>\
		</tbody></table>'		
	/*French Ends*/	
});

