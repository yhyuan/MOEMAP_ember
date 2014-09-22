var identifyCallback = require('../scripts/IdentifyCallbacks/OneFeatureNoTab');
var searchCallback = require('../scripts/SearchCallbacks/OneFeatureNoTab');
var globalConfigure = {
	langs: langSetting,
	infoWindowWidth: '560px',
	infoWindowHeight: '200px',
	infoWindowContentHeight: '160px',
	infoWindowContentWidth: '540px',
	pointBufferToolAvailable: true,
	//minMapScale: 1,
	/*English Begins*/
	otherInfoHTML: "",
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: '<p>Certaines donn&eacute;es scientifiques et de surveillance n&rsquo;existent qu&rsquo;en anglais.</p>',
	/*French Ends*/
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br><label class="element-invisible" for="map_query">Search the map</label>\
		<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Search</label>\
		<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
		<fieldset>\
			<input type="radio" id="searchWatershed" name="searchGroup" title="Watershed" name="watershed" value="watershed" onclick="GoogleMapsAdapter.searchChange(\'Watershed\')"></input>\
			<label class="option" for="watershed">\
				Watershed\
			</label>\
			<input type="radio" id="searchBusiness" name="searchGroup" title="Permit Holder Name" name="business" value="business" onclick="GoogleMapsAdapter.searchChange(\'Business\')" checked></input>\
			<label class="option" for="business">\
				Permit Holder Name\
			</label>\
			<input type="radio" id="searchLocation" name="searchGroup" title="Address with Radius of" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(\'Location\')"></input>\
			<label class="option" for="location">\
				Address with Radius of\
				<select name="searchCriteria.radius" id="lstRadius">\
					<option value="1" >1 km</option>\
					<option value="2" >2 km</option>\
					<option value="5" >5 km</option>\
					<option value="10" >10 km</option>\
					<option value="25" >25 km</option>\
					<option value="50" >50 km</option>\
				</select>\
			</label>\
		</fieldset>\
	<div id="information">You may search by <strong>watershed</strong>, <strong>permit holder name</strong>, <strong>address</strong> or see help for advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br><label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
		<fieldset>\
			<input type="radio" id="searchWatershed" name="searchGroup" title="Bassin versant" name="watershed" value="watershed" onclick="GoogleMapsAdapter.searchChange(\'Watershed\')"></input>\
			<label class="option" for="watershed">\
				Bassin versant\
			</label>\
			<input type="radio" id="searchBusiness" name="searchGroup" title="Nom du titulaire de permis" name="business" value="business" onclick="GoogleMapsAdapter.searchChange(\'Business\')"  checked></input>\
			<label class="option" for="business">\
				Nom du titulaire de permis\
			</label>\
			<input type="radio" id="searchLocation" name="searchGroup" title="Adresse dans un rayon de" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(\'Location\')"></input>\
			<label class="option" for="location">\
				Adresse dans un rayon de\
				<select name="searchCriteria.radius" id="lstRadius">\
					<option value="1" >1 km</option>\
					<option value="2" >2 km</option>\
					<option value="5" >5 km</option>\
					<option value="10" >10 km</option>\
					<option value="25" >25 km</option>\
					<option value="50" >50 km</option>\
				</select>\
			</label>\
		</fieldset>\
	<div id="information">Vous pouvez rechercher par <strong>bassin versant</strong>, <strong>nom du titulaire de permis</strong>, <strong>adresse</strong> ou consulter l\'aide pour de l\'information sur les recherches avancées.</div>',
	/*French Ends*/
	/*
		identifyRadius: 1
	*/
	identifyMultipleFeatures: true,
	/*English Begins*/		
	identifyTemplate: 'Total features returned: <strong><%= features.length %></strong><br>\
		<table class=\'tabtable\'><tr><th>Permit Number</th><th>Permit Holder Name</th><th>Purpose</th><th>Specific Purpose</th><th>Max Litres per Day</th><th>Source Type</th></tr>' + 
	/*English Ends*/
	/*French Begins*/
	identifyTemplate: 'Nombre total de résultats: <strong><%= features.length %></strong><br>\
		<table class=\'tabtable\'><tr><th>Num\u00e9ro du permis</th><th>Nom du titulaire de permis</th><th>Raison</th><th>Raison particuli\u00e8re</th><th>Litres (max. par jour)</th><th>Type de source</th></tr>' + 
	/*French Ends*/		
		'<%  _.each(features, function(feature) {\
				var attrs = feature.attributes; %> \
			<tr><td><%= attrs.PERMITNO %></td><td><%= attrs.CLIENTNAME %></td><td><%= attrs.PURPOSECAT %></td><td><%= attrs.SPURPOSE %></td><td><%= attrs.MAXL_DAY %></td><td><%= attrs.SURFGRND %></td></tr>\
		<% }); %>\
		</tbody></table>',
	/*English Begins*/	
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th>Permit Number</th><th>Permit Holder Name</th><th>Purpose</th><th>Specific Purpose</th><th>Max Litres per Day</th><th>Source Type</th></tr></thead><tbody>' + 
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th>Num\u00e9ro du permis</th><th>Nom du titulaire de permis</th><th>Raison</th><th>Raison particuli\u00e8re</th><th>Litres (max. par jour)</th><th>Type de source</th></tr></thead><tbody>' + 
	/*French Ends*/
		'<%  _.each(features, function(feature) {\
				var attrs = feature.attributes; %> \
			<tr><td><%= attrs.PERMITNO %></td><td><%= attrs.CLIENTNAME %></td><td><%= attrs.PURPOSECAT %></td><td><%= attrs.SPURPOSE %></td><td><%= attrs.MAXL_DAY %></td><td><%= attrs.SURFGRND %></td></tr>\
		<% }); %>\
		</tbody></table>',
	identifyParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PTTW_Search/MapServer',
		layerID: 0,
		outFields: ['PERMITNO', 'CLIENTNAME', 'PURPOSECAT', 'SPURPOSE', 'MAXL_DAY', 'SURFGRND']
	}],
	exportParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PTTW_Search/MapServer',
		visibleLayers: [0, 1, 2]		
	}],
	queryParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PTTW_Search/MapServer',
		layerID: 0,
		returnGeometry: true,
		outFields: ['PERMITNO', 'CLIENTNAME', 'PURPOSECAT', 'SPURPOSE', 'MAXL_DAY', 'SURFGRND']
	}],
	transformResults: function (results) {
		return results;
	},
	getSearchCondition: function (params) {
		var isDigitals = function(str, len){
			if(str.length != len)
				return false;
			var reg = /^\d+$/;
			return reg.test(str);
		};
		var isDigitalsList = function(coorsArray, len){
			for(var i=0; i<=coorsArray.length - 1; i++){		
				if(!isDigitals(coorsArray[i], len)){
					return false;
				}
			}		
			return true;
		};
		var replaceChar = function (str, charA, charB) {
			var temp = [];
			temp = str.split(charA);
			var result = temp[0];
			if (temp.length >= 2) {
				for (var i = 1; i < temp.length; i++) {
					result = result + charB + temp[i];
				}
			}
			return result;
		};
		var searchWellID = function(name){	
			var coors = replaceChar(name, ',', ' ');
			var coorsArray = coors.split(/\s+/);
			if(isDigitalsList(coorsArray, 7)){
				return "((WELL_ID = '" + coorsArray.join("') OR (WELL_ID='") +  "'))";
			}
			return false;
		};
		var searchContractorID = function(name){	
			if (isDigitals(name, 4)){
				return "CONTRACTOR = '" + name +  "'";
			}
			return false;
		};	
		var searchContractorIDwithYear = function(name){	
			var coors = replaceChar(name, ',', ' ');
			var coorsArray = coors.split(/\s+/);
			if (coorsArray.length != 2) {
				return false;
			}
			if((parseInt(coorsArray[1])>=2100)||(parseInt(coorsArray[1])<=1900)){
				return false;
			}
			if(isDigitalsList(coorsArray, 4)){
				return "CONTRACTOR = '" + coorsArray[0] +  "' AND YEAR_COMPLETED = '" +  coorsArray[1] + "'";
			}
			return false;
		};
		var searchTagID = function(name){
			var coors = replaceChar(name, ',', ' ');
			var coorsArray = coors.split(/\s+/);
			var isTagNoList = function(coorsArray){
				var isTagNO = function(name){
					if((name.length > 8)||(name.length < 6)){
						return false;
					}
					var firstLetter = name.substring(0,1).toUpperCase();
					if(firstLetter != "A"){
						return false;
					}
					var reg = /^\d+$/;
					return reg.test(name.substring(1));
				};
			
				for(var i=0; i<=coorsArray.length - 1; i++){		
					if(!isTagNO(coorsArray[i])){
						return false;
					}
				}
				return true;
			};
			if(isTagNoList(coorsArray)){
				return "((TAG_NO = '" + coorsArray.join("') OR (TAG_NO='") +  "'))";
			}
			return false;
		};		
		var searchAuditID = function(name){	
			var coors = replaceChar(name, ',', ' ');
			var coorsArray = coors.split(/\s+/);
			if(coors.length < 6){
				return false;
			}
			if (coorsArray.length < 2) {
				return false;
			}
			if ((coorsArray[0]).toUpperCase() == "AUDIT"){
				coorsArray = coors.substring(6).split(/\s+/);
				return "((AUDIT_NO = '" + coorsArray.join("') OR (AUDIT_NO='") +  "'))";
			}
			if ((coorsArray[0]).toUpperCase() == "VERIFICATION"){
				coorsArray = coors.substring(13).split(/\s+/);
				return "((AUDIT_NO = '" + coorsArray.join("') OR (AUDIT_NO='") +  "'))";
			}		
			return false;
		};
		var MOEMapTools = {
			monthNames : ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER", "OCTOBER","NOVEMBER","DECEMBER"],
			monthFrenchNames : ["JANVIER","FEVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOUT","SEPTEMBRE", "OCTOBRE","NOVEMBRE","DECEMBRE"],
			monthShortNames : ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
			monthDigitalNames : ["01","02","03","04","05","06","07","08","09","10","11","12"],
			getArrayIndex: function (str, strArray){
				var index = -1;
				for(var i=0; i < strArray.length; i++) {
					if(strArray[i] == str){
						index = i;
						break;
					}
				}
				return index;
			}
		};		
		var isDateString = function(dateString){
			var isDate = function(year, month, day){
				var date = new Date(year, month-1, day);
				var dStr1 = "" + date.getFullYear() + (date.getMonth()+1) + date.getDate();
				var dStr2 = "" + year + month + day;
				return (dStr1 == dStr2);
			};
			var str = replaceChar(dateString, ',', ' ');
			var dateArray = str.split(/\s+/);
			if(dateArray.length == 3){
				var reg = /^\d+$/;
				var monthIndex = -1;
				if(reg.test(dateArray[2])&&((dateArray[2]).length==4)&&reg.test(dateArray[1])&&((dateArray[1]).length <=2)){
					monthIndex = MOEMapTools.getArrayIndex(dateArray[0], MOEMapTools.monthNames);
					if(monthIndex >= 0){
						if(isDate(parseInt(dateArray[2]),monthIndex + 1, parseInt(dateArray[1]))){
							return 2; 
						}
					}
					monthIndex = MOEMapTools.getArrayIndex(dateArray[0], MOEMapTools.monthShortNames);
					if(monthIndex >= 0){
						if(isDate(parseInt(dateArray[2]),monthIndex + 1, parseInt(dateArray[1]))){
							return 1; 
						}
					}
				}
				if(reg.test(dateArray[2])&&((dateArray[2]).length==4)&&reg.test(dateArray[0])&&((dateArray[0]).length <=2)){
					monthIndex = MOEMapTools.getArrayIndex((dateArray[1]).replace(/\u00c9/g,"E").replace(/\u00DB/g,"U"), MOEMapTools.monthFrenchNames);
					if( monthIndex>= 0){
						if(isDate(parseInt(dateArray[2]),monthIndex + 1, parseInt(dateArray[0]))){
							return 5; 
						}
					}
				}
			}
			str = replaceChar(dateString, '/', ' ');
			dateArray = str.split(/\s+/);
			if(dateArray.length == 3){
				var reg = /^\d+$/;
				if(reg.test(dateArray[2])&&((dateArray[2]).length==4)&&reg.test(dateArray[1])&&((dateArray[1]).length <=2)&&reg.test(dateArray[0])&&((dateArray[0]).length <=2)){
					if(isDate(parseInt(dateArray[2]), parseInt(dateArray[0]), parseInt(dateArray[1]))){
						return 3;  // MM/DD/YYYY
					}
				}
				if(reg.test(dateArray[0])&&((dateArray[0]).length==4)&&reg.test(dateArray[1])&&((dateArray[1]).length <=2)&&reg.test(dateArray[2])&&((dateArray[2]).length <=2)){
					if(isDate(parseInt(dateArray[0]), parseInt(dateArray[1]), parseInt(dateArray[2]))){
						return 4;  // YYYY/MM/DD
					}
				}
			}

			return -1;
		};
		var stringToDate = function(dateString, dateType){
			var str = replaceChar(dateString, ',', ' ');
			str = replaceChar(str, '/', ' ');
			str = str.trim();
			var dateArray = str.split(/\s+/);
			var year = "";
			var month = "";
			var day = "";
			switch (dateType){
				case 1:  //Jun 3, 2010
					year = dateArray[2];
					month = MOEMapTools.monthDigitalNames[MOEMapTools.getArrayIndex(dateArray[0], MOEMapTools.monthShortNames)];
					day = dateArray[1];
					break;
				case 2:  //June 3, 2010
					year = dateArray[2];
					month = MOEMapTools.monthDigitalNames[MOEMapTools.getArrayIndex(dateArray[0], MOEMapTools.monthNames)];
					day = dateArray[1];
					break;
				case 3:  //MM/DD/YYYY
					year = dateArray[2];
					month = dateArray[0];
					day = dateArray[1];
					break;
				case 4:  //YYYY/MM/DD
					year = dateArray[0];
					month = dateArray[1];
					day = dateArray[2];
					break;
				case 5:  //1 D?cembre 2011
					year = dateArray[2];
					month = MOEMapTools.monthDigitalNames[MOEMapTools.getArrayIndex((dateArray[1]).replace(/\u00DB/g,"U").replace(/\u00c9/g,"E"), MOEMapTools.monthFrenchNames)];
					day = dateArray[0];
					break;				
				default:
					break;
			}
			if((parseInt(day)<10)&&(day.length == 1)){
				day = "0" + day;
			}
			if((parseInt(month)<10)&&(month.length == 1)){
				month = "0" + month;
			}
			return year + "/" + month + "/" + day;
		};	
		var searchCompletionDate = function(name){		
			var dateType = isDateString(name);
			if (dateType <= 0) {
				return false;
			}		
			var date = stringToDate(name, dateType);
			return "(WELL_COMPLETED_DATE = '" + date +  "')";
		};
		var searchWellDepth = function(name){
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
			var depth = parseFloat(coorsArray[0]);
			return "((DEPTH_M > " + (depth-0.1) +  ") AND (DEPTH_M < " +  (depth+0.1) + "))";
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
		
		var name = params.searchString.toUpperCase().replace(/\u00c9/g,"E").replace(/\u00c8/g,"E").replace(/\u00DB/g,"U").replace(/\u00C0/g,"A");
		var functionList = [searchWellID, searchContractorID, searchContractorIDwithYear, searchTagID, searchAuditID, searchCompletionDate, searchWellDepth];
		var fun = _.find(functionList, function(f){ return f(name);});
		if (fun) {
			return fun(name);
		} else {
			if (isFromAndTo(name)>0) {
				var strArray = name.substring(5).split(" TO ");
				if(isFromAndTo(name) == 2){
					strArray = name.substring(3).split(" AU ");
				}
				if(isFromAndTo(name) == 3){
					strArray = name.substring(3).split(" A ");
				}
				var minDateType = isDateString((strArray[0]).trim());
				var maxDateType = isDateString((strArray[1]).trim());
				if (isFromAndToDepth(strArray)) {
					var minDepth = (strArray[0]).split(/\s+/)[0];
					var maxDepth = (strArray[1]).split(/\s+/)[0];
					return "((DEPTH_M >= " + minDepth +  ") AND (DEPTH_M <= " +  maxDepth + "))";
				}else if ((minDateType > 0)&&(maxDateType > 0)) {
					var minDate = stringToDate(strArray[0], minDateType);
					var maxDate = stringToDate(strArray[1], maxDateType);				
					return "((WELL_COMPLETED_DATE >= '" + minDate +  "') AND (WELL_COMPLETED_DATE <= '" +  maxDate + "'))";
				}			
			} else {
				PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_READY", {address: params.searchString, withinExtent: $('#currentMapExtent')[0].checked});
			}
		}
	},
	getSearchGeometry: function (params) {
		return null;
	},
	getSearchSettings: function (params) {
		var settings = {
			searchString: params.searchString,
			geocodeWhenQueryFail: false,
			withinExtent: false/*,
			invalidFeatureLocations: [{
				lat: 0,
				lng: 0,
				difference: 0.0001
			}]*/
		};
		return settings;
	},
	searchChange: function (type) {
		$('#' + this.searchInputBoxDivId)[0].value = '';
		if(type === "Business"){
			$( "#" + this.searchInputBoxDivId ).autocomplete({
				disabled: true,
				source: []
			});
			document.getElementById('lstRadius').disabled = true;
		}else if(type === "Watershed"){
			document.getElementById('lstRadius').disabled = true;
			$("#" + this.searchInputBoxDivId).autocomplete({
				source: this.watershedNames,
				disabled: false, 
				select: function(e, ui) {
					/*MOEMAP.clearOverlays();
					var searchString = ui.item.value;
					var queryParams = {
						searchString: searchString,
						withinExtent: false,
						where: "NAME = '" + searchString + "'",
						requireGeocode: false,
						address: searchString
					};				
					MOEMAP.queryLayersWithConditionsExtent(queryParams);
					*/
				}
			});			
		}else{
			$( "#" + this.searchInputBoxDivId ).autocomplete({
				disabled: true,
				source: []
			});
			document.getElementById('lstRadius').disabled = false;
		}
	}
};

var url = defaultConfiguration.dynamicResourcesLoadingURL;
var urls = [url + 'css/multipletabs.css', url + 'js/closure-library-multipletabs-min.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

var promises = _.map([{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/PTTW_Search/MapServer',
		layerID: 1,
		outFields: ["OFF_NAME"],
		returnGeometry: false,
		where: '1=1'
	}], function (queryParams) {
	return ArcGISServerAdapter.query(queryParams);
});
$.when.apply($, promises).done(function() {
	globalConfigure.watershedNames = _.map(arguments[0].features, function(feature) {
		return feature.attributes.OFF_NAME;
	});
	
	globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

	$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
	$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
	PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);	
});
