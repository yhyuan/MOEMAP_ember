var identifyCallback = require('../scripts/IdentifyCallbacks/OneFeatureNoTab');
var searchCallback = require('../scripts/SearchCallbacks/OneFeatureNoTab');
var globalConfigure = {
	langs: langSetting,
	//minMapScale: 1,
	infoWindowHeight: '160px',
	/*English Begins*/
	otherInfoHTML: "<h2>Find a map error?</h2> \
      <p>It is possible you may encounter inaccuracies with map locations.</p> \
      <p>If you find an error in the location of a lake, please contact us. Use the \"<a href=\"mailto:mailto:lakepartner@ontario.ca?subject=Sport%20Map%20Error\">Report an error</a>\" link within the map pop-up.</p> \
      <h2>Comments</h2> \
      <p>For comments and suggestions, email us at <a href=\"mailto:lakepartner@ontario.ca\">lakepartner@ontario.ca</a>.</p><p>Some scientific/monitoring data is only provided in English.</p>",
	/*English Ends*/
	/*French Begins*/
	otherInfoHTML: "<h2>Une erreur sur la carte?</h2> \
      <p>Il est possible que des impr\u00e9cisions se soient gliss\u00e9es sur les emplacements.</p> \
      <p>Si vous trouvez une erreur d\u0027emplacement d\u0027un lac, veuillez nous en avertir. Vous pouvez utiliser le lien <a href='mailto:lakepartner@ontario.ca?subject=Erreur de Portail'>Signaler une erreur</a> du menu contextuel de la carte.</p> \
      <h2>Commentaires</h2> \
      <p>Veuillez formuler vos commentaires ou vos suggestions par courriel \u00e0 <a href=\"mailto:lakepartner@ontario.ca\">lakepartner@ontario.ca</a>.</p><p>Certaines donn&eacute;es scientifiques et de surveillance n&rsquo;existent qu&rsquo;en anglais.</p>",
	/*French Ends*/
	/*English Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Search the map</label>\
			<input id="map_query" type="text" title="Search term" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Search</label>\
			<input id="search_submit" type="submit" title="Search" onclick="GoogleMapsAdapter.search()" value="Search"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Current Map Display" /> <label for="currentExtent" class=\'option\'>Search current map display only</label>\
			<div id="information">You may search by <strong>lake name</strong>, <strong>location</strong>, <strong>station number (STN)</strong> or see help for advanced options.</div>',
	/*English Ends*/
	/*French Begins*/
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
			<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
			<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
			<label class="element-invisible" for="search_submit">Recherche</label>\
			<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
			<div id="information">Vous pouvez rechercher par <strong>nom du lac</strong>, <strong>un lieu</strong>, <strong>le numéro de la station (STN)</strong> ou consulter l\'aide pour de l\'information sur les recherches avancées.</div>',
	/*French Ends*/
	/*
		identifyRadius: 1
	*/
	/*English Begins*/
	identifyTemplate: '<strong><%= attrs.LAKENAME %>, STN <%= attrs.STN %>, Site ID <%= attrs.SITEID %></strong><br>\
		<%= attrs.TOWNSHIP %> Township      <br><%= attrs.SITEDESC %><br><br>\
		Interactive Chart and Data: <br><% if (attrs.SE_COUNT > 0) { %>\
			&nbsp;&nbsp;&nbsp;&nbsp;<a target=\'_blank\' href=\'secchi-depth-report?id=<%= attrs.ID %>\'>Secchi Depth</a><br>\
		<% } %><% if (attrs.PH_COUNT > 0) { %>\
			&nbsp;&nbsp;&nbsp;&nbsp;<a target=\'_blank\' href=\'total-phosphorus-report?id=<%= attrs.ID %>\'>Total Phosphorus Concentration</a><br>\
		<% } %><br>Latitude <strong><%= attrs.LATITUDE %></strong> Longitude <strong><%= attrs.LONGITUDE %></strong><br>\
		<a href=\'mailto:lakepartner@ontario.ca?subject=Report Issue (Submission <%= attrs.LAKENAME %>, STN <%= attrs.STN %>, Site ID <%= attrs.SITEID %>)\'>Report an issue for this location</a>.<br>',
	/*English Ends*/
	/*French Begins*/
	identifyTemplate: '<strong><%= attrs.LAKENAME %>, STN <%= attrs.STN %>, N&deg; du lieu <%= attrs.SITEID %></strong><br>\
		Canton: <%= attrs.TOWNSHIP %><br><%= attrs.SITEDESC %><br><br>\
		Tableau et donn\u00e9es interactifs: <br><% if (attrs.SE_COUNT > 0) { %>\
			&nbsp;&nbsp;&nbsp;&nbsp;<a target=\'_blank\' href=\'rapport-de-profondeur-de-secchi?id=<%= attrs.ID %>\'>Disque Secchi</a><br>\
		<% } %><% if (attrs.PH_COUNT > 0) { %>\
			&nbsp;&nbsp;&nbsp;&nbsp;<a target=\'_blank\' href=\'bilan-de-phosphore-total?id=<%= attrs.ID %>\'>Concentration de phosphore total</a><br>\
		<% } %><br>Latitude <strong><%= attrs.LATITUDE %></strong> Longitude <strong><%= attrs.LONGITUDE %></strong><br>\
		<a href=\'mailto:lakepartner@ontario.ca?subject=Erreur de Portail (<%= attrs.LAKENAME %>, STN <%= attrs.STN %>, N&deg; du lieu <%= attrs.SITEID %>)\'>Signaler une erreur pour ce lieu</a>.<br>',
	/*French Ends*/
	/*English Begins*/	
	tableTemplate: '<table id="myTable" class="tablesorter" width="650" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Lake Name</center></th><th><center>STN</center></th><th><center>Site ID</center></th><th><center>Township</center></th><th><center>Site Description</center></th><th><center>Secchi Depth</center></th><th><center>Total Phosphorus Concentration</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LAKENAME %></td><td><%= attrs.STN %></td><td><%= attrs.SITEID %></td><td><%= attrs.TOWNSHIP %></td><td><%= attrs.SITEDESC %></td>\
			<td><% if (attrs.SE_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'secchi-depth-report?id=<%= attrs.ID %>\'>Report</a> <% } %></td>\
			<td><% if (attrs.PH_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'total-phosphorus-report?id=<%= attrs.ID %>\'>Report</a> <% } %></td>\
			<td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td></tr>\
		<% }); %>\
		</tbody></table>',
	/*English Ends*/
	/*French Begins*/
	tableTemplate: '<table id="myTable" class="tablesorter" width="650" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Nom du lac</center></th><th><center>STN</center></th><th><center>N&deg; du lieu</center></th><th><center>Canton</center></th><th><center>Description du site</center></th><th><center>Disque Secchi</center></th><th><center>Concentration de phosphore total</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LAKENAME %></td><td><%= attrs.STN %></td><td><%= attrs.SITEID %></td><td><%= attrs.TOWNSHIP %></td><td><%= attrs.SITEDESC %></td>\
			<td><% if (attrs.SE_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'rapport-de-profondeur-de-secchi?id=<%= attrs.ID %>\'>Rapport</a> <% } %></td>\
			<td><% if (attrs.PH_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'bilan-de-phosphore-total?id=<%= attrs.ID %>\'>Rapport</a> <% } %></td>\
			<td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td></tr>\
		<% }); %>\
		</tbody></table>',
	/*French Ends*/	
	/*English Begins*/	
	invalidTableTemplate: 'The following table contains the records without valid coordinates. <a href=\'#WhyAmISeeingThis\'>Why am I seeing this?</a>\
		<table id="invalid" class="tablesorter" width="650" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Lake Name</center></th><th><center>STN</center></th><th><center>Site ID</center></th><th><center>Township</center></th><th><center>Site Description</center></th><th><center>Secchi Depth</center></th><th><center>Total Phosphorus Concentration</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LAKENAME %></td><td><%= attrs.STN %></td><td><%= attrs.SITEID %></td><td><%= attrs.TOWNSHIP %></td><td><%= attrs.SITEDESC %></td>\
			<td><% if (attrs.SE_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'secchi-depth-report?id=<%= attrs.ID %>\'>Report</a> <% } %></td>\
			<td><% if (attrs.PH_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'total-phosphorus-report?id=<%= attrs.ID %>\'>Report</a> <% } %></td>\
			<td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td></tr>\
		<% }); %>\
		</tbody></table>\
		<a id=\'WhyAmISeeingThis\'><strong>Why am I seeing this?</strong></a><br>The map locations shown as points have been determined by using addresses or other information to calculate a physical location on the map.  In some cases, the information needed to calculate a location was incomplete, incorrect or missing.  The records provided in the table have been included because there is a close match on the name or city/town or other field(s). These records may or may not be near your specified location, and users are cautioned in using these records. They have been included as potential matches only.',
	/*English Ends*/
	/*French Begins*/
	invalidTableTemplate: 'Le tableau suivant contient des données sans coordonnées valides.  <a href=\'#WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a>\
		<table id="invalid" class="tablesorter" width="650" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Nom du lac</center></th><th><center>STN</center></th><th><center>N&deg; du lieu</center></th><th><center>Canton</center></th><th><center>Description du site</center></th><th><center>Disque Secchi</center></th><th><center>Concentration de phosphore total</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LAKENAME %></td><td><%= attrs.STN %></td><td><%= attrs.SITEID %></td><td><%= attrs.TOWNSHIP %></td><td><%= attrs.SITEDESC %></td>\
			<td><% if (attrs.SE_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'rapport-de-profondeur-de-secchi?id=<%= attrs.ID %>\'>Rapport</a> <% } %></td>\
			<td><% if (attrs.PH_COUNT === 0) { %>N/A<% } else { %> <a target=\'_blank\' href=\'bilan-de-phosphore-total?id=<%= attrs.ID %>\'>Rapport</a> <% } %></td>\
			<td><%= attrs.LATITUDE %></td><td><%= attrs.LONGITUDE %></td></tr>\
		<% }); %>\
		</tbody></table>\
		<a id=\'WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a><br>Les lieux indiqués par des points sur la carte ont été déterminés en fonction d’adresses ou d’autres renseignements servant à calculer un emplacement physique sur la carte. Dans certains cas, ces renseignements étaient incomplets, incorrects ou manquants. Les données fournies dans le deuxième tableau ont été incluses, car il y a une correspondance étroite avec le nom de la ville ou d’autre champ. Ces données peuvent ou non être proches du lieu précisé, et on doit les utiliser avec prudence. Elles ont été incluses seulement parce qu’il peut y avoir une correspondance.',
	/*French Ends*/			
	identifyParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/lakepartner/MapServer',
		layerID: 0,
		outFields: ['LAKENAME', 'STN', 'SITEID', 'TOWNSHIP', 'SITEDESC', 'SE_COUNT', 'ID', 'PH_COUNT', 'LATITUDE', 'LONGITUDE'],
		returnGeometry: false
	}],	
	exportParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/lakepartner/MapServer',
		visibleLayers: [0, 1]
	}],
	queryParamsList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/lakepartner/MapServer',
		layerID: 0,
		returnGeometry: true,
		outFields: ['LAKENAME', 'STN', 'SITEID', 'TOWNSHIP', 'SITEDESC', 'SE_COUNT', 'ID', 'PH_COUNT', 'LATITUDE', 'LONGITUDE']		
	}],
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

		var wordCapitalize = function (str){
			var strArray = str.trim().split(' ');
			for(var i=0; i < strArray.length; i++) {
				strArray[i] = strArray[i].substring(0,1).toUpperCase() + strArray[i].substring(1,strArray[i].length).toLowerCase();
			}
			return strArray.join(' ');
		};
		return _.map(results, function(layer) {
				layer.features = _.map(layer.features, function(feature) {
					feature.attributes["LATITUDE"] = deciToDegree(feature.attributes["LATITUDE"]);
					feature.attributes["LONGITUDE"] = deciToDegree(feature.attributes["LONGITUDE"]);
					feature.attributes["LAKENAME"] = wordCapitalize(feature.attributes["LAKENAME"]);
					feature.attributes["TOWNSHIP"] = wordCapitalize(feature.attributes["TOWNSHIP"]);
					feature.attributes["SITEDESC"] = wordCapitalize(feature.attributes["SITEDESC"]);
					return feature;
				})
				return layer;
			});
	},
	getSearchCondition: function (params) {
		var searchString = params.searchString;
		var reg = /^\d+$/;
		return (reg.test(searchString) && (searchString.length <= 5)) ? 'STN = ' + searchString : 'UPPER(LAKENAME) LIKE \'%' + searchString.split(/\s+/).join(' ').toUpperCase() + '%\'';
	},
	getSearchGeometry: function (params) {
		if ($('#currentMapExtent')[0].checked) {
			return params.currentMapExtent;
		} else {
			return null;
		}
	},
	getSearchSettings: function (params) {
		var reg = /^\d+$/;
		var searchString = params.searchString;
		var settings = {
			searchString: searchString,
			geocodeWhenQueryFail: (reg.test(searchString) && (searchString.length <= 5)) ? false : true,
			withinExtent: $('#currentMapExtent')[0].checked,
			invalidFeatureLocations: [{
				lat: 0,
				lng: 0,
				difference: 0.0001
			}]
		};
		return settings;
	}
};


globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
$("#" + globalConfigure.searchControlDivId).html(globalConfigure.searchControlHTML);
PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);
