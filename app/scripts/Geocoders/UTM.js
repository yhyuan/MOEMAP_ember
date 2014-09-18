module.exports = {
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
};