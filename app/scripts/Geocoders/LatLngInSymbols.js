var validateLatLngInPolygon = require('./common/validateLatLngInPolygon');
var replaceChar = require('./common/replaceChar');
var parseLatLngSymbols = require('./common/parseLatLngSymbols');

module.exports = {
	'name': 'LatLngInSymbols',
	'format': function (params) {
		var degreeSym = String.fromCharCode(176);
		var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
		return ((coorsArray.length === 2) && ((coorsArray[0]).indexOf(degreeSym) > 0) && ((coorsArray[1]).indexOf(degreeSym) > 0));
	},	
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
};