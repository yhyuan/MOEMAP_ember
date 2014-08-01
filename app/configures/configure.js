(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		url: "http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer",
		visibleLayers: [0, 1, 2]
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
	postIdentifyCallbackName: "SportFish",
	infoWindowWidth: '280px',
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
	computeIdentifyInfoWindows: function(results, globalConfigure) {
		return _.template(globalConfigure.identifyTemplate, {attrs: results[0].features[0].attributes, params: globalConfigure});
	},
	/*English Begins*/
	identifyLayersList: [{
		mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
		layerID: 0,
		outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE']
	}],
	identifyTemplate: '<strong><%= attrs.LOCNAME_EN %></strong><br><%= params.addBRtoLongText(attrs.GUIDELOC_EN) %><br><br>		<a target=\'_blank\' href=\'<%= params.report_URL %>?id=<%= attrs.WATERBODYC %>\'>Consumption Advisory Table</a><br><br>		Latitude <b><%= params.deciToDegree(attrs.LATITUDE) %></b> Longitude <b><%= params.deciToDegree(attrs.LONGITUDE) %></b><br>		<a href=\'mailto:sportfish.moe@ontario.ca?subject=Portal Error (Submission <%= attrs.LOCNAME_EN %>)\'>Report an error for this location</a>.<br><br>',
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
	addBRtoLongText: function (text) {
		var lineCount = 0;
		var readyForBreak = false;
		if (text.length <= 40) {
			return text;
		}
		var textArray = text.split('');
		var result = "";	
		for (var i = 0; i < textArray.length; i++) {
			if (lineCount > 40) {
				readyForBreak = true;
			}
			result = result + textArray[i];
			if ((readyForBreak) && (textArray[i] === " ")) {
				lineCount = 0;
				result = result + "<br>";
				readyForBreak = false;
			}
			lineCount = lineCount + 1;
		}
		return result;
	},
	deciToDegree: function (degree){
		if(Math.abs(degree) <= 0.1){
			return "N/A";
		}
		var sym = "N";
		if(degree<0){
			degree = -degree;
			if(this.language === "EN") {
				sym = "W";
			} else {
				sym = "O";
			}
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
	},
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
			withinExtent: $('#currentMapExtent')[0].checked
		};
		return {
			queryParamsList: queryParamsList,
			options: options
		}
	},
	computeValidResultsTable: function(results, globalConfigure) {
		var features = Util.combineFeatures(results);
		var template = '<table id=\"<%= params.tableID %>\" class=\"<%= params.tableClassName %>\" width=\"<%= params.tableWidth %>\" border=\"0\" cellpadding=\"0\" cellspacing=\"1\"><thead>			<tr><th><center><%= (["Waterbody", "Location", "Latitude", "Longitude","Consumption Advisory Table" ]).join("</center></th><th><center>") %></center></th></tr></thead><tbody>			<% _.each(features, function(feature) {				var attrs = feature.attributes;				<tr><td><%= ([attrs.LOCNAME_EN, params.addBRtoLongText(attrs.GUIDELOC_EN), params.deciToDegree(attrs.LATITUDE), params.deciToDegree(attrs.LONGITUDE), "<a target=\'_blank\' href=\'" + params.report_URL + "?id=" + attrs.WATERBODYC + "\'>Consumption Advisory Table</a>" ]).join("</td><td>"") %></td></tr>			<% }); %>			</tbody></table>';
		return _.template(template, {features: features, params: globalConfigure});
	},
	computeInvalidResultsTable: globalConfigure.computeValidResultsTable,	
	generateSearchResultsMarkers: function(results, globalConfigure) {
		var features = Util.combineFeatures(results);
		return _.map(features, function(feature) {
			var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
			var container = document.createElement('div');
			container.style.width = globalConfigure.infoWindowWidth;
			container.style.height = globalConfigure.infoWindowHeight;
			container.innerHTML = _.template(globalConfigure.identifyTemplate, {attrs: feature.attributes, params: globalConfigure});
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
},{"../../scripts/GoogleMapsAdapter":4,"../../scripts/Util":5}],2:[function(require,module,exports){
/* global _, $, escape */
'use strict';
var formatTimeString_ = function (time, endTime) {
    var ret = '';
    if (time) {
        ret += (time.getTime() - time.getTimezoneOffset() * 60000);
    }
    if (endTime) {
        ret += ', ' + (endTime.getTime() - endTime.getTimezoneOffset() * 60000);
    }
    return ret;
};
  
/**
 * get string as rest parameter
 * @param {Object} o
 */
var formatRequestString_ = function (o) {
    var ret;
    if (typeof o === 'object') {
        if ($.isArray(o)) {
            ret = [];
            for (var i = 0, I = o.length; i < I; i++) {
                ret.push(formatRequestString_(o[i]));
            }
            return '[' + ret.join(',') + ']';
        //} else if (isOverlay_(o)) {
         //   return fromOverlaysToJSON_(o);
        } else if (o.toJSON) {
            return o.toJSON();
        } else {
            ret = '';
            for (var x in o) {
                if (o.hasOwnProperty(x)) {
                    if (ret.length > 0) {
                        ret += ', ';
                    }
                    ret += x + ':' + formatRequestString_(o[x]);
                }
            }
            return '{' + ret + '}';
        }
    }
    return o.toString();
};

/**
 * Format params to URL string
 * @param {Object} params
 */
var formatParams_ = function (params) {
    var query = '';
    if (params) {
        params.f = params.f || 'json';
        for (var x in params) {
            if (params.hasOwnProperty(x) && params[x] !== null && params[x] !== undefined) { // wont sent undefined.
                //jslint complaint about escape cause NN does not support it.
                var val = formatRequestString_(params[x]);
                query += (query.length > 0?'&':'')+(x + '=' + (escape ? escape(val) : encodeURIComponent(val)));
            }
        }
    }
    return query;
};

var jsonpID_ = 0;
window.ags_jsonp = window.ags_jsonp || {};
var getJSON_ = function (url, params, callbackName, callbackFn) {
    var sid = 'ags_jsonp_' + (jsonpID_++) + '_' + Math.floor(Math.random() * 1000000);
    var script = null;
    params = params || {};
    // AGS10.1 escapes && so had to take it off.
    params[callbackName || 'callback'] = 'ags_jsonp.' + sid;
    var query = formatParams_(params);
    var head = document.getElementsByTagName('head')[0];
    if (!head) {
        throw new Error('document must have header tag');
    }
    var jsonpcallback = function() {
        if (window.ags_jsonp[sid]) {
            delete window.ags_jsonp[sid]; //['ags_jsonp']
        }
        if (script) {
            head.removeChild(script);
        }
        script = null;
        callbackFn.apply(null, arguments);
    };
    window.ags_jsonp[sid] = jsonpcallback;
  
    if ((query + url).length < 2000) {
        script = document.createElement('script');
        script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + query;
        script.id = sid;
        head.appendChild(script);
    }
    return sid;
};

var query = function (p) {
    var dfd = new $.Deferred();
    if (!p) {
        return;
    }
    if(!p.hasOwnProperty('mapService') || !p.hasOwnProperty('layerID')) {
        return;
    }
    // handle text, where, relationParam, objectIds, maxAllowableOffset
    var params = _.clone(p);
    var url = params.mapService + '/' + params.layerID;
    delete params.mapService;
    delete params.layerID;

    if (p.hasOwnProperty('geometry')) {
        params.geometryType = 'esriGeometryPolygon';
        params.geometry = '{rings:[[' + _.map(p.geometry, function(pt) {
            return '[' + pt.lng.toFixed(6) + ',' + pt.lat.toFixed(6) + ']';
        }).join(',') + ']], spatialReference:{wkid:4326}}';
        params.inSR = 4326;
    }
    if (p.spatialRelationship) {
        params.spatialRel = p.spatialRelationship;
        delete params.spatialRelationship;
    }
    if (p.outFields && $.isArray(p.outFields)) {
        params.outFields = p.outFields.join(',');
    }
    if (p.objectIds) {
        params.objectIds = p.objectIds.join(',');
    }
    if (p.time) {
        params.time = formatTimeString_(p.time, p.endTime);
    }
    params.outSR = 4326;
    params.returnGeometry = p.returnGeometry === false ? false : true;
    params.returnIdsOnly = p.returnIdsOnly === true ? true : false;
    getJSON_(url + '/query', params, '', function(json) {
        if(json) {
            dfd.resolve(json);
        } else {
            dfd.resolve({status: 'Error'});
        }
    });
    return dfd.promise();
};

  /**
   * Export an image with given parameters.
   * For more info see <a  href  = 'http://sampleserver3.arcgisonline.com/ArcGIS/SDK/REST/export.html'>Export Operation</a>.
   * <br/> The <code>params</code> is an instance of {@link ExportMapOptions}.
   * The following properties will be set automatically if not specified:...
   * <br/> The <code>callback</code> is the callback function with argument of
   * an instance of {@link MapImage}.
   * @param {ExportMapOptions} params
   * @param {Function} callback
   * @param {Function} errback
   * @return {String|None} url of image if f=image, none if f=json
   */
  var exportMap = function (p) {
      var dfd = new $.Deferred();
      if (!p || !p.bounds) {
        return;
      }
      var url = p.mapService;
      // note: dynamic map may overlay on top of maptypes with different projection
      var params = {};// augmentObject_(p, );
      params.f = 'json';
      var bnds = p.bounds;
      params.bbox = '' + bnds.southWest.lng + ',' + '' + bnds.southWest.lat + ',' + bnds.northEast.lng + ',' + '' + bnds.northEast.lat;
      params.size = '' + p.width + ',' + p.height;
      params.imageSR = 102113;
      params.bboxSR = '4326';
      // for 9.3 compatibility:
      params.layerDefs = '';
      params.layers =  'show' + ':' + p.visibleLayers.join(',');
      params.transparent = true;
      getJSON_(url + '/export', params, '', function (json) {
        if (json.extent) {
          dfd.resolve(json);
        } else {
          dfd.resolve({status: 'Error'});
        }
      });
      return dfd.promise();
  };

var api = {
    query: query,
    exportMap: exportMap
};

module.exports = api;
},{}],3:[function(require,module,exports){
/* global _, $ */

'use strict';
var ArcGISServerAdapter = require('./ArcGISServerAdapter');
var Util = require('./Util');
var replaceChar = Util.replaceChar;

var regIsFloat = /^(-?\d+)(\.\d+)?$/,

/**
 * Validate whether a latlng is inside a polygon or not. 
 * The algorithm is from http://appdelegateinc.com/blog/2010/05/16/point-in-polygon-checking/.
 * Ray Cast Point in Polygon extension for Google Maps GPolygon
 * App Delegate Inc <htttp://appdelegateinc.com> 2010
 * @param {latlng} The latlng to be tested.
 * @param {poly} The polygonto be tested.
 * @return {Boolean} whether the latlng is inside the polygon or not.
 **/
	validateLatLngInPolygon = function (latlng, poly) {
		var lat = latlng.lat;
		var lng = latlng.lng;

		var numPoints = poly.length;
		var inPoly = false;
		var j = numPoints - 1;
		for (var i = 0; i < numPoints; i++) {
			var vertex1 = poly[i];
			var vertex2 = poly[j];

			if (vertex1.x < lng && vertex2.x >= lng || vertex2.x < lng && vertex1.x >= lng) {
				if (vertex1.y + (lng - vertex1.x) / (vertex2.x - vertex1.x) * (vertex2.y - vertex1.y) < lat) {
					inPoly = !inPoly;
				}
			}

			j = i;
		}
		return inPoly;
	},
 /**
 * Validate whether a UTM coordinate is inside a UTM range or not. 
 *
 * @param {utmCoors} The UTM coorindate to be tested.
 * @param {UTMRange} The UTM range to be tested.
 *
 * @return {Boolean} whether the UTM coorindate is inside the UTM range or not.
 **/
	validateUTMInRange = function (utmCoors, UTMRange) {
		var northing = utmCoors.northing;
		var easting = utmCoors.easting;
		return ((easting < UTMRange.maxEasting) && (easting > UTMRange.minEasting) && (northing < UTMRange.maxNorthing) && (northing > UTMRange.minNorthing));
	},
/**
 * Convert a UTM coordinate to a latlng under WGS 84. 
 *
 * @param {utmCoors} The UTM coordinate.
 * @return {latlng}  The converted latlng.
 **/
	convertUTMtoLatLng = function (utmCoors) {
		var zone = utmCoors.zone;
		var north = utmCoors.northing;
		var east = utmCoors.easting;

		var pi = 3.14159265358979; //PI
		var a = 6378137; //equatorial radius for WGS 84
		var k0 = 0.9996; //scale factor
		var e = 0.081819191; //eccentricity
		var e2 = 0.006694380015894481; //e'2
		//var corrNorth = north; //North Hemishpe
		var estPrime = 500000 - east;
		var arcLength = north / k0;
		var e4 = e2 * e2;
		var e6 = e4 * e2;
		var t1 = Math.sqrt(1 - e2);
		var e1 = (1 - t1) / (1 + t1);
		var e12 = e1 * e1;
		var e13 = e12 * e1;
		var e14 = e13 * e1;
		var C1 = 3 * e1 / 2 - 27 * e13 / 32;
		var C2 = 21 * e12 / 16 - 55 * e14 / 32;
		var C3 = 151 * e13 / 96;
		var C4 = 1097 * e14 / 512;
		var mu = arcLength / (a * (1 - e2 / 4.0 - 3 * e4 / 64 - 5 * e6 / 256));
		var FootprintLat = mu + C1 * Math.sin(2 * mu) + C2 * Math.sin(4 * mu) + C3 * Math.sin(6 * mu) + C4 * Math.sin(8 * mu);
		var FpLatCos = Math.cos(FootprintLat);
		//var C1_an = e2*FpLatCos*FpLatCos;
		var FpLatTan = Math.tan(FootprintLat);
		var T1 = FpLatTan * FpLatTan;
		var FpLatSin = Math.sin(FootprintLat);
		var FpLatSinE = e * FpLatSin;
		var t2 = 1 - FpLatSinE * FpLatSinE;
		var t3 = Math.sqrt(t2);
		var N1 = a / t3;
		var R1 = a * (1 - e2) / (t2 * t3);
		var D = estPrime / (N1 * k0);
		var D_2 = D * D;
		var D_4 = D_2 * D_2;
		var D_6 = D_4 * D_2;
		var fact1 = N1 * FpLatTan / R1;
		var fact2 = D_2 / 2;
		var fact3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2) * D_4 / 24;
		var fact4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2 - 3 * C1 * C1) * D_6 / 720;
		var lofact1 = D;
		var lofact2 = (1 + 2 * T1 + C1) * D_2 * D / 6;
		var lofact3 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2 + 24 * T1 * T1) * D_4 * D / 120;
		var deltaLong = (lofact1 - lofact2 + lofact3) / FpLatCos;
		var zoneCM = 6 * zone - 183;
		var latitude = 180 * (FootprintLat - fact1 * (fact2 + fact3 + fact4)) / pi;
		var longitude = zoneCM - deltaLong * 180 / pi;
		var res = {
			lat: latitude.toFixed(8),
			lng: longitude.toFixed(8)
		};
		return res;
	},
