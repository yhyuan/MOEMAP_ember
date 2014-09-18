module.exports = {
	'geocode': function (params) {
		var Geocoder = _.find(params.GeocoderList, function(Geocoder){
			return Geocoder.match(params);
		});
		var formatCorrect = _.find(params.GeocoderList, function(Geocoder){
			return Geocoder.format(params);
		});
		var promise;
		if(!!Geocoder) {
			promise = Geocoder.geocode(params);
		} else {
			if ((!!params.defaultGeocoder) && (!formatCorrect)) {
				promise = params.defaultGeocoder.geocode(params);
			} else {
				var result = {
					status: 'No_Result'
				};
				var dfd = new $.Deferred();
				dfd.resolve(result);
				promise = dfd.promise();
			}
		}
		return promise;
	}
};