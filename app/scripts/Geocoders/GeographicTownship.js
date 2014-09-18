var getTWPinfo = require('./common/getTWPinfo');
var geocodeByQuery = require('./common/geocodeByQuery');

module.exports = {
	'name': 'GeographicTownship',
	'format': function (params) {
		var twpInfo = getTWPinfo(params.address);
		return (twpInfo.success && twpInfo.isTWPOnly);
	},
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
			boundary: {
				color: '#8583f3',
				opacity: 1, 
				weight: 4
			},
			zoomLevel: 11,
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