module.exports = {
	'match': function (params) {
		var twpInfo = getTWPinfo(params.address);
		return (twpInfo.success && twpInfo.isTWPOnly);
	},
	'geocode': function (params) {
		var twpInfo = getTWPinfo(params.address);
		var settings = {
			mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
			layerID: 0,
			displayPolygon: true,
			fieldsInInfoWindow: ['OFFICIAL_NAME'],
			getInfoWindow: function(attributes){
				return '<strong>' + attributes.OFFICIAL_NAME + '</strong>';
			},
			latitudeField: 'CENY',
			longitudeField: 'CENX',
			areaField: 'SHAPE_Area',
			searchCondition: 'OFFICIAL_NAME_UPPER = \'' + twpInfo.TWP + '\''
		};
		return geocodeByQuery(params, settings);
	}
};