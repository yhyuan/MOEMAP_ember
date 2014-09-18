var validateLatLngInPolygon = require('./common/validateLatLngInPolygon');
var replaceChar = require('./common/replaceChar');

var regIsFloat = /^(-?\d+)(\.\d+)?$/;

module.exports = {
	'name': 'LatLngInDecimalDegree',
	'format': function (params) {
		var coorsArray = replaceChar(params.address, ',', ' ').trim().split(/\s+/);
		return ((coorsArray.length === 2) && regIsFloat.test(coorsArray[0]) && regIsFloat.test(coorsArray[1]));
	},
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
};