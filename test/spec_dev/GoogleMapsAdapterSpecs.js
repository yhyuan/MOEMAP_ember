/* global describe, it, expect */
var googleMapsAdapter = require('../../app/scripts/GoogleMapsAdapter');
var Geocoder = require('../../app/scripts/Geocoder');
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

	describe('Google Maps Adapter', function () {
		describe('Google Maps Geocoder can reverse a latitude, longitude to address', function () {
			it('should reverse geocode a latitude, longitude to an address', function (done) {				
				var geocodePromise = googleMapsAdapter.geocode({lat: 43.71091,lng: -79.54182});
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(result.address).to.equal('Etobicoke, ON M9P 3V6, Canada');
					done();
				});
			});
		});

		describe('Google Maps Geocoder can geocode an address', function () {
			it('should geocode an address', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('125 Resources Rd, Toronto, Ontario');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
			it('should geocode an address without province name', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('125 Resources Rd, Toronto');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
			it('should geocode an address without province name', function (done) {
				var geocodePromise = googleMapsAdapter.geocode('M9P 3V6');
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71091)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54182))).to.be.below(0.001);
					done();
				});
			});
		});

	    describe('Google Maps Adapter can create an array of Google Maps polylines with rings from ArcGIS server', function () {
	        this.timeout(150000);
	        it('should create polylines', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					var strokeOptions = {
						color: '#8583f3',
						opacity: 1, 
						weight: 4
					};
					var polylines = googleMapsAdapter.createPolylines(result.geometry[0].rings, strokeOptions);
					expect(polylines).to.have.length(1);
					done();
				});
	        });
	    });

	    describe('Google Maps Adapter can query a list of layers with different parameters', function () {
	        this.timeout(150000);
	        it('should emulate the identify function by querying a list of layers', function (done) {
				var latlng = {lat: 44.53967, lng: -81.81531};
				var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
				var radius = identifyRadiusZoomLevels[10];
				var circle = Util.computeCircle(latlng, radius);
				var queryParamsList = [{
					mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
					layerID: 0,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE'],
					returnGeometry: false,
					geometry: circle
				}];
				var promise = googleMapsAdapter.queryLayers({queryParamsList: queryParamsList});  // without options
				promise.done(function() {					
					expect(arguments).to.have.length(1);
					expect(arguments[0].features).to.have.length(1);
					expect(arguments[0].features[0].attributes.WATERBODYC).to.equal(44348119);
					done();
				});
	        });
	        it('should geocode the address when a search return no result', function (done) {
				var options = {
					searchString: '125 Resources Rd, toronto',
					geocodeWhenQueryFail: true
				};
				var queryParamsList = [{
					mapService: 'http://www.appliomaps.lrc.gov.on.ca/ArcGIS/rest/services/MOE/sportfish/MapServer',
					layerID: 0,
					outFields: ['WATERBODYC', 'LOCNAME_EN', 'GUIDELOC_EN', 'LATITUDE', 'LONGITUDE'],
					returnGeometry: true,
					where: "UPPER(LOCNAME_EN) LIKE '%" + options.searchString + "%'"
				}];
				var promise = googleMapsAdapter.queryLayers({queryParamsList: queryParamsList, options: options}); 
				promise.done(function() {
					var featuresLength = Util.computeFeaturesNumber (arguments);
					expect(featuresLength).to.equal(0);
					done();
				});
	        });
	    });
	});
})();