/**
 * Parse a string with the degree, minute, and second symbols and return a value in decimal format. 
 *
 * @param {val} The string to be parsed.
 * @param {s1} The degree symbol.
 * @param {s2} The minute symbol
 * @param {s3} The second symbol
 * @return {Number} The parsed decimal lat/lng.
 **/
	parseLatLngSymbols = function (val, s1, s2, s3) {
		var parseDMS = function (s, unparsed) {
			var res = {
				ParsedNum: 0,
				Unparsed: ''
			};
			if (unparsed.length === 0) {
				return res;
			}
			var arr = unparsed.split(s);
			var result = 0;
			if (arr.length <= 2) {
				if (regIsFloat.test(arr[0])) {
					result = parseFloat(arr[0]);
				}
				if (arr.length === 2) {
					unparsed = arr[1];
				} else {
					unparsed = '';
				}
			}
			res = {
				ParsedNum: result,
				Unparsed: unparsed
			};
			return res;
		};

		var result = 0;
		var parsed = parseDMS(s1, val);
		var deg = parsed.ParsedNum;
		parsed = parseDMS(s2, parsed.Unparsed);
		var min = parsed.ParsedNum;
		parsed = parseDMS(s3, parsed.Unparsed);
		var sec = parsed.ParsedNum;
		if (deg > 0) {
			result = deg + min / 60.0 + sec / 3600.0;
		} else {
			result = deg - min / 60.0 - sec / 3600.0;
		}
		result = Math.abs(result);
		return result;
	},
