(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{"./ArcGISServerAdapter":1,"./Util":4}],3:[function(require,module,exports){
/* global _, $, google, goog, yepnope */
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
var marker;

var clear = function () {
	if (infoWindow) {
		infoWindow.setMap(null);
	}
	if (marker) {
		marker.setMap(null);
	}
	if (overlays) {
		_.each(overlays,function (overlay) {
			overlay.setMap(null);	
		});
	}
	$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
	$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
	$("#" + globalConfigure.queryTableDivId).html('');
	$('#' + globalConfigure.informationDivId).html(globalConfigure.searchHelpText);
	var center = new google.maps.LatLng(globalConfigure.orgLatitude, globalConfigure.orgLongitude);
	map.setCenter(center);
	map.setZoom(globalConfigure.orgzoomLevel);
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

var closeInfoWindow = function (){
	if (infoWindow) {
		infoWindow.setMap(null);
	}
};

var queryLayers = function (searchParams) {
	var queryParamsList = searchParams.queryParamsList;
	//var options = searchParams.options;
	var promises = _.map(queryParamsList, function(queryParams) {
		var result = {
			mapService: queryParams.mapService,
			layerID: queryParams.layerID,
			returnGeometry: queryParams.returnGeometry,
			where: queryParams.where,
			outFields: queryParams.outFields		
		};
		if (queryParams.hasOwnProperty('geometry')) {
			result.geometry = queryParams.geometry;
		}
		return ArcGISServerAdapter.query(result);
	});
	return $.when.apply($, promises);
};

var geocode = function(input) {
	var geocodeParams = {};
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
			defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
			failedLocation: {
				positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
				difference: 0.00001
			},			
			GeocoderList: input.GeocoderList,
			defaultGeocoder: defaultGeocoder
		};
	}
	return Geocoder.geocode(geocodeParams);
};


var init = function(initParams) {
	var globalConfigLanguage = {
		'EN': {
			SearchInteractiveMapFormLang: 'Search interactive map form',
			SearchInteractiveMapLang: 'Search the map',
			SearchLang: 'Search',
			TermLang: 'Term',
			InputBoxSizeLang: '415px',
			degreeSymbolLang: '&deg;',
			selectTooltip: 'Select',
			UTM_ZoneLang: 'UTM Zone',
			EastingLang: 'Easting',
			NorthingLang: 'Northing',
			noResultFoundMsg: 'Your search returned no result. Please refine your search.',
			searchCenterLang: 'Search center',
			searchRadiusLang: 'search radius',
			searchKMLang: 'KM',
			totalFeatureReturnedLang: 'Total features returned',
			only1DisplayedLang: ', only 1 is displayed.',
			westSymbolLang: 'W',
			distanceLang: 'Distance (KM)',
			searchingLang: 'Searching for results...',
			inGobalRegionLang: 'in Ontario',
			inCurrentMapExtentLang: 'in the current map display',
			forLang: 'for',
			yourSearchLang: 'Your search',
			returnedNoResultLang: 'returned no result',
			pleaseRefineSearchLang: 'Please refine your search',
			oneResultFoundLang: '1 result found',
			moreThanLang: 'More than',
			resultsFoundLang: 'results found',
			onlyLang: 'Only',
			returnedLang: 'returned',
			seeHelpLang: 'See help for options to refine your search',
			InformationLang: 'Information',
			CurrentMapDisplayLang: 'Search current map display only',
			CurrentMapDisplayTitleLang: 'Current Map Display: Limit your search to the area displayed',
			distanceFieldNote: 'The Distance(KM) column represents the distance between your search location and the permit location in the specific row.',
//			noCoordinatesTableTitleLang: 'The following table contains the records without valid coordinates. <a href=\'#WhyAmISeeingThis\'>Why am I seeing this?</a>',
			//whyAmISeeingThisLang: '<a id=\'WhyAmISeeingThis\'><strong>Why am I seeing this?</strong></a><br>The map locations shown as points have been determined by using addresses or other information to calculate a physical location on the map.  In some cases, the information needed to calculate a location was incomplete, incorrect or missing.  The records provided in the table have been included because there is a close match on the name or city/town or other field(s). These records may or may not be near your specified location, and users are cautioned in using these records. They have been included as potential matches only.',
			ThisResultDoesNotHaveValidCoordinates: 'This result does not have valid coordinates.',
			AmongReturnedResults: 'Among returned results',
			ResultDoesNotHaveValidCoordinates: ' result does not have valid coordinates.',
			ResultsDoNotHaveValidCoordinates: ' results do not have valid coordinates.',
			youMaySearchByLang: 'You may search by ',
			seeHelpForAdvancedOptionsLang: 'or see help for advanced options.'
		},
		'FR': {
			SearchInteractiveMapFormLang: 'Recherche carte interactive forme',
			SearchInteractiveMapLang: 'Recherche dans la carte interactive',
			SearchLang: 'Recherche',
			TermLang: 'Terme',
			InputBoxSizeLang: '450px',
			degreeSymbolLang: '&deg;',
			selectTooltip: 'Choisir',
			UTM_ZoneLang: 'Zone UTM',
			EastingLang: 'abscisse',
			NorthingLang: 'ordonn\u00e9e',
			noResultFoundMsg: 'Votre recherche n\'a produit aucun r\u00e9sultat. Veuillez affiner la recherche.',
			searchCenterLang: 'Cercle de recherche',
			searchRadiusLang: 'rayon de recherche',
			searchKMLang: 'km',
			totalFeatureReturnedLang: 'Nombre total de r\u00e9sultats',
			only1DisplayedLang: ', only 1 is displayed.',
			westSymbolLang: 'O',
			distanceLang: 'Distance (en km)',
			searchingLang: 'Recherche des r\u00e9sultats ...',
			inGobalRegionLang: 'en Ontario',
			inCurrentMapExtentLang: 'dans l\'affichage actuel de la carte',
			forLang: 'pour',
			yourSearchLang: 'Votre recherche',
			returnedNoResultLang: 'n\'a donn\u00e9 aucun r\u00e9sultat',
			pleaseRefineSearchLang: 'S\'il vous plait affiner votre recherche',
			oneResultFoundLang: '1 r\u00e9sultat',
			moreThanLang: 'Plus de',
			resultsFoundLang: 'r\u00e9sultats',
			onlyLang: 'Seulement',
			returnedLang: 'retourn\u00e9s',
			seeHelpLang: 'Consulter l\'aide pour affiner votre recherche',
			//disclaimerLang: '<p>Ce site web et toute l&rsquo;information qu&rsquo;il contient sont fournis sans garantie quelconque, expr&egrave;s ou tacite. <a href=\'/environment/fr/resources/collection/data_downloads/STDPROD_078138.html\'>Voir l&rsquo;avis de non-responsabilit&eacute;</a>.</p>';
			InformationLang: 'Information',
			CurrentMapDisplayLang: '\u00c9tendue de la carte courante',
			CurrentMapDisplayTitleLang: 'Afficher la carte : Limiter la recherche \u00e0 la carte donn\u00e9e.',
			distanceFieldNote: 'La colonne de distance (en km) donne la distance entre le lieu de votre recherche et le lieu du puits dans la rang\u00e9e donn\u00e9e.',
//			noCoordinatesTableTitleLang: 'Le tableau suivant contient des données sans coordonnées valides.  <a href=\'#WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a>',
//			whyAmISeeingThisLang: '<a id=\'WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a><br>Les lieux indiqués par des points sur la carte ont été déterminés en fonction d’adresses ou d’autres renseignements servant à calculer un emplacement physique sur la carte. Dans certains cas, ces renseignements étaient incomplets, incorrects ou manquants. Les données fournies dans le deuxième tableau ont été incluses, car il y a une correspondance étroite avec le nom de la ville ou d’autre champ. Ces données peuvent ou non être proches du lieu précisé, et on doit les utiliser avec prudence. Elles ont été incluses seulement parce qu’il peut y avoir une correspondance.',
			ThisResultDoesNotHaveValidCoordinates: 'This result does not have valid coordinates.',
			AmongReturnedResults: 'Parmi les résultats obtenus',
			ResultDoesNotHaveValidCoordinates: ' résultat n’a pas de coordonnées valides.',
			ResultsDoNotHaveValidCoordinates: ' résultats n’ont pas de coordonnées valides.',
			youMaySearchByLang: 'Vous pouvez rechercher par ',
			seeHelpForAdvancedOptionsLang: 'ou consulter l\'aide pour de l\'information sur les recherches avanc&eacute;es.',
			dataTableLang: {
				'sProcessing':     'Traitement en cours...',
				'sSearch':         'Rechercher&nbsp;:',
				'sLengthMenu':     'Afficher _MENU_ &eacute;l&eacute;ments',
				'sInfo':           'Affichage de l\'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments',
				'sInfoEmpty':      'Affichage de l\'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments',
				'sInfoFiltered':   '(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)',
				'sInfoPostFix':    '',
				'sLoadingRecords': 'Chargement en cours...',
				'sZeroRecords':    'Aucun &eacute;l&eacute;ment &agrave; afficher',
				'sEmptyTable':     'Aucune donn&eacute;e disponible dans le tableau',
				'oPaginate': {
					'sFirst':      'Premier',
					'sPrevious':   'Pr&eacute;c&eacute;dent',
					'sNext':       'Suivant',
					'sLast':       'Dernier'
				},
				'oAria': {
					'sSortAscending':  ': activer pour trier la colonne par ordre croissant',
					'sSortDescending': ': activer pour trier la colonne par ordre d&eacute;croissant'
				}
			}		
		}
	};	
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
		searchInputBoxDivId: 'map_query',
		informationDivId: 'information',
		maxQueryZoomLevel: 17,
		maxQueryReturn: 500,
		queryTableDivId: 'query_table',
		otherInfoDivId: 'otherInfo',
		infoWindowWidth: '280px',
		infoWindowHeight: '200px',
		infoWindowContentHeight: '160px',
		infoWindowContentWidth: '240px',
		preIdentifyCallbackName: 'Default',
		preIdentifyCallbackList: {
			'Default': function (identifySettings) {
				closeInfoWindow();
				var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
				var radius = (identifySettings.hasOwnProperty('radius')) ?  identifySettings.radius : identifyRadiusZoomLevels[identifySettings.map.getZoom()];
				var circle = Util.computeCircle(identifySettings.latlng, radius);
				return {
					queryParamsList: _.map(identifySettings.identifyLayersList, function(layer) {
						return {
							mapService: layer.mapService,
							layerID: layer.layerID,
							returnGeometry: layer.hasOwnProperty('returnGeometry') ? layer.returnGeometry : false,
							outFields: layer.outFields,
							geometry: circle
						};
					})
				};
			}
		},
		identifyCallbackName: 'Default',
		identifyCallbackList: {
			'Default': queryLayers
		},
		postIdentifyCallbackName: 'OneFeatureNoTab',
		postIdentifyCallbackList: {
			/*If there are more than one layer, they must have the same structure. Or there is only one layer. 
			Get the first result from query results and use it to create the info window. The info window contains no tabs and no tables inside. 
			Sport Fish, Lake Partner, TRAIS, 
			*/
			'OneFeatureNoTab': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var attrs = features[0].attributes;  // The attributes for the first feature. 
				var container = document.createElement('div');
				container.style.width = globalConfigure.infoWindowWidth;
				container.style.height = globalConfigure.infoWindowHeight;
				container.innerHTML = _.template(identifySettings.identifyTemplate, {attrs: attrs, Util: Util, globalConfigure: globalConfigure});
				openInfoWindow(identifySettings.gLatLng, container);
			},
			/*Wells, Permits to take water, One tab with many features*/
			'ManyFeaturesOneTab': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var content = _.template(identifySettings.identifyTemplate, {features: features, Util: Util});
				var settings = {
					infoWindowWidth: globalConfigure.infoWindowWidth,
					infoWindowHeight: globalConfigure.infoWindowHeight,
					infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
					infoWindowContentWidth: globalConfigure.infoWindowContentWidth
				};
				var container = Util.createTabBar ([{
					label: globalConfigure.langs.InformationLang,
					content: content
				}], settings);
				openInfoWindow(identifySettings.gLatLng, container);
			},
			/*PWQMN, PGMN, many tabs with one features. identifyTemplate is an array with objects. Each object contains two perperties: label and content*/
			'OneFeatureManyTabs': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var attrs = features[0].attributes;  // The attributes for the first feature. 
				var settings = {
					infoWindowWidth: globalConfigure.infoWindowWidth,
					infoWindowHeight: globalConfigure.infoWindowHeight,
					infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
					infoWindowContentWidth: globalConfigure.infoWindowContentWidth
				};
				var container = Util.createTabBar (_.map(identifySettings.identifyTemplate, function(template) {
					return {
						label: _.template(template.label,  {attrs: attrs, Util: Util, globalConfigure: globalConfigure}),
						content: _.template(template.content,  {attrs: attrs, Util: Util, globalConfigure: globalConfigure})
					};
				}), settings);
				openInfoWindow(identifySettings.gLatLng, container);			
			},
			/*District locator, watershed locator, source water protection One feature with no tab*/
			'OneFeatureNoTabPolygon': function(results, identifySettings) {
				var process = function (results, identifySettings, geocodingResult) {					
					var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
					$('#' + globalConfigure.informationDivId).html('<i>' + globalConfigure.generateMessage(results, geocodingResult, searchString) + '</i>');
					if (marker) {
						marker.setMap(null);
					}
					_.each(overlays, function(overlay){
						overlay.setMap(null);
					});
					overlays = [];

					var contents = identifySettings.identifyTemplate(results, Util, geocodingResult, searchString);

					$("#" + globalConfigure.queryTableDivId).html(contents.table);

					marker = new google.maps.Marker({
						map: map,
						draggable: true,
						position: identifySettings.gLatLng,
						visible: true
					});

					var boxText = document.createElement("div");
					boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: white; padding: 5px;";
					boxText.innerHTML = contents.infoWindow;

					var myOptions = {
						 content: boxText
						,disableAutoPan: false
						,maxWidth: 0
						,pixelOffset: new google.maps.Size(-140, 0)
						,zIndex: null
						,boxStyle: { 
						  background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat"
						  ,opacity: 0.75
						  ,width: "280px"
						 }
						,closeBoxMargin: "10px 2px 2px 2px"
						,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
						,infoBoxClearance: new google.maps.Size(1, 1)
						,isHidden: false
						,pane: "floatPane"
						,enableEventPropagation: false
					};

					google.maps.event.addListener(marker, "click", function (e) {
						infoWindow.open(map, this);
					});
					google.maps.event.addListener(marker, 'dragend', function (e) {
						$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
						$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
						$("#" + globalConfigure.queryTableDivId).html('');
						var latlng = marker.getPosition();
						map.setCenter(latlng);
						google.maps.event.trigger(map, 'click', {latLng: latlng});
					});
					infoWindow = new InfoBox(myOptions);

					infoWindow.open(map, marker);

					var isReturnGeometryTrue = _.some(identifySettings.identifyLayersList, function(setting) {return setting.returnGeometry;});
					if (isReturnGeometryTrue) {
						var polylinesOnMap = _.reduce(_.range(identifySettings.identifyLayersList.length), function(totalPolylines, i) {
							if (identifySettings.identifyLayersList[i].returnGeometry) {
								var strokeOptions = identifySettings.identifyLayersList[i].strokeOptions;
								var polylines = _.reduce(results[i].features, function(total, feature) {
									if(feature.hasOwnProperty('geometry')) {
										return total.concat(createPolylines(feature.geometry.rings, strokeOptions));
									} else {
										return total;
									}
								}, []);
								return totalPolylines.concat(polylines);
							} else {
								return totalPolylines;
							}
						}, []);
						_.each(polylinesOnMap, function(line){
							line.setMap(map);
							overlays.push(line);
						});
					}
				};

				if (identifySettings.hasOwnProperty('requireReverseGeocoding') && identifySettings.requireReverseGeocoding) {
					var geocodePromise = geocode(identifySettings.latlng);
					geocodePromise.done(function (result) {
						if (result.status === 'OK') {
							process (results, identifySettings, result);
						} else {
							process (results, identifySettings);
						}
					});
				} else {
					process (results, identifySettings);
				}
			}
		},
		preSearchCallbackName: 'Default',
		preSearchCallbackList: {
			'Default': function (searchString) {
				var searchParams = globalConfigure.getSearchParams(searchString);
				var queryParamsList = searchParams.queryParamsList;
				var options = searchParams.options;
				if(!!options && options.withinExtent) {
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
					var geometry = getCurrentMapExtent();
					_.each(queryParamsList, function(queryParams) {
						queryParams.geometry = geometry;
					});
				}
				return {
					queryParamsList: queryParamsList//, 
					//options: options
				};
			},
			'OneFeatureNoTabPolygon': function (searchString) {
				if (!!globalConfigure.searchGeocoderList) {
					return {
						GeocoderList: globalConfigure.searchGeocoderList,
						address: searchString
					};
				} else {
					return searchString;
				}
			}
		},
		searchCallbackName: 'Default',
		searchCallbackList: {
			'Default': queryLayers,
			'OneFeatureNoTabPolygon': geocode
		},
		postSearchCallbackName: 'OneFeatureNoTab',
		postSearchCallbackList: {
			/* If there is no returned result, it is allowed to call geocoding to geocode the location. 

			are more than one layer, they must have the same structure. Or there is only one layer. 
			Get the first result from query results and use it to create the info window. The info window contains no tabs and no tables inside. 
			Sport Fish, Lake Partner, TRAIS, 
			*/
			'OneFeatureNoTab': function(results) {
				var featuresLength = Util.computeFeaturesNumber (results);
				var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
				var searchParams = globalConfigure.getSearchParams(searchString);
				var options = searchParams.options;
				if ((featuresLength === 0) && options.hasOwnProperty('geocodeWhenQueryFail') && options.geocodeWhenQueryFail && options.hasOwnProperty('searchString')) {
					var geocodingParams = options.searchString;
					if (options.hasOwnProperty('GeocoderList')) {
						geocodingParams = {
							GeocoderList: options.GeocoderList,
							address: options.searchString
						};
					}
					var geocodePromise = geocode(geocodingParams);
					geocodePromise.done(function(result){
						if (result.status === "OK") {
							//result.latlng result.geocodedAddress, map zoom to specific area, add a location pin to the location, update search message.
						} else {
							//update search meesage
						}
					});
					return;
				}

				var features = Util.combineFeatures(results);
				var splited = Util.splitResults(results, options.invalidFeatureLocations);
				var invalidNumber = Util.computeFeaturesNumber (splited.invalidResults);
				var invalidFeatures;
				if (invalidNumber > 0) {
					features =Util.combineFeatures(splited.validResults);
					invalidFeatures = Util.combineFeatures(splited.invalidResults);
				}
				if (invalidNumber > 0) {
					var str1 = _.template(globalConfigure.tableTemplate, {features: features, Util: Util, globalConfigure: globalConfigure});
					var str2 = _.template(globalConfigure.invalidTableTemplate, {features: invalidFeatures, Util: Util, globalConfigure: globalConfigure});
					$('#' + globalConfigure.queryTableDivId).html(str1 + '<br><br>' + str2);	
				} else {
					$('#' + globalConfigure.queryTableDivId).html(_.template(globalConfigure.tableTemplate, {features: features, Util: Util, globalConfigure: globalConfigure}));	
				}
				var dataTableOptions = {
					'bJQueryUI': true,
					'sPaginationType': 'full_numbers' 
				};
				if (globalConfigure.language !== 'EN') {
					dataTableOptions['oLanguage'] = globalConfigure.langs.dataTableLang;
				}
				var tableID = Util.getTableIDFromTableTemplate(globalConfigure.tableTemplate);
				$('#' + tableID).dataTable(dataTableOptions);
				if (invalidNumber > 0) {
					tableID = Util.getTableIDFromTableTemplate(globalConfigure.invalidTableTemplate);
					$('#' + tableID).dataTable(dataTableOptions);				
				}
				var markers = _.map(features, function(feature) {
					var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
					var container = document.createElement('div');
					container.style.width = globalConfigure.infoWindowWidth;
					container.style.height = globalConfigure.infoWindowHeight;
					var identifyTemplate = globalConfigure.identifySettings.identifyTemplate;
					if (typeof identifyTemplate == 'string' || identifyTemplate instanceof String) {
						container.innerHTML = _.template(identifyTemplate, {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure});
					} else if($.isArray(identifyTemplate)) {
						var settings = {
							infoWindowWidth: globalConfigure.infoWindowWidth,
							infoWindowHeight: globalConfigure.infoWindowHeight,
							infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
							infoWindowContentWidth: globalConfigure.infoWindowContentWidth
						};
						container = Util.createTabBar (_.map(identifyTemplate, function(template) {
							return {
								label: _.template(template.label,  {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure}),
								content: _.template(template.content,  {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure})
							};
						}), settings);
					}

					var marker = new google.maps.Marker({
						position: gLatLng
					});		
					(function (container, marker) {
						google.maps.event.addListener(marker, 'click', function () {
							openInfoWindow(marker.getPosition(), container);
						});
					})(container, marker);
					return marker;
				});
				_.each(markers, function(marker){
					marker.setMap(map);
					overlays.push(marker);
				});

				if(options.hasOwnProperty('withinExtent') && !options.withinExtent) {
					var convertToGBounds = function(b) {
						var sw = new google.maps.LatLng(b.southWest.lat, b.southWest.lng);
						var ne = new google.maps.LatLng(b.northEast.lat, b.northEast.lng);			 
						var bounds = new google.maps.LatLngBounds(sw, ne);
						return bounds;
					};
					var bounds = convertToGBounds(Util.computePointsBounds(_.map(features, function(feature) {
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
				var messageParams = {
					totalCount: featuresLength,
					maxQueryReturn: globalConfigure.maxQueryReturn,
					searchString: options.searchString,
					withinExtent: options.withinExtent
				};
				if (invalidNumber > 0) {
					messageParams.invalidCount = invalidNumber;
				}
				$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
			},
			/*District locator, watershed locator, source water protection One feature with no tab*/
			'OneFeatureNoTabPolygon': function(results) {
				if(results[0].status === 'OK') {
					var latlng = new google.maps.LatLng(results[0].latlng.lat, results[0].latlng.lng);
					_.each(arcGISMapServices, function(arcGISMapService) {
						arcGISMapService.setMap(null);
					});
					//console.log(results);
					map.setCenter(latlng);
					var zoomLevel = (results[0].hasOwnProperty('zoomLevel')) ? results[0].zoomLevel : globalConfigure.searchZoomLevel;
					map.setZoom(zoomLevel);
					google.maps.event.trigger(map, 'click', {latLng: latlng});
				} else {
					var messageParams = {
						totalCount: 0,
						maxQueryReturn: globalConfigure.maxQueryReturn,
						searchString: results[0].address
					};
					$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
				}
			}
		}		
	};
	var params = _.defaults(initParams, defaultParams);
	params.searchHelpText = Util.getSearchHelpText(params.searchControlHTML);
	//console.log(params.searchHelpText);
	globalConfigure = params;
	if (globalConfigure.hasOwnProperty('otherInfoHTML')) {
		$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
	}
	var url = 'http://files.ontariogovernment.ca/moe_mapping/mapping/js/MOEMap/';
	var urls = [];
	if(globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTabPolygon') {
		urls = urls.concat([url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js']);
	}	
	if(globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTab' && globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTabPolygon') {
		urls = urls.concat([url + 'css/multipletabs.css', url + 'js/closure-library-multipletabs-min.js']);
	}
	_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

	globalConfigure.langs = globalConfigLanguage[params.language];
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
	if (globalConfigure.hasOwnProperty('extraImageServices')) {
		var ids = _.map(globalConfigure.extraImageServices, function(extraImageService) {return extraImageService.id;});
		mapOptions.mapTypeControlOptions = {
			mapTypeIds: ids.concat([google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN])
		};
	}
	map = new google.maps.Map($('#' + params.mapCanvasDivId)[0], mapOptions);
	if (globalConfigure.hasOwnProperty('extraImageServices')) {
		yepnope({load: 'http://lrcdrrvsdvap002/web/arcgislink.js',callback: function(){
			_.each(globalConfigure.extraImageServices, function(extraImageService) {
				var agsType = new gmaps.ags.MapType(extraImageService.url, {
					name: extraImageService.name
				});
				map.mapTypes.set(extraImageService.id, agsType);
			});			
		}});
	}

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
			$("#" + params.coordinatesDivId).html("Latitude:" + lat.toFixed(5) + ", Longitude:" + lng.toFixed(5) + " (" + globalConfigure.langs.UTM_ZoneLang + ":" + utm.Zone + ", " + globalConfigure.langs.EastingLang + ":" + utm.Easting + ", " + globalConfigure.langs.NorthingLang +":" + utm.Northing + ")<br>");
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
	};
	google.maps.event.addListener(map, 'zoom_changed', zoom_changedHandler);
	/*zoom changed*/
	/*mouse click*/
	var mouseClickHandler = function(event) {
		var identifySettings = _.clone(globalConfigure.identifySettings);
		identifySettings.gLatLng = event.latLng;
		identifySettings.latlng = {lat: event.latLng.lat(), lng: event.latLng.lng()};
		identifySettings.map = map;
		var identifyParams = globalConfigure.preIdentifyCallbackList[globalConfigure.preIdentifyCallbackName](identifySettings);
		var promise = globalConfigure.identifyCallbackList[globalConfigure.identifyCallbackName](identifyParams);
		promise.done(function () {
			globalConfigure.postIdentifyCallbackList[globalConfigure.postIdentifyCallbackName](arguments, identifySettings);
		});
	};	
	if (!globalConfigure.disallowMouseClick) {
		google.maps.event.addListener(map, 'click', mouseClickHandler);
	}
	/*mouse click*/
};

var search = function(input) {
	var searchString = (!!input) ? input : $('#' + globalConfigure.searchInputBoxDivId).val().trim();

	if(searchString.length === 0){
		return;
	}
	_.each(overlays, function(overlay){
		overlay.setMap(null);
	});
	overlays = [];

	var searchParams = globalConfigure.preSearchCallbackList[globalConfigure.preSearchCallbackName](searchString);
	var promise = globalConfigure.searchCallbackList[globalConfigure.searchCallbackName](searchParams);
	promise.done(function () {
		globalConfigure.postSearchCallbackList[globalConfigure.postSearchCallbackName](arguments);
	});
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

var searchChange = function (type) {
	globalConfigure.searchChange(type);
};
var api = {
	init: init,
    geocode: geocode,
    createPolylines: createPolylines,
	search: search,
	entsub: entsub,
	searchChange: searchChange,
	openInfoWindow: openInfoWindow,
	queryLayers: queryLayers,
	clear: clear
};

module.exports = api;
},{"./ArcGISServerAdapter":1,"./Geocoder":2,"./Util":4}],4:[function(require,module,exports){
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

var computeFeaturesNumber = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total + layer.features.length;
		} else {
			return total;
		}
	}, 0);
};

var combineFeatures = function(results) {
	return _.reduce(results, function(total, layer) {
		if (layer.hasOwnProperty('features')) {
			return total.concat (layer.features);
		} else {
			return total;
		}
	}, []);
};

var splitResults = function(results, invalidFeatureLocations) {
	var filterResults = function (results, invalidFeatureLocations, f) {
		return _.map(results, function(result) {
			var clone = _.clone(result);
			clone.features = _.filter(result.features, function (feature) {
				return f(_.some(invalidFeatureLocations, function(location) {
					return Math.abs(location.lng - feature.geometry.x) + Math.abs(location.lat - feature.geometry.y) < location.difference;
				}));
			});
			return clone;
		});
	};
	return {validResults: filterResults(results, invalidFeatureLocations, function(input) {return !input;}),
			invalidResults: filterResults(results, invalidFeatureLocations, function(input) {return input;})};
};

var deciToDegree = function (degree, language){
	if(Math.abs(degree) <= 0.1){
		return "N/A";
	}
	var sym = "N";
	if(degree<0){
		degree = -degree;
		if(language === "EN") {
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
};

var addBRtoLongText = function (text) {
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
};

var processNA = function (str) {
	if (typeof(str) === 'undefined') {
		return "N/A";
	}
	if (str === "null") {
		return "N/A";
	}
	if (str === "Null") {
		return "N/A";
	}
	return str;
};	

var createTabBar = function (tabs, settings){
	// the following code based on ESRI sample
	// create and show the info-window with tabs, one for each map service layer
	var container = document.createElement('div');
	container.style.width = settings.infoWindowWidth;
	container.style.height = settings.infoWindowHeight;

        // =======START  TAB UI ================             
	var tabBar = new goog.ui.TabBar();
	for (var i = 0; i < tabs.length; i++) {
		var tab = new goog.ui.Tab(tabs[i].label);
		tab.content = tabs[i].content;
		tabBar.addChild(tab, true);
	}
	tabBar.render(container);
	goog.dom.appendChild(container, goog.dom.createDom('div', {
		'class': 'goog-tab-bar-clear'
	}));
	var contentDiv = goog.dom.createDom('div', {
		'class': 'goog-tab-content'
	});
	contentDiv.style.height = settings.infoWindowContentHeight;
	contentDiv.style.width = settings.infoWindowContentWidth;
			
	goog.dom.appendChild(container, contentDiv);            
	goog.events.listen(tabBar, goog.ui.Component.EventType.SELECT, function(e) {
		contentDiv.innerHTML = e.target.content;
	});
	tabBar.setSelectedTabIndex(0);
	return container;
        // =======END  TAB UI ================
};

var getTableIDFromTableTemplate = function (template) {
	var index = template.indexOf('<table id="');
	var str = template.substring(index + 11, template.length).trim();
	index = str.indexOf(' ');
	str = str.substring(0, index - 1).trim();
	//str = str.substring(1, str.length - 1);
	return str;
};

/*
	params
		requried: totalCount, maxQueryReturn
		optional: searchString, withinExtent, invalidCount

*/
var generateMessage = function(params, langs){
	var totalCount = params.totalCount;
	var maxQueryReturn = params.maxQueryReturn;

	var regionName = "";
	if (typeof(params.withinExtent) !== "undefined") {
		regionName = " " + (params.withinExtent ? langs.inCurrentMapExtentLang : langs.inGobalRegionLang);
	}
	var searchString = " ";
	if (typeof(params.searchString) !== "undefined") {
		searchString = " " + langs.forLang + " <strong>"  + params.searchString + "</strong> ";
	}
	
	var message = "";
	if (params.hasOwnProperty("invalidCount") && (params.invalidCount > 0)) {
		var invalidResultMsg = (params.invalidCount === 1) ? langs.ResultDoesNotHaveValidCoordinates : langs.ResultsDoNotHaveValidCoordinates;
		if(totalCount === 0){
			message = langs.yourSearchLang + searchString + langs.returnedNoResultLang + regionName + ". " + langs.pleaseRefineSearchLang + ".";
		} else if(totalCount === 1){
			message = langs.oneResultFoundLang  + searchString + regionName + "." + langs.ThisResultDoesNotHaveValidCoordinates;
		} else if(totalCount >= maxQueryReturn){
			message = langs.moreThanLang + " " + maxQueryReturn + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.onlyLang + " " + maxQueryReturn + " " + langs.returnedLang + ". " + langs.seeHelpLang + "." + langs.AmongReturnedResults + ", " + params.invalidCount + invalidResultMsg;
		} else {
			message = totalCount + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.AmongReturnedResults + ", " + params.invalidCount + invalidResultMsg;
		}	
	} else {
		if(totalCount === 0){
			message = langs.yourSearchLang + searchString + langs.returnedNoResultLang + regionName + ". " + langs.pleaseRefineSearchLang + ".";
		} else if(totalCount === 1){
			message = langs.oneResultFoundLang  + searchString + regionName + ".";
		} else if(totalCount >= maxQueryReturn){
			message = langs.moreThanLang + " " + maxQueryReturn + " " + langs.resultsFoundLang + searchString + regionName + ". " + langs.onlyLang + " " + maxQueryReturn + " " + langs.returnedLang + ". " + langs.seeHelpLang + ".";
		} else {
			message = totalCount + " " + langs.resultsFoundLang + searchString + regionName + ".";
		}
	}
	return message;
};

var getSearchHelpText = function (searchControlHTML) {
	var str = searchControlHTML.split('id="information"')[1];
	var index1 = str.indexOf('>');
	var index2 = str.indexOf('</div>');
	return str.substring(index1 + 1, index2);
};
/*
var findGreatLakeWithLocation = function (latlng) {
	var lakeLocations = {
		"LAKE ERIE": {location: {lat: 42.261049,lng: -81.128540}, zoomlevel: 8},
		"LAC \u00c9RI\u00c9": {location: {lat: 42.261049,lng: -81.128540}, zoomlevel: 8},
		"LAKE HURON": {location: {lat: 45.313529,lng: -81.886597}, zoomlevel: 8},
		"LAC HURON": {location: {lat: 45.313529,lng: -81.886597}, zoomlevel: 8},
		"LAKE ONTARIO": {location: {lat: 43.651976,lng: -77.997437}, zoomlevel: 8},
		"LAC ONTARIO": {location: {lat: 43.651976,lng: -77.997437}, zoomlevel: 8},
		"LAKE SUPERIOR": {location: {lat: 47.802087,lng: -86.989746}, zoomlevel: 7},	
		"LAC SUP\u00c9RIEUR": {location: {lat: 47.802087,lng: -86.989746}, zoomlevel: 7},	
		"UPPER ST. LAWRENCE": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"ST. LAWRENCE RIVER": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"HAUT SAINT-LAURENT": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9},
		"FLEUVE SAINT-LAURENT": {location: {lat: 44.439805,lng: -75.848505}, zoomlevel: 9}
	};
	var lake = _.find(_.pairs(lakeLocations), function (items) {
		var lat = items[1].location.lat;
		var lng = items[1].location.lng;
		return Math.abs(lat - latlng.lat) + Math.abs(lng - latlng.lng) < 0.0001;
	});
	if (!!lake) {
		return wordCapitalize(lake[0]);
	} else {
		return null;
	}
};
*/
var api = {
	computeCircle: computeCircle,
	computeOffset: computeOffset,
	computeDistance: computeDistance,
	computePointsBounds: computePointsBounds,
	computeClusters: computeClusters,
	convertLatLngtoUTM: convertLatLngtoUTM,
	replaceChar: replaceChar,
	wordCapitalize: wordCapitalize,
	computeFeaturesNumber: computeFeaturesNumber,
	combineFeatures: combineFeatures,
	splitResults: splitResults,
	deciToDegree: deciToDegree,
	addBRtoLongText: addBRtoLongText,
	processNA: processNA,
	createTabBar: createTabBar,
	getTableIDFromTableTemplate: getTableIDFromTableTemplate,
	generateMessage: generateMessage,
	getSearchHelpText: getSearchHelpText/*,
	findGreatLakeWithLocation: findGreatLakeWithLocation*/
};

module.exports = api;
},{}],5:[function(require,module,exports){
/* global describe, it, expect, _, $ */
var ArcGISServerAdapter = require('../../app/scripts/ArcGISServerAdapter');
var Geocoder = require('../../app/scripts/Geocoder');
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('ArcGISServerAdapter', function () {
	    describe('ArcGISServerAdapter can query an ArcGIS Server layer', function () {
	        this.timeout(150000);
	        it('should query the Geographic Township layer', function (done) {
	            var queryParams = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					returnGeometry: true,
					where: 'OFFICIAL_NAME_UPPER = \'ABINGER\'',
					outFields: ['SHAPE_Area', 'CENX', 'CENY']
				};
				var queryPromise = ArcGISServerAdapter.query(queryParams);
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
				var queryPromise = ArcGISServerAdapter.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features[0].attributes.OFFICIAL_NAME_UPPER).to.equal('ABINGER');
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should geocode an address and query two layers', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
							return ArcGISServerAdapter.query(queryParams);
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
	    describe('ArcGISServerAdapter can query the Sport Fish layer', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var queryParams = {
					mapService: sportfishMapService,
					layerID: 0,
					returnGeometry: true,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
				};
				queryParams.where = 'UPPER(LOCNAME_EN) LIKE \'%SIMCOE%\'';
				var queryPromise = ArcGISServerAdapter.query(queryParams);
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
				var queryPromise = ArcGISServerAdapter.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(49);
					done();
				});
	        });
	        it('should geocode an address and query the sport fish layers', function (done) {
				var geocodeParams = {address: '45.42172, -80.60663'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.then(function(result) {
					if(result.status === 'OK'){
						var queryParams = {
							mapService: sportfishMapService,
							layerID: 0,
							returnGeometry: true,
							outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
						};
						queryParams.geometry = Util.computeCircle(result.latlng, 100);
						var queryPromise = ArcGISServerAdapter.query(queryParams);
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
	    describe('ArcGISServerAdapter can export the Sport Fish map', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var exportParams = {
					bounds: {
						southWest: {lat: 43.79307911819258,lng: -80.0613751},
						northEast: {lat: 43.845099793116404,lng: -78.74301580346679}
					},
					width: 1920,
					height: 105,
					mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
					visibleLayers: [0, 1, 2]
				};
				var exportMapPromise = ArcGISServerAdapter.exportMap(exportParams);
				exportMapPromise.done(function (result) {
					expect(result.width).to.equal(1920);
					expect(result.height).to.equal(105);
					done();
				});
	        });
	    });
    });
})();

},{"../../app/scripts/ArcGISServerAdapter":1,"../../app/scripts/Geocoder":2,"../../app/scripts/Util":4}],6:[function(require,module,exports){
/* global describe, it, expect, $ */
var Geocoder = require('../../app/scripts/Geocoder');

(function () {
    'use strict';

    describe('Geocoder', function () {
        describe('Geocoder can parse a string containing decimal latitude and longitude in Ontario', function () {
			it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43.71702, -79.54158'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
			});

            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '-79.54158, 43.71702'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with positive longitude', function (done) {
				var geocodeParams = {address: '43.71702, 79.54158'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '43.19040, -77.57275'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using degree, minute, second symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using DMS symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43d42m37.05s, 79d32m28.92s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '79d32m28.92s, 43d42m37.05s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40d42m37.05s, 79d32m28.92s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });
        describe('Geocoder can parse a string containing UTM coordinates in Ontario', function () {
            it('should parse the UTM coordinate within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate with reverse order within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in Ontario', function (done) {
				var geocodeParams = {address: '17, 4840730.67, 617521.28'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 18 in Ontario', function (done) {
				var geocodeParams = {address: '18, 517468, 5019950'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.33284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-74.77707))).to.be.below(0.0001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 15 in Ontario', function (done) {
				var geocodeParams = {address: '15, 412541, 5503272'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 49.67563)).to.be.below(0.0001);
					expect(Math.abs(result.latlng.lng - (-94.21223))).to.be.below(0.0001);
					done();
				});
            });
            it('should not parse the UTM coordinate outside Ontario', function (done) {
				var geocodeParams = {address: '17, 333050, 4920558'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession with French keyword in Ontario', function (done) {
				var geocodeParams = {address: 'Canton Abinger, Lot 8, Con 14'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Concession and Lot in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger TWP, Con 14, Lot 8'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger Township, Lot 8, Con 14'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should parse the Geographic Township with multiple polygons in Ontario', function (done) {
				var geocodeParams = {address: 'North Crosby Township, Lot 1, Con 9'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 44.610877)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-76.3844359))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should not parse the wrong Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Apple Township, Lot 1, Con 2'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
	        });
	    });
	    describe('Geocoder can parse a string with Geocoder provided by caller', function () {
	        it('should parse the dummy address with the provided dummy Geocoder', function (done) {
	            var GeocoderList = {
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
					GeocoderList: GeocoderList
				};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	    });
	    describe('Geocoder can reverse a latitude, longitude to address with a reverse Geocoder provided by caller', function () {
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(result.address).to.equal('Dummy address');
					done();
				});
	        });
	    });

	    describe('Geocoder can use default Geocoder provided by caller if no pattern match can be made', function () {
	        it('should geocode an address with provided default Geocoder', function (done) {
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
				var geocodePromise = Geocoder.geocode(geocodeParams);
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

},{"../../app/scripts/Geocoder":2}],7:[function(require,module,exports){
/* global describe, it, expect */
var googleMapsAdapter = require('../../app/scripts/GoogleMapsAdapter');
var Geocoder = require('../../app/scripts/Geocoder');
var Util = require('../../app/scripts/Util');

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

	    describe('Google Maps Adapter can create an array of Google Maps polylines with rings from ArcGIS server', function () {
	        this.timeout(150000);
	        it('should create polylines', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
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

	    describe('Google Maps Adapter can query a list of layers with different parameters', function () {
	        this.timeout(150000);
	        it('should emulate the identify function by querying a list of layers', function (done) {
				var latlng = {lat: 44.53967, lng: -81.81531};
				var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
				var radius = identifyRadiusZoomLevels[10];
				var circle = Util.computeCircle(latlng, radius);
				var queryParamsList = [{
					mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
					layerID: 0,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE'],
					returnGeometry: false,
					geometry: circle
				}];
				var promise = googleMapsAdapter.queryLayers({queryParamsList: queryParamsList});  // without options
				promise.done(function() {					
					expect(arguments).to.have.length(1);
					expect(arguments[0].features).to.have.length(1);
					expect(arguments[0].features[0].attributes.WATERBODYC).to.equal(44348119);
					done();
				});
	        });
	        it('should geocode the address when a search return no result', function (done) {
				var options = {
					searchString: '125 Resources Rd, toronto',
					geocodeWhenQueryFail: true
				};
				var queryParamsList = [{
					mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
					layerID: 0,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE'],
					returnGeometry: true,
					where: "UPPER(LOCNAME_EN) LIKE '%" + options.searchString + "%'"
				}];
				var promise = googleMapsAdapter.queryLayers({queryParamsList: queryParamsList, options: options}); 
				promise.done(function() {
					var featuresLength = Util.computeFeaturesNumber (arguments);
					expect(featuresLength).to.equal(0);
					done();
				});
	        });
	    });
	});
})();

},{"../../app/scripts/Geocoder":2,"../../app/scripts/GoogleMapsAdapter":3,"../../app/scripts/Util":4}],8:[function(require,module,exports){
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
		describe('Util convert a latitude & longitude to a UTM coordinate', function () {
			it('should convert a latitude & longitude to a UTM coordinate', function () {
				var UTM = Util.convertLatLngtoUTM(44.51848, -81.11352);
				expect(Math.abs(UTM.Zone - 17)).to.be.below(0.0001);
				expect(Math.abs(UTM.Easting - 490978)).to.be.below(0.0001);
				expect(Math.abs(UTM.Northing - 4929468)).to.be.below(0.0001);
			});
		});
		describe('Util replace a char in a string with another char', function () {
			it('should replace a char in a string with another char', function () {
				var str = Util.replaceChar('Apple', 'p', 'b');
				expect(str).to.equal('Abble');
			});
		});
		describe('Util word capitalize a string', function () {
			it('should word capitalize a string with all letters in upper case', function () {
				var str = Util.wordCapitalize('APPLE JUICE');
				expect(str).to.equal('Apple Juice');
			});
			it('should word capitalize a string with all letters in lower case', function () {
				var str = Util.wordCapitalize('apple juice');
				expect(str).to.equal('Apple Juice');
			});
			it('should word capitalize a string with some letters in lower case and some letters in upper case', function () {
				var str = Util.wordCapitalize('aPPle juIce');
				expect(str).to.equal('Apple Juice');
			});
		});
		describe('Util compute the number of features in different layers in the query result from ArcGIS Server', function () {
			it('should compute the number of features in different layers in the query result from ArcGIS Server', function () {
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var total = Util.computeFeaturesNumber(results);
				expect(total).to.equal(4);
			});
		});
		describe('Util combine the features in different layers in the query result from ArcGIS Server', function () {
			it('should combine the features in different layers in the query result from ArcGIS Server', function () {
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var totalFeatures = Util.combineFeatures(results);
				expect(totalFeatures).to.have.length(4);
			});
		});
		describe('Util split the query results from different layers from ArcGIS Server into valid features and invalid features with the provided invalid locations', function () {
			it('should split the query results into valid features and invalid features with the provided invalid locations', function () {
				var invalidFeatureLocations = [{
					lat: 0,
					lng: 0,
					difference: 0.0001
				}];
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var splittedResults = Util.splitResults(results, invalidFeatureLocations);
				expect(splittedResults.validResults).to.have.length(2);
				expect(splittedResults.validResults[0].features).to.have.length(1);
				expect(splittedResults.validResults[1].features).to.have.length(1);
				expect(splittedResults.invalidResults).to.have.length(2);
				expect(splittedResults.invalidResults[0].features).to.have.length(1);
				expect(splittedResults.invalidResults[1].features).to.have.length(1);				
			});
		});
	});
})();

},{"../../app/scripts/Util":4}]},{},[5,6,7,8]);