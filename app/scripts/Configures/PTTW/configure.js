yepnope({load: 'bower_components/jquery.ui/themes/base/jquery.ui.all.css',callback: function(){}});
yepnope({load: 'bower_components/jquery.ui/ui/jquery.ui.core.js',callback: function(){}});
yepnope({load: 'bower_components/jquery.ui/ui/jquery.ui.widget.js',callback: function(){}});
yepnope({load: 'bower_components/jquery.ui/ui/jquery.ui.position.js',callback: function(){}});
yepnope({load: 'bower_components/jquery.ui/ui/jquery.ui.autocomplete.js',callback: function(){}});

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
		if(document.getElementById('searchBusiness').checked){
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
			var name = params.searchString.toUpperCase();
			name = replaceChar(name, "'", "''");
			name = replaceChar(name, "\u2019", "''");
			var fuzzyConditionsGenerator = function(field, str) {
				return "(UPPER(" + field + ") LIKE '% " + str + " %') OR (UPPER(" + field + ") LIKE '" + str + " %') OR (UPPER(" + field + ") LIKE '% " + str + "') OR (UPPER(" + field + ") = '" + str + "') OR (UPPER(" + field + ") LIKE '%" + str + ",%')";
			};				
			return fuzzyConditionsGenerator("CLIENTNAME", name);
		}			
		if(document.getElementById('searchWatershed').checked){
			return "NAME = '" + params.searchString + "'";
		}			

		if(document.getElementById('searchLocation').checked){
			//var radius = document.getElementById('lstRadius').value;
			PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_READY", {address: params.searchString, withinExtent: false});	
			return null;
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
					GoogleMapsAdapter.search(ui.item.value);
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
		layerID: 2,
		outFields: ["NAME"],
		returnGeometry: false,
		where: '1=1'
	}], function (queryParams) {
	return ArcGISServerAdapter.query(queryParams);
});
$.when.apply($, promises).done(function() {
	globalConfigure.watershedNames = _.map(arguments[0].features, function(feature) {
		return feature.attributes.NAME;
	}).sort();
	
	globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

	$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
	$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
	PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);	
});
