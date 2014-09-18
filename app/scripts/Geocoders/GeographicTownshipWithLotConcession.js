var getTWPinfo = require('./common/getTWPinfo');
var geocodeByQuery = require('./common/geocodeByQuery');

module.exports = {
	'name': 'GeographicTownshipWithLotConcession',
	'format': function (params) {
		var twpInfo = getTWPinfo(params.address);
		return (twpInfo.success && (!twpInfo.isTWPOnly));
	},	
	'match': function (params) {
		var twpInfo = getTWPinfo(params.address);
		return (twpInfo.success && (!twpInfo.isTWPOnly));
	},
	'geocode': function (params) {
		var twpInfo = getTWPinfo(params.address);
		var settings = {
			mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
			layerID: 1,
			displayPolygon: true,
			boundary: {
				color: '#8583f3',
				opacity: 1, 
				weight: 4
			},
			zoomLevel: 14,
			fieldsInInfoWindow: ['GEOG_TWP', 'LOT_NUM', 'CONCESSION'],
			getInfoWindow: function(attributes){
				return '<strong>' + attributes.GEOG_TWP + ' ' + attributes.LOT_NUM + ' ' + attributes.CONCESSION + '</strong>';
			},
			latitudeField: 'CENY',
			longitudeField: 'CENX',
			areaField: 'SHAPE_Area',
			searchCondition: 'GEOG_TWP' + ' = \'' + twpInfo.TWP + '\' AND CONCESSION = \'CON ' + twpInfo.Con + '\' AND LOT_NUM = \'LOT ' + twpInfo.Lot + '\''
		};
		return geocodeByQuery(params, settings);
	}
};