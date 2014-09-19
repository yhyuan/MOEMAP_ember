module.exports = {
	'name': 'GoogleReverseGeocoder',
	'geocode': function(params) {
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
	}
};
