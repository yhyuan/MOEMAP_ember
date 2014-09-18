var validateLatLngInPolygon = require('./common/validateLatLngInPolygon');

module.exports = {
	'name': 'GoogleGeocoder',
	'geocode': function(params) {
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
						return (failedPositions.length === 0) && (validateLatLngInPolygon({lat: point.lat(), lng: point.lng()}, params.regionBoundary));
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
	}
};
