(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global _, $, google */
'use strict';
var geocoder = require('./geocoder');

var geocode = function(input) {
	var geocodeParams = {};
	if (input.hasOwnProperty('lat') && input.hasOwnProperty('lng')) {
		var reverseGeocoder = function(params) {
			var dfd = new $.Deferred();
			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(input.lat, input.lng);
			geocoder.geocode({'latLng': latlng}, function(results, status) {
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
	} else {
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

				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
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
	}
	return geocoder.geocode(geocodeParams);
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

var getIdentifyRadius = function(zoomLevel) {
	var identifyRadiusZoomLevelList = {
		21 : 0.001,
		20 : 0.001,
		19 : 0.002,
		18 : 0.003,
		17 : 0.005,
		16 : 0.01,
		15 : 0.02,
		14 : 0.05,
		13 : 0.08,
		12 : 0.16,
		11 : 0.3,
		10 : 0.6,
		9  : 1.2,
		8  : 2.4,
		7  : 4.8,
		6  : 9.6,
		5  : 20,
		4  : 40,
		3  : 80,
		2  : 160,
		1  : 320
	};
	return identifyRadiusZoomLevelList[zoomLevel] * 1000; // in meters
};
var api = {
    geocode: geocode,
    getIdentifyRadius: getIdentifyRadius, 
    createPolylines: createPolylines
};

module.exports = api;
},{"./geocoder":4}],2:[function(require,module,exports){
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

var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters
};

module.exports = api;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
/* global _, $ */

'use strict';
var agsQuery = require('./agsQuery');

var regIsFloat = /^(-?\d+)(\.\d+)?$/,
/**
 * Replace the char A with char B in a String. 
 *
 * @param {str} The string to be processed.
 * @param {charA} the char to be replaced.
 * @param {charB} the char to replace.
 * @return {String} An ojbect sendt to geocoder.
 **/
	replaceChar = function (str, charA, charB) {
		var temp = [];
		temp = str.split(charA);
		var result = temp[0];
		if (temp.length >= 2) {
			for (var i = 1; i < temp.length; i++) {
				result = result + charB + temp[i];
			}
		}
		return result;
	},
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
		return agsQuery.query(queryParams).then(processResults);
	},
	geocoderList = {
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
 * @return {object} An ojbect sendt to geocoder.
 */
function geocode(initParams) {
	var defaultParams = {
		//address: address, 
		geocoderList: (!!initParams.geocoderList) ? _.defaults(initParams.geocoderList, geocoderList) : geocoderList,
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
		 * @return {object} An ojbect sendt to geocoder.
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
		var geocoder = _.find(_.values(params.geocoderList), function(geocoder){
			return geocoder.match(params);
		});
		if(!!geocoder) {
			return geocoder.geocode(params);
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
},{"./agsQuery":3}],5:[function(require,module,exports){
/* global describe, it, expect */
var googleMapsAdapter = require('../../app/scripts/GoogleMapsAdapter');
var geocoder = require('../../app/scripts/geocoder');

(function () {
    'use strict';

	describe('Google Maps Adapter', function () {
		describe('Google Maps Geocoder can reverse a latitude, longitude to address', function () {
			it('should reverse geocode a latitude, longitude to an address', function (done) {				
				var geocodePromise = googleMapsAdapter.geocode({lat: 43.71091,lng: -79.54182});
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(result.address).to.equal('Etobicoke, ON M9P 3V6, Canada');
					done();
				});
			});
		});

		describe('Google Maps Geocoder can geocode an address', function () {
			it('should geocode an address', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('125 Resources Rd, Toronto, Ontario');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
			it('should geocode an address without province name', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('125 Resources Rd, Toronto');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
			it('should geocode an address without province name', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('M9P 3V6');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
		});

	    describe('Google Maps Adapter can create an array of Google Maps polylines with rings from ArcGIS server ', function () {
	        this.timeout(150000);
	        it('should create polylines', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					var strokeOptions = {
						color: '#8583f3',
						opacity: 1, 
						weight: 4
					};
					var polylines = googleMapsAdapter.createPolylines(result.geometry[0].rings, strokeOptions);
					expect(polylines).to.have.length(1);
					done();
				});
	        });
	    });
	});
})();

},{"../../app/scripts/GoogleMapsAdapter":1,"../../app/scripts/geocoder":4}],6:[function(require,module,exports){
/* global describe, it, expect */
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('Util', function () {
	    describe('Util calculate the distance in meters between two points on the Earth Surface', function () {
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = {lat: 46, lng: -77};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 111319.49)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46, lng: -77};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 77328.50819644716)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46.5, lng: -77.5};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 67671.25839256)).to.be.below(1);
	        });
	    });
	    describe('Util calculate the offset location on the Earth Surface', function () {
	        it('should calculate the offset location in the North on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 0);
			    expect(Math.abs(latlng2.lat - 45.8983153)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the East on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 270);
			    expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-75.729694418))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the South on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 180);
			    expect(Math.abs(latlng2.lat - 44.101684716)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the West on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 90);
				expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-78.2703055823))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in any direction on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 330);
				expect(Math.abs(latlng2.lat - 45.7761709351)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-76.35602524215))).to.be.below(0.0001);
	        });
	    });
	    describe('Util create a circle on the Earth with a center and radius in meter', function () {
	        it('should create a circle on the Earth', function () {
	            var latlng = {lat: 45.008284, lng: -77.184177};
	            var circle = Util.computeCircle(latlng, 1000);
	            expect(circle).to.have.length(37);
	            for (var i = 0; i <= 36; i++) {
					expect(Math.abs(Util.computeDistance(latlng, circle[i]) - 1000)).to.be.below(0.01);
				}
	        });
	    });
	    describe('Util compute the bound for an array of latlng', function () {
	        it('should compute the bound', function () {
	            var latlngs = [{lat: 45.008284, lng: -77.184177}, {lat: 44.008284, lng: -79.184177}, {lat: 46.008284, lng: -73.184177}];
	            var bounds = Util.computePointsBounds(latlngs);
				expect(Math.abs(bounds.southWest.lat - 44.008284)).to.be.below(0.0001);
				expect(Math.abs(bounds.southWest.lng - (-79.184177))).to.be.below(0.0001);
				expect(Math.abs(bounds.northEast.lat - 46.008284)).to.be.below(0.0001);
				expect(Math.abs(bounds.northEast.lng - (-73.184177))).to.be.below(0.0001);
	        });
	    });
	    describe('Util compute the clusters for an array of features', function () {
	        it('should compute the clusters', function () {
				var features = [{latlng: {lat: 45, lng: -77}, attributes: {attr: "test"}}, {latlng: {lat: 45, lng: -77}, attributes: {attr: "test"}}, {latlng: {lat: 45.008284, lng: -77.184177}, attributes: {attr: "test"}}, {latlng: {lat: 44.008284, lng: -79.184177}, attributes: {attr: "test"}}];
	            var clusters = Util.computeClusters(features);
				expect(clusters).to.have.length(3);
	        });
	    });
    });
})();

},{"../../app/scripts/Util":2}],7:[function(require,module,exports){
/* global describe, it, expect, _, $ */
var agsQuery = require('../../app/scripts/agsQuery');
var geocoder = require('../../app/scripts/geocoder');
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('agsQuery', function () {
	    describe('agsQuery can query an ArcGIS Server layer', function () {
	        this.timeout(150000);
	        it('should query the Geographic Township layer', function (done) {
	            var queryParams = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					returnGeometry: true,
					where: 'OFFICIAL_NAME_UPPER = \'ABINGER\'',
					outFields: ['SHAPE_Area', 'CENX', 'CENY']
				};
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should query the Geographic Township layer with a polygon', function (done) {
	            var queryParams = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					returnGeometry: true,
					geometry: [{lat: 45.011,lng: -77.203},{lat: 45.003,lng: -77.17},{lat: 44.967,lng: -77.194}],
					outFields: ['SHAPE_Area', 'CENX', 'CENY', 'OFFICIAL_NAME_UPPER']
				};
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features[0].attributes.OFFICIAL_NAME_UPPER).to.equal('ABINGER');
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should geocode an address and query two layers', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.then(function(result) {
					if(result.status === 'OK'){
						var geometry = Util.computeCircle(result.latlng, 100);
						var queryParamsList = [{
							mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
							layerID: 0,
							returnGeometry: true,
							geometry: geometry,
							outFields: ['SHAPE_Area', 'CENX', 'CENY', 'OFFICIAL_NAME_UPPER']
						},{
							mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
							layerID: 1,
							returnGeometry: true,
							geometry: geometry,
							outFields: ['SHAPE_Area', 'CENX', 'CENY', 'GEOG_TWP', 'LOT_NUM', 'CONCESSION']
						}];
						var promises = _.map(queryParamsList, function(queryParams) {
							return agsQuery.query(queryParams);
						});
						$.when.apply($, promises).done(function() {
							expect(arguments[0].features[0].attributes.OFFICIAL_NAME_UPPER).to.equal('ABINGER');
							expect(arguments[1].features[0].attributes.GEOG_TWP).to.equal('ABINGER');
							done();
						});
					} else {
						return result;
					}
				});
	        });
	    });
	    describe('agsQuery can query the Sport Fish layer', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var queryParams = {
					mapService: sportfishMapService,
					layerID: 0,
					returnGeometry: true,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
				};
				queryParams.where = 'UPPER(LOCNAME_EN) LIKE \'%SIMCOE%\'';
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should query the species name for the sport fish layer', function (done) {
				var queryParams = {
					mapService: sportfishMapService,
					layerID: 0,
					returnGeometry: true,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
				};
				queryParams.where = 'SPECIES_EN LIKE \'%SALMON%\'';
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(49);
					done();
				});
	        });
	        it('should geocode an address and query the sport fish layers', function (done) {
				var geocodeParams = {address: '45.42172, -80.60663'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.then(function(result) {
					if(result.status === 'OK'){
						var queryParams = {
							mapService: sportfishMapService,
							layerID: 0,
							returnGeometry: true,
							outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
						};
						queryParams.geometry = Util.computeCircle(result.latlng, 100);
						var queryPromise = agsQuery.query(queryParams);
						queryPromise.done(function (fset) {
							expect(fset.features).to.have.length(1);
							done();
						});
					} else {
						return result;
					}
				});
	        });
	    });
	    describe('agsQuery can export the Sport Fish map', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var exportParams = {
					bounds: {
						southWest: {lat: 43.79307911819258,lng: -80.0613751},
						northEast: {lat: 43.845099793116404,lng: -78.74301580346679}
					},
					width: 1920,
					height: 105,
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish/MapServer',
					visibleLayers: [0, 1, 2]
				};
				var exportMapPromise = agsQuery.exportMap(exportParams);
				exportMapPromise.done(function (result) {
					expect(result.width).to.equal(1920);
					expect(result.height).to.equal(105);
					done();
				});
	        });
	    });
    });
})();

},{"../../app/scripts/Util":2,"../../app/scripts/agsQuery":3,"../../app/scripts/geocoder":4}],8:[function(require,module,exports){
/* global describe, it, expect, $ */
var geocoder = require('../../app/scripts/geocoder');

(function () {
    'use strict';

    describe('Geocoder', function () {
        describe('Geocoder can parse a string containing decimal latitude and longitude in Ontario', function () {
			it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43.71702, -79.54158'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
			});

            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '-79.54158, 43.71702'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with positive longitude', function (done) {
				var geocodeParams = {address: '43.71702, 79.54158'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '43.19040, -77.57275'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using degree, minute, second symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using DMS symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43d42m37.05s, 79d32m28.92s'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '79d32m28.92s, 43d42m37.05s'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40d42m37.05s, 79d32m28.92s'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });
        describe('Geocoder can parse a string containing UTM coordinates in Ontario', function () {
            it('should parse the UTM coordinate within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate with reverse order within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in Ontario', function (done) {
				var geocodeParams = {address: '17, 4840730.67, 617521.28'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 18 in Ontario', function (done) {
				var geocodeParams = {address: '18, 517468, 5019950'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.33284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-74.77707))).to.be.below(0.0001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 15 in Ontario', function (done) {
				var geocodeParams = {address: '15, 412541, 5503272'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 49.67563)).to.be.below(0.0001);
					expect(Math.abs(result.latlng.lng - (-94.21223))).to.be.below(0.0001);
					done();
				});
            });
            it('should not parse the UTM coordinate outside Ontario', function (done) {
				var geocodeParams = {address: '17, 333050, 4920558'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });
	    describe('Geocoder can parse a string containing Geographic Township name in Ontario', function () {
	        this.timeout(150000);
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township with French keyword in Ontario', function (done) {
				var geocodeParams = {address: 'Canton Abinger'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger TWP'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger Township'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township with multiple polygons in Ontario', function (done) {
				var geocodeParams = {address: 'Gibson Township'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 44.9980573)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.8036325))).to.be.below(0.001);
					expect(result.geometry).to.have.length(11);
					done();
				});
	        });
	        it('should not parse the wrong Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'Apple Township'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
	        });
	    });
	    describe('Geocoder can parse a string containing Geographic Township name with Lot and Concession in Ontario', function () {
	        this.timeout(150000);
	        it('should parse the Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger TWP, Lot 8, Con 14'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession with French keyword in Ontario', function (done) {
				var geocodeParams = {address: 'Canton Abinger, Lot 8, Con 14'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Concession and Lot in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger TWP, Con 14, Lot 8'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger Township, Lot 8, Con 14'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should parse the Geographic Township with multiple polygons in Ontario', function (done) {
				var geocodeParams = {address: 'North Crosby Township, Lot 1, Con 9'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 44.610877)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-76.3844359))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should not parse the wrong Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Apple Township, Lot 1, Con 2'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
	        });
	    });
	    describe('Geocoder can parse a string with geocoder provided by caller', function () {
	        it('should parse the dummy address with the provided dummy geocoder', function (done) {
	            var geocoderList = {
					'DummyGeocoder' : {
						'match': function (params) {
							return params.address === 'Dummy address';
						},
						'geocode': function (params) {
							var result = {
								latlng: {lat: 45.067567,lng: -77.16453},
								address: params.address,
								status: 'OK'
							};
							var dfd = new $.Deferred();
							setTimeout(function() {
								dfd.resolve(result);
							}, 1);
							return dfd.promise();
						}
					}
				};
				var geocodeParams = {
					address: 'Dummy address',
					geocoderList: geocoderList
				};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	    });
	    describe('Geocoder can reverse a latitude, longitude to address with a reverse geocoder provided by caller', function () {
	        it('should reverse geocode a latitude, longitude to an address', function (done) {
	            var reverseGeocoder = function(params) {
					var result = {
						address: 'Dummy address',
						latlng: params.latlng,
						status: 'OK'
					};
					var dfd = new $.Deferred();
					setTimeout(function() {
						dfd.resolve(result);
					}, 1);
					return dfd.promise();
	            };
				var geocodeParams = {
					latlng:{lat: 45.067567,lng: -77.16453},
					reverseGeocoder: reverseGeocoder
				};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(result.address).to.equal('Dummy address');
					done();
				});
	        });
	    });

	    describe('Geocoder can use default geocoder provided by caller if no pattern match can be made', function () {
	        it('should geocode an address with provided default geocoder', function (done) {
	            var defaultGeocoder = function(params) {
					var result = {
						latlng:{lat: 45.067567,lng: -77.16453},
						address: params.address,
						status: 'OK'
					};
					var dfd = new $.Deferred();
					setTimeout(function() {
						dfd.resolve(result);
					}, 1);
					return dfd.promise();
	            };
				var geocodeParams = {
					address: 'Dummy address',
					defaultGeocoder: defaultGeocoder
				};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	    });
    });
})();

},{"../../app/scripts/geocoder":4}]},{},[5,6,7,8]);