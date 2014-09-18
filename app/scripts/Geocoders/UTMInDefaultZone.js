module.exports = {
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
};