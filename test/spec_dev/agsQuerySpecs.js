/* global describe, it, expect, _ */
var agsQuery = require('../../app/scripts/agsQuery');
var geocoder = require('../../app/scripts/geocoder');
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('agsQuery', function () {
	    describe('agsQuery can query an ArcGIS Server layer', function () {
	        this.timeout(150000);
	        it('should query the Geographic Township layer', function (done) {
	            var queryParams = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					returnGeometry: true,
					where: 'OFFICIAL_NAME_UPPER = \'ABINGER\'',
					outFields: ['SHAPE_Area', 'CENX', 'CENY']
				};
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should query the Geographic Township layer with a polygon', function (done) {
	            var queryParams = {
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
					layerID: 0,
					returnGeometry: true,
					geometry: [{lat: 45.011,lng: -77.203},{lat: 45.003,lng: -77.17},{lat: 44.967,lng: -77.194}],
					outFields: ['SHAPE_Area', 'CENX', 'CENY', 'OFFICIAL_NAME_UPPER']
				};
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features[0].attributes.OFFICIAL_NAME_UPPER).to.equal('ABINGER');
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should geocode an address and query two layers', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.then(function(result) {
					if(result.status === 'OK'){
						var geometry = Util.computerCircle(result.latlng, 100);
						var queryParamsList = [{
							mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
							layerID: 0,
							returnGeometry: true,
							geometry: geometry,
							outFields: ['SHAPE_Area', 'CENX', 'CENY', 'OFFICIAL_NAME_UPPER']
						},{
							mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/GeographicTownships/MapServer',
							layerID: 1,
							returnGeometry: true,
							geometry: geometry,
							outFields: ['SHAPE_Area', 'CENX', 'CENY', 'GEOG_TWP', 'LOT_NUM', 'CONCESSION']
						}];
						var promises = _.map(queryParamsList, function(queryParams) {
							return agsQuery.query(queryParams);
						});
						$.when.apply($, promises).done(function() {
							expect(arguments[0].features[0].attributes.OFFICIAL_NAME_UPPER).to.equal('ABINGER');
							expect(arguments[1].features[0].attributes.GEOG_TWP).to.equal('ABINGER');
							done();
						});
					} else {
						return result;
					}
				});
	        });
	    });
	    describe('agsQuery can query the Sport Fish layer', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish2/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var queryParams = {
					mapService: sportfishMapService,
					layerID: 0,
					returnGeometry: true,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
				};
				queryParams.where = 'UPPER(LOCNAME_EN) LIKE \'%SIMCOE%\'';
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(1);
					done();
				});
	        });
	        it('should query the species name for the sport fish layer', function (done) {
				var queryParams = {
					mapService: sportfishMapService,
					layerID: 0,
					returnGeometry: true,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
				};
				queryParams.where = 'SPECIES_EN LIKE \'%SALMON%\'';
				var queryPromise = agsQuery.query(queryParams);
				queryPromise.done(function (fset) {
					expect(fset.features).to.have.length(49);
					done();
				});
	        });
	        it('should geocode an address and query the sport fish layers', function (done) {
				var geocodeParams = {address: '45.42172, -80.60663'};
				var geocodePromise = geocoder.geocode(geocodeParams);
				geocodePromise.then(function(result) {
					if(result.status === 'OK'){
						var queryParams = {
							mapService: sportfishMapService,
							layerID: 0,
							returnGeometry: true,
							outFields: ['WATERBODYC', 'LOCNAME_EN', 'LATITUDE', 'LONGITUDE']
						};
						queryParams.geometry = Util.computerCircle(result.latlng, 100);
						var queryPromise = agsQuery.query(queryParams);
						queryPromise.done(function (fset) {
							expect(fset.features).to.have.length(1);
							done();
						});
					} else {
						return result;
					}
				});
	        });
	    });
	    describe('agsQuery can export the Sport Fish map', function () {
	        this.timeout(150000);
			var sportfishMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish2/MapServer';
	        it('should query the lake name for the sport fish layer', function (done) {
				var exportParams = {
					bounds: {
						southWest: {lat: 43.79307911819258,lng: -80.0613751},
						northEast: {lat: 43.845099793116404,lng: -78.74301580346679}
					},
					width: 1920,
					height: 105,
					mapService: 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/sportfish2/MapServer',
					visibleLayers: [0, 1, 2]
				}
				var exportMapPromise = agsQuery.exportMap(exportParams);
				exportMapPromise.done(function (result) {
					expect(result.width).to.equal(1920);
					expect(result.height).to.equal(105);
					done();
				});
	        });
	    });
    });
})();