/**
 * Parse the input to get the Geographic Township, Lot, and Concession. 
 *
 * @param {Array} The array to be parsed.
 * @return {object} An ojbect which contain TWP, Lot, Con, isTWPOnly, success.
 */
	processLotCon = function (arr1) {
		if (arr1.length !== 2) {
			return {
				TWP: '',
				Lot: '',
				Con: '',
				isTWPOnly: false,
				success: false
			};
		}
		var TWPname = (arr1[0]).trim().split(/\s+/).join(' '); //replace multiple spaces with one space
		var con = '';
		var lot = '';
		if (((arr1[1]).indexOf('LOT') > 0) && ((arr1[1]).indexOf('CON') > 0)) {
			var arr2 = ((arr1[1]).trim()).split('CON');
			if ((arr2[0]).length === 0) {
				var arr3 = (arr2[1]).split('LOT');
				con = (arr3[0]).trim();
				lot = (arr3[1]).trim();
			} else {
				var arr4 = (arr2[0]).split('LOT');
				con = (arr2[1]).trim();
				lot = (arr4[1]).trim();
			}
		}
		var TWPOnly = false;
		if ((con.length === 0) && (lot.length === 0)) {
			TWPOnly = true;
		}
		return {
			TWP: TWPname,
			Lot: lot,
			Con: con,
			isTWPOnly: TWPOnly,
			success: true
		};
	},
/**
 * Process the input for Geographic Township with/without Lot & Concession. 
 *
 * @param {corrsUp} The input array.
 * @return {object} An ojbect which contain TWP, Lot, Con, isTWPOnly, success.
 **/
	getTWPinfo = function (address) {
		var corrsUp = replaceChar(address, ',', ' ').trim().split(/\s+/).join(' ').toUpperCase();
		var res = {
			TWP: '',
			Lot: '',
			Con: '',
			isTWPOnly: false,
			success: false
		};
		if (corrsUp.indexOf(' TWP') > 0) {
			res = processLotCon(corrsUp.split(' TWP'));
		}
		if (!res.success) {
			if (corrsUp.indexOf(' TOWNSHIP') > 0) {
				res = processLotCon(corrsUp.split(' TOWNSHIP'));
			}
		}
		if (!res.success) {
			if (corrsUp.indexOf('CANTON ') === 0) {
				var str = corrsUp.substring(7).trim();
				var lotIndex = str.indexOf(' LOT ');
				var conIndex = str.indexOf(' CON ');
				var index = lotIndex;
				if (conIndex < lotIndex) {
					index = conIndex;
				}
				var parsedList = [];
				if (index === -1) {
					parsedList.push(str);
					parsedList.push('');
				} else {
					parsedList.push(str.substring(0, index));
					parsedList.push(str.substring(index));
				}
				res = processLotCon(parsedList);
			}
		}
		return res;
	},
