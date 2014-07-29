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