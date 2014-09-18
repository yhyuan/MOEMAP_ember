module.exports = {
	regionBoundary: [
		{x: -95.29920350, y: 48.77505703},
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
	defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
	failedLocation: {
		positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
		difference: 0.00001
	},
	/**
	 * Creates a latlng with two floats. In Ontario, the absolute value of longitude is always larger than the absolute value
	 * of latitude. This knowledge is used to determine which value is latitude and which value is longitude. In other areas, 
	 * this function has to be redefined. 
	 *
	 * @param {float, float} two floats.
	 * @return {object} An ojbect sendt to Geocoder.
	 */
	generateLatLngFromFloats: function (v1, v2) {
		var lat = Math.min(v1, v2);
		var lng = -Math.max(v1, v2);
		return {lat: lat, lng: lng};
	}
};