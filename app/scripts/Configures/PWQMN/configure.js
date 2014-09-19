var identifyCallback = require('../scripts/IdentifyCallbacks/OneFeatureNoTab');
var searchCallback = require('../scripts/SearchCallbacks/OneFeatureNoTab');

var globalConfigure = {
	langs: langSetting,
	infoWindowWidth: '470px',
	infoWindowHeight: '240px',
	infoWindowContentHeight: '200px',
	infoWindowContentWidth: '450px',
	/*English Begins*/
	otherInfoHTML: 'Some scientific/monitoring data are only provided in English.',
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: 'Certaines donn&eacute;es scientifiques et de surveillance n&rsquo;existent qu&rsquo;en anglais.',
	/*French Ends*/
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Search the map</label>\
			<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Search</label>\
			<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
			<div id="information"></div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
			<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Recherche</label>\
			<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
			<div id="information"></div>',
	/*French Ends*/
	/*
		identifyRadius: 1
	*/
	/*English Begins*/
	identifyTemplate: [{
		label: 'Information',
		content:'ID: <strong><%= attrs.STATION %></strong><br>Stream: <strong><%= attrs.NAME %></strong><br>\
		Location: <%= attrs.LOCATION %><br><br><br><br>Status: <strong><%= (attrs.STATUS.trim() == "A") ? "Active" : "Inactive" %></strong><br>\
		First Year Sampled: <strong><%= attrs.FIRST_YR %></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Last Year Sampled: <strong><%= attrs.LAST_YR %></strong><br>\
		Latitude <strong><%= attrs.LATITUDE %></strong>&nbsp;&nbsp;&nbsp;Longitude <strong><%= attrs.LONGITUDE %></strong><br>',
	},{
		label: '<%= (attrs.PHOSPHORUS > 0) ? "Phosphorus" : "" %>',
		content:'<center><img src=\'<%= attrs.PHOSPHORUS_CONT %>)\'/><br></center><br><center>Total Phosphorus Concentrations (mg/L) for <strong><%= attrs.NAME %></strong></center>',
	},{
		label: '<%= (attrs.NITRATES > 0) ? "Nitrates" : "" %>',
		content:'<center><img src=\'<%= attrs.NITRATES_CONT %>)\'/><br></center><br><center>Total Nitrates Concentrations (mg/L-N) for <strong><%= attrs.NAME %></strong></center>',
	},{
		label: '<%= (attrs.SUS_SOLIDS > 0) ? "Susp. Solids" : "" %>',
		content:'<center><img src=\'<%= attrs.SUSPENDED_SOLIDS_CONT %>-N)\'/><br></center><br><center>Suspended Solids Concentrations (mg/L) for <strong><%= attrs.NAME %></strong></center><br>',
	},{
		label: '<%= (attrs.CHLORIDE > 0) ? "Chloride" : "" %>',
		content:'<center><img src=\'<%= attrs.CHLORIDE_CONT %>)\'/><br></center><br><center>Chloride Concentrations (mg/L) for <strong><%= attrs.NAME %></strong></center><br>',
	}],
	/*English Ends*/
	/*French Begins*/
	identifyTemplate: [{
		label: 'Information',
		content:'Num\u00e9ro: <strong><%= attrs.STATION %></strong><br>Cours d\'eau: <strong><%= attrs.NAME %></strong><br>\
		Lieu: <%= attrs.LOCATION %><br><br><br><br>\u00c9tat: <strong><%= (attrs.STATUS.trim() == "A") ? "Active" : "Inactive" %></strong><br>\
		Premi\u00e8re ann\u00e9e \u00e9chantillonn\u00e9e: <strong><%= attrs.FIRST_YR %></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Derni\u00e8re ann\u00e9e \u00e9chantillonn\u00e9e: : <strong><%= attrs.LAST_YR %></strong><br>\
		Latitude <strong><%= attrs.LATITUDE %></strong>&nbsp;&nbsp;&nbsp;Longitude <strong><%= attrs.LONGITUDE %></strong><br>',
	},{
		label: '<%= (attrs.PHOSPHORUS > 0) ? "Phosphore" : "" %>',
		content:'<center><img src=\'<%= attrs.PHOSPHORUS_CONT %>)\'/><br></center><br><center>Concentrations de phosphore total (mg/L) dans: <strong><%= attrs.NAME %></strong></center>',
	},{
		label: '<%= (attrs.NITRATES > 0) ? "Nitrates" : "" %>',
		content:'<center><img src=\'<%= attrs.NITRATES_CONT %>)\'/><br></center><br><center>Concentrations de nitrates totaux (mg/L-N) dans: <strong><%= attrs.NAME %></strong></center>',
	},{
		label: '<%= (attrs.SUS_SOLIDS > 0) ? "Mat. en susp." : "" %>',
		content:'<center><img src=\'<%= attrs.SUSPENDED_SOLIDS_CONT %>-N)\'/><br></center><br><center>Concentrations des mati\u00e8res en suspension (mg/L) dans: <strong><%= attrs.NAME %></strong></center><br>',
	},{
		label: '<%= (attrs.CHLORIDE > 0) ? "Chlorure" : "" %>',
		content:'<center><img src=\'<%= attrs.CHLORIDE_CONT %>)\'/><br></center><br><center>Concentrations de chlorure (mg/L) dans <strong><%= attrs.NAME %></strong></center><br>',
	}],
	/*French Ends*/
	/*English Begins*/	
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Station ID</center></th><th><center>Stream</center></th><th><center>Location</center></th><th><center>Status</center></th><th><center>First Year Sampled</center></th><th><center>Last Year Sampled</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.STATION %></td><td><%= attrs.NAME %></td><td><%= attrs.LOCATION %></td><td><%= (attrs.STATUS.trim() == "A") ? "Active" : "Inactive" %></td>\
			<td><%= attrs.FIRST_YR %></td><td><%= attrs.LAST_YR %></td><td><%= attrs.LATITUDE %></td>\
			<td><%= attrs.LONGITUDE %></td></tr>\
		<% }); %>\
		</tbody></table>',
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Num\u00e9ro</center></th><th><center>Cours d\'eau</center></th><th><center>Lieu</center></th><th><center>Rapport d\'\u00e9tape</center></th><th><center>Premi\u00e8re ann\u00e9e \u00e9chantillonn\u00e9e</center></th><th><center>Derni\u00e8re ann\u00e9e \u00e9chantillonn\u00e9e</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.STATION %></td><td><%= attrs.NAME %></td><td><%= attrs.LOCATION %></td><td><%= (attrs.STATUS.trim() == "A") ? "Active" : "Inactive" %></td>\
			<td><%= attrs.FIRST_YR %></td><td><%= attrs.LAST_YR %></td><td><%= attrs.LATITUDE %></td>\
			<td><%= attrs.LONGITUDE %></td></tr>\
			<% }); %>\
		</tbody></table>',	
	/*French Ends*/	

	identifyParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PWQMN/MapServer',
		layerID: 0,
		outFields: ['STATION', 'NAME', 'LOCATION', 'STATUS', 'FIRST_YR', 'LAST_YR', 'LATITUDE', 'LONGITUDE', 'PHOSPHORUS', 'PHOSPHORUS_CONT', 'NITRATES', 'NITRATES_CONT', 'SUS_SOLIDS', 'SUSPENDED_SOLIDS_CONT', 'CHLORIDE', 'CHLORIDE_CONT']
	}],
	exportParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PWQMN/MapServer',
		visibleLayers: [0, 1, 2]
	}],
	queryParamsList: 	[{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PWQMN/MapServer',
		layerID: 0,
		returnGeometry: true,
		outFields: ['STATION', 'NAME', 'LOCATION', 'STATUS', 'FIRST_YR', 'LAST_YR', 'LATITUDE', 'LONGITUDE', 'PHOSPHORUS', 'PHOSPHORUS_CONT', 'NITRATES', 'NITRATES_CONT', 'SUS_SOLIDS', 'SUSPENDED_SOLIDS_CONT', 'CHLORIDE', 'CHLORIDE_CONT']
	}],
	maxYearCoordinate: 2012,
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

		var getChart = function (data){
			var getMaxCorr = function (max){
				var a = Math.floor(Math.log(max)/Math.LN10);
				var b = Math.pow(10,a);
				var c = Math.ceil(max/b*10);
				if(!(c%2==0))
					c = c + 1;
				var res = c*Math.pow(10,a-1);

				if(res>10)
					res = res.toFixed(0);
				else
					res = res.toFixed(-a+1);

				return res;
			};
			var lines = data.split(";");
			var len = lines.length;
			var maxCorr = -10000;
			var dataList = new Array();
			var timeList = new Array();
			var beginTime = new Date(2002, 0, 1);
			var endTime = new Date(globalConfigure.maxYearCoordinate, 0, 1);
			var c = (endTime.getTime()-beginTime.getTime())/100;
			var dateString = "";
			for(var i=0; i < len; i++) {
				var items = (lines[i]).split(":");
				var val = parseFloat(items[1]);
				if(val>maxCorr)
					maxCorr = val; 
				dataList.push(val);
				var ds = items[0];
				var year = parseInt(ds.substring(0,2), '10');
				var month = parseInt(ds.substring(2,4), '10');
				var day = parseInt(ds.substring(4), '10');
				var current = new Date(year+2000, month-1, day);
				var dayValue = ((current.getTime()-beginTime.getTime())/c).toFixed(2);
				dateString = dateString + dayValue + ","
			}
			dateString = dateString.substring(0,dateString.length-1)
			if(len ==1)
				maxCorr = 2*maxCorr;
			maxCorr = getMaxCorr(maxCorr);
			var midCorr = maxCorr/2;
			var c = 100/maxCorr;
			var dataStr = "";
			for(var i=0; i < len; i++) {
				dataStr = dataStr + (dataList[i]*c).toFixed(2) + ",";
			}
			dataStr = dataStr.substring(0,dataStr.length-1);
			//var yearCoordinates = Array.range(2002, globalConfigure.maxYearCoordinate).join("|");
			var yearCoordinates = _.range(2002, globalConfigure.maxYearCoordinate + 1).join("|");
			var res = "http://chart.apis.google.com/chart?cht=s&chd=t:" + dateString + "|"+dataStr+"&chxt=x,y&chs=400x150&chxl=|0:|" + yearCoordinates + "|1:|0|"+midCorr+"|" + maxCorr + "(mg/L";
			return res;
		};

		return _.map(results, function(layer) {
				layer.features = _.map(layer.features, function(feature) {
					feature.attributes["LATITUDE"] = deciToDegree(feature.attributes["LATITUDE"]);
					feature.attributes["LONGITUDE"] = deciToDegree(feature.attributes["LONGITUDE"]);
					feature.attributes["PHOSPHORUS_CONT"] = getChart(feature.attributes["PHOSPHORUS_CONT"]);
					feature.attributes["NITRATES_CONT"] = getChart(feature.attributes["NITRATES_CONT"]);
					feature.attributes["SUSPENDED_SOLIDS_CONT"] = getChart(feature.attributes["SUSPENDED_SOLIDS_CONT"]);
					feature.attributes["CHLORIDE_CONT"] = getChart(feature.attributes["CHLORIDE_CONT"]);
					return feature;
				})
				return layer;
			});
	},
	getSearchCondition: function (params) {
		var searchStationNO = function (name){
			var reg = /^\d+$/;
			if((name.length == 11) && reg.test(name)){
				return true;
			}else{
				return false;
			}
		};
		var searchString = params.searchString;
		var where = '';
		if(searchStationNO(searchString)){
			where = "STATION = '" + searchString.toUpperCase() +  "'";
		}else{
			var str = searchString.split(/\s+/).join(" ").toUpperCase();
			where = "UPPER(NAME) LIKE '%" + str + "%'";
		}
		return where;
	},
	getSearchGeometry: function (params) {
		if ($('#currentMapExtent')[0].checked) {
			return params.currentMapExtent;
		} else {
			return null;
		}
	},
	getSearchSettings: function (params) {
		var searchStationNO = function (name){
			var reg = /^\d+$/;
			if((name.length == 11) && reg.test(name)){
				return true;
			}else{
				return false;
			}
		};
		var searchString = params.searchString;
		var settings = {
			searchString: searchString,
			geocodeWhenQueryFail: !searchStationNO(searchString),
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

var url = defaultConfiguration.dynamicResourcesLoadingURL;
var urls = [url + 'css/multipletabs.css', url + 'js/closure-library-multipletabs-min.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

globalConfigure = _.defaults(globalConfigure, defaultConfiguration);
$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);