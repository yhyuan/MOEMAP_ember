/* global describe, it, expect */
var googleMapsAdapter = require('../../app/scripts/GoogleMapsAdapter');
var Geocoder = require('../../app/scripts/Geocoder');

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

	    describe('Google Maps Adapter can create an array of Google Maps polylines with rings from ArcGIS server ', function () {
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
	});
})();
