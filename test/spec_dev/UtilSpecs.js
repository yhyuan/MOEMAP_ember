/* global describe, it, expect */
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('Util', function () {
	    describe('Util calculate the distance in meters between two points on the Earth Surface', function () {
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = {lat: 46, lng: -77};
	            var dist = Util.computerDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 111319.49)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46, lng: -77};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computerDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 77328.50819644716)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46.5, lng: -77.5};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computerDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 67671.25839256)).to.be.below(1);
	        });
	    });
	    describe('Util calculate the offset location on the Earth Surface', function () {
	        it('should calculate the offset location in the North on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computerOffset(latlng1, 100000, 0);
			    expect(Math.abs(latlng2.lat - 45.8983153)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the East on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computerOffset(latlng1, 100000, 270);
			    expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-75.729694418))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the South on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computerOffset(latlng1, 100000, 180);
			    expect(Math.abs(latlng2.lat - 44.101684716)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the West on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computerOffset(latlng1, 100000, 90);
				expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-78.2703055823))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in any direction on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computerOffset(latlng1, 100000, 330);
				expect(Math.abs(latlng2.lat - 45.7761709351)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-76.35602524215))).to.be.below(0.0001);
	        });
	    });
	    describe('Util create a circle on the Earth with a center and radius in meter', function () {
	        it('should create a circle on the Earth', function () {
	            var latlng = {lat: 45.008284, lng: -77.184177};
	            var circle = Util.computerCircle(latlng, 1000);
	            expect(circle).to.have.length(37);
	            for (var i = 0; i <= 36; i++) {
					expect(Math.abs(Util.computerDistance(latlng, circle[i]) - 1000)).to.be.below(0.01);
				}
	        });
	    });
    });
})();
