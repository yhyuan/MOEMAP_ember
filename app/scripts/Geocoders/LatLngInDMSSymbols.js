var validateLatLngInPolygon = require('./common/validateLatLngInPolygon');
var replaceChar = require('./common/replaceChar');
var parseLatLngSymbols = require('./common/parseLatLngSymbols');
var validateDMSFormat = function (str) {
	for (var i = 0; i <= 9; i++) {
		if (str.indexOf(i + 'D') > 0) {
			return true;
		}
	}
	return false;
};

module.exports = {
	'name': 'LatLngInDMSSymbols',
	'format': function (params) {
		var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
		if (coorsArray.length === 2) {
			var str1 = (coorsArray[0]).toUpperCase();
			var str2 = (coorsArray[1]).toUpperCase();
			if (validateDMSFormat(str1) && validateDMSFormat (str2)) {
				return true;
			}
		}
		return false;
	},		
	'match': function (params) {
		var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
		if (coorsArray.length === 2) {
			var str1 = (coorsArray[0]).toUpperCase();
			var str2 = (coorsArray[1]).toUpperCase();
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
};