var langSetting = require('../../Languages/French');
var configureLanguage = {
	language: "FR",
	langSetting: langSetting,
	otherInfoHTML: '<h2>Une erreur sur la carte?</h2> \
		<p>Il est possible que des impr&eacute;cisions se soient gliss&eacute;es sur les emplacements.</p> \
		<p>Si vous trouvez une erreur d&rsquo;emplacement d&rsquo;un lac, d&rsquo;une rivi&egrave;re ou d&rsquo;un cours d&rsquo;eau, veuillez nous en avertir. Vous pouvez utiliser le lien &laquo; <a href="mailto:sportfish.moe@ontario.ca?subject=Sport%20Fish%20Map%20Error">Signaler une erreur</a> &raquo; du menu contextuel de la carte.</p> \
		<h2>Commentaires</h2> \
		<p>Veuillez formuler vos commentaires ou vos suggestions par courriel &agrave; <a href="mailto:sportfish.moe@ontario.ca">sportfish.moe@ontario.ca</a>.</p>',
	searchControlHTML: '<div id="searchTheMap"></div><div id="searchHelp"></div><br>\
		<label class="element-invisible" for="map_query">Recherche carte interactive</label>\
		<input id="map_query" type="text" title="Terme de recherche" maxlength="100" size="50" onkeypress="return GoogleMapsAdapter.entsub(event)"></input>\
		<label class="element-invisible" for="search_submit">Recherche</label>\
		<input id="search_submit" type="submit" title="Recherche" onclick="GoogleMapsAdapter.search()" value="Recherche"></input>\
		<fieldset>\
			<input type="radio" id="searchMapLocation" name="searchGroup" checked="checked" title="Recherche d\'emplacements" name="location" value="location" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'emplacements : Indiquer le lieu en Ontario (lac/rivi\u00e8re, ville/canton, adresse) pour avoir des conseils sur la consommation des poissons du lieu.">\
			<label class="option" for="searchMapLocation">Recherche d\'emplacements</label>\
			</span>\
			<br/>\
			<input type="radio" id="searchFishSpecies" name="searchGroup" title="Recherche d\'esp\u00e8ces" name="species" value="species" onclick="GoogleMapsAdapter.searchChange(this)"></input>\
			<span class="tooltip" title="Recherche d\'esp\u00e8ces : Indiquer une esp\u00e8ce de poisson pour trouver des lacs sur lesquels existent des conseils sur la consommation de l\'esp\u00e8ce.">\
			<label class="option" for="searchFishSpecies">Recherche d\'esp\u00e8ces</label>\
			</span>\
			<br/>\
			<input id="currentMapExtent" type="checkbox" name="currentExtent" title="Étendue de la carte courante" /> <label for="currentExtent" class=\'option\'>\u00c9tendue de la carte courante</label>\
		</fieldset>\
		<div id="information"></div>',
	tableTemplate: '<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>Plan d\'eau</center></th><th><center>Lieu</center></th><th><center>Latitude</center></th><th><center>Longitude</center></th><th><center>Tableau des mises en garde en mati\u00e8re de consommation</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><%= attrs.LOCNAME_FR %></td><td><%= Util.addBRtoLongText(attrs.GUIDELOC_FR) %></td><td><%= Util.deciToDegree(attrs.LATITUDE, "FR") %></td><td><%= Util.deciToDegree(attrs.LONGITUDE, "FR") %></td><td><a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC  %>\'>Tableau des mises en garde en mati\u00e8re de consommation</a></td></tr>\
		<% }); %>\
		</tbody></table>',
	identifySettings: {
		/* radius: 1, // 1 meter. If the target layer is a polygon layer, it is useful to set the radius as a small value. If the target layer is a point layer, it is useful to increase the radius according to zoom level. */
		identifyLayersList: [{
			mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
			layerID: 0,
			outFields: ['WATERBODYC', 'LOCNAME_FR', 'GUIDELOC_FR', 'LATITUDE', 'LONGITUDE']
		}],
		identifyTemplate: '<strong><%= attrs.LOCNAME_FR %></strong><br><%= Util.addBRtoLongText(attrs.GUIDELOC_FR) %><br><br>\
			<a target=\'_blank\' href=\'rapport-de-consommation-de-poisson?id=<%= attrs.WATERBODYC %>\'>Tableau des mises en garde en mati\u00e8re de<br> consommation</a><br><br>\
			Latitude <b><%= Util.deciToDegree(attrs.LATITUDE, "FR") %></b> Longitude <b><%= Util.deciToDegree(attrs.LONGITUDE, "FR") %></b><br>\
			<a href=\'mailto:sportfish.moe@ontario.ca?subject=Erreur de portail (Submission <%= attrs.LOCNAME_FR %>)\'>Signalez un probl\u00e8me pour ce lieu</a>.<br><br>'
	}
};