/**
 * Geocode an address with an ArcGIS layer. 
 *
 * @param {params} The object contains the geocoding information.
 * @param {settings} The setting of the layer for geocoding.
 * @return {promise} A promise contains the geocoding result.
 **/
	geocodeByQuery = function (params, settings) {
		var outFields = settings.fieldsInInfoWindow;
		var otherFields = [settings.latitudeField, settings.longitudeField, settings.areaField];
		var queryParams = {
			mapService: settings.mapService,
			layerID: settings.layerID,
			returnGeometry: settings.displayPolygon,
			where: settings.searchCondition,
			outFields: outFields.concat(otherFields)
		};
		var processResults = function (fset) {
			var features = fset.features;
			var size = features.length;
			if (size === 0) {
				return {status: 'No_Result'};
			}
			var attrs = features[0].attributes;
			var result = {
				address: params.address,
				geocodedAddress: settings.getInfoWindow(attrs)
			};
			if(queryParams.returnGeometry) {
				result.geometry = _.map(features, function(feature) {
					return feature.geometry;
				});
			}
			if (size === 1) {
				result.latlng = {
					lat: attrs[settings.latitudeField],
					lng: attrs[settings.longitudeField]
				};
			} else {
				var totalArea = _.reduce(features, function(tArea, feature) {
					return feature.attributes[settings.areaField] + tArea;
				}, 0);
				var totalLat = _.reduce(features, function(tlat, feature) {
					return feature.attributes[settings.latitudeField]* feature.attributes[settings.areaField] + tlat;
				}, 0);
				var totalLng = _.reduce(features, function(tlng, feature) {
					return feature.attributes[settings.longitudeField]* feature.attributes[settings.areaField] + tlng;
				}, 0);
				result.latlng = {
					lat: totalLat/totalArea,
					lng: totalLng/totalArea
				};
			}
			result.status = 'OK';
			return result;
		};
		return ArcGISServerAdapter.query(queryParams).then(processResults);
	},
	GeocoderList = {
		'LatLngInDecimalDegree' : {
			'match': function (params) {
				var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
				if ((coorsArray.length === 2) && regIsFloat.test(coorsArray[0]) && regIsFloat.test(coorsArray[1])) {
					var v0 = Math.abs(parseFloat(coorsArray[0]));
					var v1 = Math.abs(parseFloat(coorsArray[1]));
					this.latlng = params.generateLatLngFromFloats(v0, v1);
					return validateLatLngInPolygon(this.latlng, params.regionBoundary);
				}
				return false;
			},
			'geocode': function (params) {
				var result = {
					latlng: this.latlng,
					address: params.address,
					status: 'OK'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		},
		'LatLngInSymbols' : {
			'match': function (params) {
				var degreeSym = String.fromCharCode(176);
				var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
				if ((coorsArray.length === 2) && ((coorsArray[0]).indexOf(degreeSym) > 0) && ((coorsArray[1]).indexOf(degreeSym) > 0)) {
					var v0 = parseLatLngSymbols(coorsArray[0], degreeSym, '\'', '"');
					var v1 = parseLatLngSymbols(coorsArray[1], degreeSym, '\'', '"');
					this.latlng = params.generateLatLngFromFloats(v0, v1);
					return validateLatLngInPolygon(this.latlng, params.regionBoundary);
				}
				return false;
			},
			'geocode': function (params) {
				var result = {
					latlng: this.latlng,
					address: params.address,
					status: 'OK'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		},
		'LatLngInDMSSymbols' : {
			'match': function (params) {
				var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
				if (coorsArray.length === 2) {
					var str1 = (coorsArray[0]).toUpperCase();
					var str2 = (coorsArray[1]).toUpperCase();
					var validateDMSFormat = function (str) {
						for (var i = 0; i <= 9; i++) {
							if (str.indexOf(i + 'D') > 0) {
								return true;
							}
						}
						return false;
					};
					if (validateDMSFormat(str1) && validateDMSFormat (str2)) {
						var v0 = parseLatLngSymbols(str1, 'D', 'M', 'S');
						var v1 = parseLatLngSymbols(str2, 'D', 'M', 'S');
						this.latlng = params.generateLatLngFromFloats(v0, v1);
						return validateLatLngInPolygon(this.latlng, params.regionBoundary);
					}
				}
				return false;
			},
			'geocode': function (params) {
				var result = {
					latlng: this.latlng,
					address: params.address,
					status: 'OK'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		},
		'UTMInDefaultZone' : {
			'match': function (params) {
				var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
				if ((coorsArray.length === 2) && regIsFloat.test(coorsArray[0]) && regIsFloat.test(coorsArray[1])) {
					var v1 = Math.abs(parseFloat(coorsArray[0]));
					var v2 = Math.abs(parseFloat(coorsArray[1]));
					var utmCoors = {
						easting: Math.min(v1, v2),
						northing: Math.max(v1, v2)
					};
					if (validateUTMInRange(utmCoors, params.UTMRange)) {
						utmCoors.zone = params.defaultUTMZone;
						this.latlng = convertUTMtoLatLng(utmCoors);
						return validateLatLngInPolygon(this.latlng, params.regionBoundary);
					}
				}
				return false;
			},
			'geocode': function (params) {
				var result = {
					latlng: this.latlng,
					address: params.address,
					status: 'OK'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		},
		'UTM' : {
			'match': function (params) {
				var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
				if (coorsArray.length === 3) {
					var coorsArrayNoComma = _.map(coorsArray, function (item) {
						return item.replace(',', ' ').trim();
					});
					if (_.every(coorsArrayNoComma, function(item) {return regIsFloat.test(item);})) {
						var values = _.map(coorsArrayNoComma, function (item) {
							return Math.abs(parseFloat(item));
						}).sort(function (a, b) {
							return a - b;
						});
						var regIsInteger = /^\d+$/;
						if (regIsInteger.test((values[0]).toString())) {
							if ((values[0] >= 15) && (values[0] <= 18)) {
								var utmCoors = {
									zone: values[0],
									easting: values[1],
									northing: values[2]
								};
								if (validateUTMInRange(utmCoors, params.UTMRange)) {
									this.latlng = convertUTMtoLatLng(utmCoors);
									return validateLatLngInPolygon(this.latlng, params.regionBoundary);
								}
							}
						}
					}
				}
				return false;
			},
			'geocode': function (params) {
				var result = {
					latlng: this.latlng,
					address: params.address,
					status: 'OK'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		},
		'GeographicTownship' : {
			'match': function (params) {
				var twpInfo = getTWPinfo(params.address);
				return (twpInfo.success && twpInfo.isTWPOnly);
			},
			'geocode': function (params) {
				var twpInfo = getTWPinfo(params.address);
				var settings = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					displayPolygon: true,
					fieldsInInfoWindow: ['OFFICIAL_NAME'],
					getInfoWindow: function(attributes){
						return '<strong>' + attributes.OFFICIAL_NAME + '</strong>';
					},
					latitudeField: 'CENY',
					longitudeField: 'CENX',
					areaField: 'SHAPE_Area',
					searchCondition: 'OFFICIAL_NAME_UPPER = \'' + twpInfo.TWP + '\''
				};
				return geocodeByQuery(params, settings);
			}
		},
		'GeographicTownshipWithLotConcession' : {
			'match': function (params) {
				var twpInfo = getTWPinfo(params.address);
				return (twpInfo.success && (!twpInfo.isTWPOnly));
			},
			'geocode': function (params) {
				var twpInfo = getTWPinfo(params.address);
				var settings = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 1,
					displayPolygon: true,
					fieldsInInfoWindow: ['GEOG_TWP', 'LOT_NUM', 'CONCESSION'],
					getInfoWindow: function(attributes){
						return '<strong>' + attributes.GEOG_TWP + ' ' + attributes.LOT_NUM + ' ' + attributes.CONCESSION + '</strong>';
					},
					latitudeField: 'CENY',
					longitudeField: 'CENX',
					areaField: 'SHAPE_Area',
					searchCondition: 'GEOG_TWP' + ' = \'' + twpInfo.TWP + '\' AND CONCESSION = \'CON ' + twpInfo.Con + '\' AND LOT_NUM = \'LOT ' + twpInfo.Lot + '\''
				};
				return geocodeByQuery(params, settings);
			}
		}
	};


/**
 * Geocode an address string or geocoding Params. If it is an address string, createGeocodeParams is Creates a geocoding Params object using the default setting in Geocoder.
 * called to convert it to geocoding params. 
 *
 * @param {string} d The address to be geocoded.
 * @return {object} An ojbect sendt to Geocoder.
 */
function geocode(initParams) {
	var defaultParams = {
		//address: address, 
		GeocoderList: (!!initParams.GeocoderList) ? _.defaults(initParams.GeocoderList, GeocoderList) : GeocoderList,
		validateLatLngInPolygon: validateLatLngInPolygon,
		regionBoundary: [{x: -95.29920350, y: 48.77505703},
			{x: -95.29920350, y: 53.07150598},
			{x: -89.02502409, y: 56.95876930},
			{x: -87.42238044, y: 56.34499088},
			{x: -86.36531760, y: 55.93580527},
			{x: -84.69447635, y: 55.45842206},
			{x: -81.89837466, y: 55.35612565},
			{x: -81.96657226, y: 53.17380238},
			{x: -80.84131182, y: 52.28723355},
			{x: -79.98884179, y: 51.80985033},
			{x: -79.34096457, y: 51.74165273},
			{x: -79.34096457, y: 47.54750019},
			{x: -78.55669214, y: 46.49043736},
			{x: -76.61306048, y: 46.14944935},
			{x: -75.59009645, y: 45.77436253},
			{x: -74.12384800, y: 45.91075774},
			{x: -73.98745279, y: 45.02418891},
			{x: -75.07861443, y: 44.61500329},
			{x: -75.86288685, y: 44.03532368},
			{x: -76.88585089, y: 43.69433566},
			{x: -79.20, y: 43.450196},
			{x: -78.62488975, y: 42.94416204},
			{x: -79.54555738, y: 42.43268002},
			{x: -81.28459623, y: 42.15988961},
			{x: -82.54625188, y: 41.58020999},
			{x: -83.26232670, y: 41.95529681},
			{x: -83.36462310, y: 42.43268002},
			{x: -82.61444948, y: 42.73956923},
			{x: -82.17116506, y: 43.59203926},
			{x: -82.61444948, y: 45.36517692},
			{x: -84.08069793, y: 45.91075774},
			{x: -84.93316796, y: 46.69503016},
			{x: -88.27485047, y: 48.22947621},
			{x: -89.33191330, y: 47.78619180},
			{x: -90.32077854, y: 47.68389540},
			{x: -92.09391619, y: 47.95668581},
			{x: -94.07164666, y: 48.33177262},
			{x: -95.29920350, y: 48.77505703}],
		UTMRange: {
			minEasting: 258030.3,
			maxEasting: 741969.7,
			minNorthing: 4614583.73,
			maxNorthing: 6302884.09
		},
		defaultUTMZone: 17,
		/**
		 * Creates a latlng with two floats. In Ontario, the absolute value of longitude is always larger than the absolute value
		 * of latitude. This knowledge is used to determine which value is latitude and which value is longitude. In other areas, 
		 * this function has to be redefined. 
		 *
		 * @param {float, float} two floats.
		 * @return {object} An ojbect sendt to Geocoder.
		 */
		generateLatLngFromFloats: function (v1, v2) {
			var lat = Math.min(v1, v2);
			var lng = -Math.max(v1, v2);
			return {lat: lat, lng: lng};
		}
	};
	var params = _.defaults(initParams, defaultParams);
	if (!!params.latlng && !!params.latlng.lat && !!params.latlng.lng && !!params.reverseGeocoder) {
		return params.reverseGeocoder(params);
	} else {
		var Geocoder = _.find(_.values(params.GeocoderList), function(Geocoder){
			return Geocoder.match(params);
		});
		if(!!Geocoder) {
			return Geocoder.geocode(params);
		} else {
			if (!!params.defaultGeocoder) {
				return params.defaultGeocoder(params);
			} else {
				var result = {
					status: 'No_Result'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				return dfd.promise();
			}
		}
	}
}

var api = {
	geocode: geocode
};

module.exports = api;
},{"./ArcGISServerAdapter":2,"./Util":5}],4:[function(require,module,exports){
/* global _, $, google */
'use strict';
var Geocoder = require('./Geocoder');
var Util = require('./Util');
var ArcGISServerAdapter = require('./ArcGISServerAdapter');


/* this class is based on sample code USGSOverlay */
/** @constructor */
function ImageOverlay(bounds, image, map) {
	// Initialize all properties.
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;

	// Define a property to hold the image's div. We'll
	// actually create this div upon receipt of the onAdd()
	// method so we'll leave it null for now.
	this.div_ = null;

	// Explicitly call setMap on this overlay.
	this.setMap(map);
}
ImageOverlay.prototype = new google.maps.OverlayView();
/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
ImageOverlay.prototype.onAdd = function() {

	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';

	// Create the img element and attach it to the div.
	var img = document.createElement('img');
	img.src = this.image_;
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.position = 'absolute';
	div.appendChild(img);

	this.div_ = div;

	// Add the element to the "overlayLayer" pane.
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};

ImageOverlay.prototype.draw = function() {

	// We use the south-west and north-east
	// coordinates of the overlay to peg it to the correct position and size.
	// To do this, we need to retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	// Retrieve the south-west and north-east coordinates of this overlay
	// in LatLngs and convert them to pixel coordinates.
	// We'll use these coordinates to resize the div.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	// Resize the image's div to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
ImageOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

var map;
var overlays = [];
var globalConfigure;
var arcGISMapServices = [];
var previousBounds;
var infoWindow;


var init = function(initParams) {
	var defaultParams = {
		searchControlDivId: 'searchControl',
		orgLatitude: 49.764775,
		orgLongitude: -85.323214,
		orgzoomLevel: 5,
		defaultMapTypeId: google.maps.MapTypeId.ROADMAP,
		mapCanvasDivId: 'map_canvas',
		isCoordinatesVisible: true,
		coordinatesDivId: 'coordinates',
		minMapScale: 5,
		maxMapScale: 21,
		disallowMouseClick: false,
		searchInputBoxDivId: "map_query",
		maxQueryZoomLevel: 17,
		invalidFeatureLocations: [{
			lat: 0,
			lng: 0,
			differnce: 0.0001
		}],
		tableID: "myTable",
		tableWidth: 650, //The total width of the table below the map
		tableClassName: "tablesorter"

	};
	var params = _.defaults(initParams, defaultParams);
	globalConfigure = params;
	//search = params.search;
	$("#" + params.searchControlDivId).html(params.searchControlHTML);
	var center = new google.maps.LatLng(params.orgLatitude, params.orgLongitude);
	var mapOptions = {
		zoom: params.orgzoomLevel,
		center: center,
		scaleControl: true,
		streetViewControl: true,
		mapTypeId: params.defaultMapTypeId
	};
	map = new google.maps.Map($('#' + params.mapCanvasDivId)[0], mapOptions);

	/*bounds changed*/
	var boundsChangedHandler = function() {
		if(previousBounds) {
			var computeBoundsDifference = function(b1, b2) {
				return Math.abs(b1.getNorthEast().lat() - b2.getNorthEast().lat()) + Math.abs(b1.getNorthEast().lng() - b2.getNorthEast().lng()) + Math.abs(b1.getSouthWest().lat() - b2.getSouthWest().lat()) + Math.abs(b1.getSouthWest().lng() - b2.getSouthWest().lng());
			};
			if (computeBoundsDifference(map.getBounds(), previousBounds) < 0.000000001) {
				return;
			}
		}
		_.each(arcGISMapServices, function(arcGISMapService) {
			arcGISMapService.setMap(null);
		});
		var convertBounds = function(latLngBounds) {
			var latLngNE = latLngBounds.getNorthEast();
			var latLngSW = latLngBounds.getSouthWest();
			return {
				southWest: {lat: latLngSW.lat(), lng: latLngSW.lng()},
				northEast: {lat: latLngNE.lat(), lng: latLngNE.lng()}
			};
		};
		var googleBounds = map.getBounds();
		var bounds = convertBounds(googleBounds);
		var div = map.getDiv();
		var width = div.offsetWidth;
		var height = div.offsetHeight;
		var promises = _.map(params.mapServices, function(mapService) {
			var exportParams =  {
				bounds: bounds,
				width: width,
				height: height,
				mapService: mapService.url,
				visibleLayers: mapService.visibleLayers
			};
			return ArcGISServerAdapter.exportMap(exportParams);
		});
		$.when.apply($, promises).done(function() {
			arcGISMapServices = _.map(arguments, function(argument) {
				return new ImageOverlay(googleBounds, argument.href, map);
			});
		});
		previousBounds = googleBounds;
	};
	/*Check bounds change every second.*/
	setInterval(boundsChangedHandler,1000);
	/*bounds changed*/
	/*mouse move*/
	var	mouseMoveHandler = function(event) {
		if(params.isCoordinatesVisible){
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			var utm = Util.convertLatLngtoUTM(lat, lng);
			var utmLang =  (params.language === "EN") ? {
				UTM_ZoneLang: "UTM Zone",
				EastingLang: "Easting",
				NorthingLang: "Northing"
			} : {
				UTM_ZoneLang: "Zone UTM",
				EastingLang: "abscisse",
				NorthingLang: "ordonn\u00e9e"
			};
			$("#" + params.coordinatesDivId).html("Latitude:" + lat.toFixed(5) + ", Longitude:" + lng.toFixed(5) + " (" + utmLang.UTM_ZoneLang + ":" + utm.Zone + ", " + utmLang.EastingLang + ":" + utm.Easting + ", " + utmLang.NorthingLang +":" + utm.Northing + ")<br>");
		}
	};
	google.maps.event.addListener(map, 'mousemove', mouseMoveHandler);
	google.maps.event.trigger(map, 'mousemove', {latLng: center});
	/*mouse move*/
	/*zoom changed*/
	var zoom_changedHandler = function () {
		if (map.getZoom() > params.maxMapScale) {
			map.setZoom(params.maxMapScale);
		}
		if (map.getZoom() < params.minMapScale) {
			map.setZoom(params.minMapScale);
		}
	}	
	google.maps.event.addListener(map, 'zoom_changed', zoom_changedHandler);
	/*zoom changed*/
	/*mouse click*/
	var mouseClickHandler = function(event) {
		if (infoWindow) {
			infoWindow.setMap(null);
		}
		var gLatLng = event.latLng;
		var latlng = {lat: gLatLng.lat(), lng: gLatLng.lng()};
		var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
		var circle = Util.computeCircle(latlng, identifyRadiusZoomLevels[map.getZoom()]);
		var promises = _.map(params.identifyLayersList, function(layer) {
			var queryParams = {
				mapService: layer.mapService,
				layerID: layer.layerID,
				returnGeometry: false,
				outFields: layer.outFields,
				geometry: circle
			};
			return ArcGISServerAdapter.query(queryParams);
		});
		$.when.apply($, promises).done(function() {
			var featuresLength = Util.computerFeaturesNumber (arguments);
			if (featuresLength === 0) {
				infoWindow.setMap(null);
				return;
			}
			var info = params.computeIdentifyInfoWindows(arguments, globalConfigure);
			openInfoWindow(gLatLng, info);
		});		
	};	
	if (!params.disallowMouseClick) {
		google.maps.event.addListener(map, 'click', mouseClickHandler);
	}
	/*mouse click*/
};

var openInfoWindow = function (latlng, container){
	if (!infoWindow) {
		infoWindow = new google.maps.InfoWindow({
			content: container,
			position: latlng
		});
	} else {
		infoWindow.setContent(container);
		infoWindow.setPosition(latlng);
	}
	infoWindow.open(map);
};



var search = function() {
	var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
	if(searchString.length === 0){
		return;
	}
	var searchParams = globalConfigure.getSearchParams(searchString, globalConfigure);
	var queryLayers = function (searchParams) {
		_.each(overlays, function(overlay){
			overlay.setMap(null);
		});
		overlays = [];

		var queryParamsList = searchParams.queryParamsList;
		var options = searchParams.options;
		var promises = _.map(queryParamsList, function(queryParams) {
			var result = {
				mapService: queryParams.mapService,
				layerID: queryParams.layerID,
				returnGeometry: queryParams.returnGeometry,
				where: queryParams.where,
				outFields: queryParams.outFields		
			};
			if(options.withinExtent) {
				var getCurrentMapExtent = function () {
					var b = map.getBounds();
					var ne = b.getNorthEast();
					var sw = b.getSouthWest();
					var nLat = ne.lat();
					var eLng = ne.lng();
					var sLat = sw.lat();
					var wLng = sw.lng();
					var swLatLng = {lat: sLat, lng: wLng};
					var seLatLng = {lat: sLat, lng: eLng};
					var neLatLng = {lat: nLat, lng: eLng};
					var nwLatLng = {lat: nLat, lng: wLng};
					return [swLatLng, seLatLng, neLatLng, nwLatLng, swLatLng];
				};
				result.geometry = getCurrentMapExtent();
			}
			return ArcGISServerAdapter.query(result);
		});
		$.when.apply($, promises).done(function() {
			var featuresLength = Util.computerFeaturesNumber (arguments);
			if ((featuresLength === 0) && options.geocodeWhenQueryFail) {
				var geocodingParams = options.searchString;
				if (globalConfigure.hasOwnProperty('GeocoderList')) {
					geocodingParams = {
						GeocoderList: globalConfigure.GeocoderList,
						address: options.searchString
					};
				}
				var geocodePromise = geocode(geocodingParams);
				geocodePromise.done(function(result){
					console.log(result);
				});
				return;
			}
			var splitResults = function(results, invalidFeatureLocations) {
				var filterResults = function (results, invalidFeatureLocations, f) {
					var returnedResults = [];
					_.each(results, function(result) {
						var clone = _.clone(result);
						clone.features = _.filter(result.features, function (feature) {
							return f(_.some(invalidFeatureLocations, function(location) {
								return Math.abs(location.lng - feature.geometry.x) + Math.abs(location.lat - feature.geometry.y) > location.difference;
							}));
						});
						returnedResults.push(clone);
					});
					return returnedResults;
				};
				return {validResults: filterResults(results, invalidFeatureLocations, function(input) {return !input;}),
						invalidResults: filterResults(results, invalidFeatureLocations, function(input) {return input;})};
			};
			var splittedResults = splitResults(arguments, globalConfigure.invalidFeatureLocations);
			var validResults = splittedResults.validResults;
			var invalidResults = splittedResults.invalidResults;
			var validFeaturesLength = Util.computerFeaturesNumber(validResults);
			var invalidFeaturesLength = Util.computerFeaturesNumber(invalidResults);
			var validTable = globalConfigure.computeValidResultsTable(validResults, globalConfigure);
			var invalidTable = globalConfigure.computeInvalidResultsTable(invalidResults, globalConfigure);
			console.log(validTable);

			var markers = globalConfigure.generateSearchResultsMarkers(validResults, globalConfigure);
			_.each(markers, function(marker){
				marker.setMap(map);
				overlays.push(marker);
			});

			if(!options.withinExtent) {
				var convertToGBounds = function(b) {
					var sw = new google.maps.LatLng(b.southWest.lat, b.southWest.lng);
					var ne = new google.maps.LatLng(b.northEast.lat, b.northEast.lng);			 
					var bounds = new google.maps.LatLngBounds(sw, ne);
					return bounds;
				};
				var bounds = convertToGBounds(Util.computePointsBounds(_.map(Util.combineFeatures(validResults), function(feature) {
					return {lng: feature.geometry.x, lat: feature.geometry.y};
				})));
				_.each(arcGISMapServices, function(arcGISMapService) {
					arcGISMapService.setMap(null);
				});
				map.fitBounds(bounds);
				var maxQueryZoomLevel = globalConfigure.maxQueryZoomLevel;
				if (map.getZoom() > maxQueryZoomLevel) {
					map.setZoom(maxQueryZoomLevel);
				}
			}
		});	
	};	
	queryLayers(searchParams);
};



var geocode = function(input) {
	var geocodeParams = {};
	if (input.hasOwnProperty('lat') && input.hasOwnProperty('lng')) {
		var reverseGeocoder = function(params) {
			var dfd = new $.Deferred();
			var Geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(input.lat, input.lng);
			Geocoder.geocode({'latLng': latlng}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						var result = {
							address: results[1].formatted_address,
							latlng: params.latlng,
							status: 'OK'
						};
						dfd.resolve(result);
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				} else {
					dfd.resolve({status: 'No_Result'});
				}
			});
			return dfd.promise();
		};
		geocodeParams = {
			latlng: input,
			reverseGeocoder: reverseGeocoder
		};
	} else if (typeof input === 'string') {
		var defaultGeocoder = function(params) {
			var dfd = new $.Deferred();			
			if (params.address.toUpperCase() === "ONTARIO") {
				var result = {
					status: 'No_Result'
				};
				dfd.resolve(result);
			} else {
				//Private method: test whether the input ends with region names.
				var regionAddressProcess = function(addressStr, defaultRegionNames){
					var isAddressEndsWithRegionName = function(address, str) {
						if (address.length > str.length + 1) {
							var substr = address.substring(address.length - str.length - 1);
							if (substr === (" " + str) || substr === ("," + str)) {
								return true;
							}
						}
						return false;
					};					
					var address = addressStr.toUpperCase();
					var res = _.some(defaultRegionNames, function(regionName) {
						return isAddressEndsWithRegionName(address, regionName);
					});
					if(!res){
						return addressStr + " Ontario";
					}
					return addressStr;
				};

				var Geocoder = new google.maps.Geocoder();
				Geocoder.geocode({
					'address': regionAddressProcess(params.address, params.defaultRegionNames)
				}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						var geocodeResult = _.find(results, function(result){
							var point = result.geometry.location;
							var failedPositions = _.filter(params.failedLocation.positions, function(position) {
								return ((Math.abs(point.lat() - position[0]) + Math.abs(point.lng() - position[1])) < params.failedLocation.difference);
							});
							return (failedPositions.length === 0) && (params.validateLatLngInPolygon({lat: point.lat(), lng: point.lng()}, params.regionBoundary));
						});
						if (geocodeResult) {
							var point = geocodeResult.geometry.location;
							var result = {
								latlng: {
									lat: point.lat(),
									lng: point.lng()
								},
								address: params.address,
								geocodedAddress: geocodeResult.formatted_address.toString(),
								status: 'OK'
							};
							dfd.resolve(result);
						} else {
							dfd.resolve({status: 'No_Result'});
						}
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				});
			}
			return dfd.promise();
		};
		geocodeParams = {
			address: input,
			defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
			failedLocation: {
				positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
				difference: 0.00001
			},
			defaultGeocoder: defaultGeocoder
		};
	} else if (input.hasOwnProperty('GeocoderList') && input.hasOwnProperty('address')) {
		geocodeParams = {
			address: input.address,
			GeocoderList: input.GeocoderList
		};
	}
	return Geocoder.geocode(geocodeParams);
};

/*
	Usage: Add the polylines overlays on the map. If the LOCATOR module return the result for Township with/without 
	Lot and Concession, the related polygons will be add to Google Maps by this method. 
	Called by: queryLayerWithPointBuffer 
*/		
var createPolylines = function (rings, strokeOptions){
	return _.map(rings, function(ring) {
		return new google.maps.Polyline({    
			path: _.map(ring, function(pt) {
				return new google.maps.LatLng(pt[1], pt[0]);
			}),
			strokeColor: strokeOptions.color,    
			strokeOpacity: strokeOptions.opacity,   
			strokeWeight: strokeOptions.weight,
			geodesic: false
		});
	});
};

/*
	Usage: Create a marker on a location with pop up content and used icon. 
	Called by: queryLayerWithPointBuffer.
	Rely on: map, openInfoWindow function.  
*/	
/*var createMarker = function (latlng, popupContent, icon) {
	var gLatLng = new google.maps.LatLng(latlng.lat, latlng.lng);
	var marker = new google.maps.Marker({
		position: gLatLng,
		icon: icon
	});
	(function (popupContent, marker) {
		google.maps.event.addListener(marker, 'click', function () {
			MOEMAP.openInfoWindow(marker.getPosition(), popupContent);
		});
	})(popupContent, marker);
	return marker;
};*/



var entsub = function(event){
	if (event && event.which === 13){
		search();
	}else{
		return true;
	}
};
var searchChange = function () {};
var api = {
	init: init,
    geocode: geocode,
    createPolylines: createPolylines,
	search: search,
	entsub: entsub,
	searchChange: searchChange,
	openInfoWindow: openInfoWindow
};

module.exports = api;
},{"./ArcGISServerAdapter":2,"./Geocoder":3,"./Util":5}],5:[function(require,module,exports){
/* global _ */
'use strict';

var EARTH_RADIUS = 6378137; // in meter

var toRad = function (degree) {
	return degree * Math.PI / 180;
};

var toDegree = function (rad) {
	return rad * 180 / Math.PI;
};

var computeOffset = function(latlng, radius, heading) {
	var distRad = radius/EARTH_RADIUS;
	var headingRad = toRad(heading);
	var latRad = toRad(latlng.lat);
	var cosDist = Math.cos(distRad);
	var sinDist = Math.sin(distRad);
	var cosLat = Math.cos(latRad);
	var sinLat = Math.sin(latRad);
	var sc = cosDist * sinLat + sinDist * cosLat * Math.cos(headingRad);
	var lat = toDegree(Math.asin(sc));
	var dlng = Math.atan2(sinDist*cosLat*Math.sin(headingRad), cosDist - sinLat * sc);
	var lng = toDegree(toRad(latlng.lng) - dlng);
	return {lat: lat, lng: lng};
};

var computeCircle = function (latlng, radius) {
	return _.map(_.range(0, 361, 10), function(heading) {
		return computeOffset(latlng, radius, heading);
	});
};

var computeDistance = function (fromLatlng, toLatlng) {
	var lat1 = toRad(fromLatlng.lat);
	var lng1 = toRad(fromLatlng.lng);
	var lat2 = toRad(toLatlng.lat);
	var lng2 = toRad(toLatlng.lng);
	var d = EARTH_RADIUS*Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lng1 - lng2));
	return d;
};

var computePointsBounds = function (latlngs){
	var getLat = function(latlng){ return latlng.lat;};
	var getLng = function(latlng){ return latlng.lng;};
	return {
		southWest: {lat: _.min(latlngs, getLat).lat, lng: _.min(latlngs, getLng).lng},
		northEast: {lat: _.max(latlngs, getLat).lat, lng: _.max(latlngs, getLng).lng}
	};
};

var computeClusters = function (features){
	var size = features.length;
	var groups = _.groupBy(features, function(feature) {
		return '' + feature.latlng.lat.toFixed(6) + ':' + feature.latlng.lng.toFixed(6);
	});
	var keys = _.keys(groups);
	var values = _.values(groups);	
	return _.map(_.range(keys.length), function(index) {
		var key = keys[index].split(':');
		var latlng = {lat: parseFloat(key[0]), lng: parseFloat(key[1])};
		return {latlng: latlng, list: values[index]};
	});
};

var convertLatLngtoUTM = function(lat, lng) {
	var pi = 3.14159265358979; //PI
	var a = 6378137; //equatorial radius for WGS 84
	var k0 = 0.9996; //scale factor
	var e = 0.081819191; //eccentricity
	var e_2 = 0.006694380015894481; //e'2
	var A0 = 6367449.146;
	var B0 = 16038.42955;
	var C0 = 16.83261333;
	var D0 = 0.021984404;
	var E0 = 0.000312705;

	var zone = 31 + Math.floor(lng / 6);
	var lat_r = lat * pi / 180.0;
	var t1 = Math.sin(lat_r); // SIN(LAT)
	var t2 = e * t1 * e * t1;
	var t3 = Math.cos(lat_r); // COS(LAT)
	var t4 = Math.tan(lat_r); // TAN(LAT)
	var nu = a / (Math.sqrt(1 - t2));
	var S = A0 * lat_r - B0 * Math.sin(2 * lat_r) + C0 * Math.sin(4 * lat_r) - D0 * Math.sin(6 * lat_r) + E0 * Math.sin(8 * lat_r);
	var k1 = S * k0;
	var k2 = nu * t1 * t3 * k0 / 2.0;
	var k3 = ((nu * t1 * t2 * t2 * t2) / 24) * (5 - t4 * t4 + 9 * e_2 * t3 * t3 + 4 * e_2 * e_2 * t3 * t3 * t3 * t3) * k0;
	var k4 = nu * t3 * k0;
	var k5 = t3 * t3 * t3 * (nu / 6) * (1 - t4 * t4 + e_2 * t3 * t3) * k0;

	//var lng_r = lng*pi/180.0;
	var lng_zone_cm = 6 * zone - 183;
	var d1 = (lng - lng_zone_cm) * pi / 180.0;
	var d2 = d1 * d1;
	var d3 = d2 * d1;
	var d4 = d3 * d1;

	var x = 500000 + (k4 * d1 + k5 * d3);
	var rawy = (k1 + k2 * d2 + k3 * d4);
	var y = rawy;
	if (y < 0) {
		y = y + 10000000;
	}
	var res = {
		Zone: zone,
		Easting: x.toFixed(0),
		Northing: y.toFixed(0)
	};
	return res;
};
/**
 * Replace the char A with char B in a String. 
 *
 * @param {str} The string to be processed.
 * @param {charA} the char to be replaced.
 * @param {charB} the char to replace.
 * @return {String} An ojbect sendt to Geocoder.
 **/
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

var wordCapitalize = function (str){
	var strArray = str.trim().split(' ');
	for(var i=0; i < strArray.length; i++) {
		strArray[i] = strArray[i].substring(0,1).toUpperCase() + strArray[i].substring(1,strArray[i].length).toLowerCase();
	}
	return strArray.join(' ');
};

var computerFeaturesNumber = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total = total + layer.features.length;
		} else {
			return total;
		}
	}, 0);
};

var combineFeatures = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total = total.concat (layer.features);
		} else {
			return total;
		}
	}, []);
};


var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters,
	convertLatLngtoUTM: convertLatLngtoUTM,
	replaceChar: replaceChar,
	wordCapitalize: wordCapitalize,
	computerFeaturesNumber: computerFeaturesNumber,
	combineFeatures: combineFeatures
};

module.exports = api;
},{}]},{},[1]);
