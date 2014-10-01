var ArcGISServerAdapter = require('../../FeatureLayers/ArcGISServerAdapter');

/**
 * Geocode an address with an ArcGIS layer. 
 *
 * @param {params} The object contains the geocoding information.
 * @param {settings} The setting of the layer for geocoding.
 * @return {promise} A promise contains the geocoding result.
 **/
module.exports = function (params, settings) {
	var outFields = settings.fieldsInInfoWindow;
	var otherFields = [settings.latitudeField, settings.longitudeField, settings.areaField];
	var queryParams = {
		mapService: settings.mapService,
		layerID: settings.layerID,
		returnGeometry: settings.displayPolygon,
		where: settings.searchCondition,
		outFields: outFields.concat(otherFields)
	};
	var processResults = function (fset) {
		var features = fset.features;
		var size = features.length;
		if (size === 0) {
			return {status: 'No_Result'};
		}
		var attrs = features[0].attributes;
		var result = {
			address: params.address,
			geocodedAddress: settings.getInfoWindow(attrs)
		};
		if(queryParams.returnGeometry) {
			result.geometry = _.map(features, function(feature) {
				return feature.geometry;
			});
		}
		if (settings.displayPolygon && settings.hasOwnProperty('boundary')) {
			result.boundary = settings.boundary;
		}
		if (settings.hasOwnProperty('zoomLevel')) {
			result.zoomLevel = settings.zoomLevel;
		}
		if (size === 1) {
			result.latlng = {
				lat: attrs[settings.latitudeField],
				lng: attrs[settings.longitudeField]
			};
		} else {
			var totalArea = _.reduce(features, function(tArea, feature) {
				return feature.attributes[settings.areaField] + tArea;
			}, 0);
			var totalLat = _.reduce(features, function(tlat, feature) {
				return feature.attributes[settings.latitudeField]* feature.attributes[settings.areaField] + tlat;
			}, 0);
			var totalLng = _.reduce(features, function(tlng, feature) {
				return feature.attributes[settings.longitudeField]* feature.attributes[settings.areaField] + tlng;
			}, 0);
			result.latlng = {
				lat: totalLat/totalArea,
				lng: totalLng/totalArea
			};
		}
		result.status = 'OK';
		return result;
	};
	return ArcGISServerAdapter.query(queryParams).then(processResults);
};