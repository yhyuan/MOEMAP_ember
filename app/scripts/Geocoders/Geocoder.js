module.exports = {
	'init': function (GeocoderSettings) {
		this.GeocoderSettings = GeocoderSettings;
	},
	'geocode': function (initParams) {
		var params = _.defaults(initParams, this.GeocoderSettings);
		if(params.hasOwnProperty('latlng')) {
			return params.reverseGeocoder.geocode(params);
		}
		
		var promise;
		var Geocoder = _.find(params.GeocoderList, function(G){
			return G.match(params);
		});
		var formatCorrect = _.find(params.GeocoderList, function(G){
			return G.format(params);
		});
		
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
	},
	'addGeocoder': function (geocoder) {
		this.GeocoderSettings.GeocoderList.push(geocoder);
	}
};