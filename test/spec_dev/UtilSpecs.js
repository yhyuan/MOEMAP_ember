/* global describe, it, expect */
var Util = require('../../app/scripts/Util');

(function () {
    'use strict';

    describe('Util', function () {
	    describe('Util calculate the distance in meters between two points on the Earth Surface', function () {
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = {lat: 46, lng: -77};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 111319.49)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46, lng: -77};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 77328.50819644716)).to.be.below(1);
	        });
	        it('should calculate distance on the Earth surface', function () {
	            var latlng1 = {lat: 46.5, lng: -77.5};
	            var latlng2 = {lat: 46, lng: -78};
	            var dist = Util.computeDistance(latlng1, latlng2);
	            expect(Math.abs(dist - 67671.25839256)).to.be.below(1);
	        });
	    });
	    describe('Util calculate the offset location on the Earth Surface', function () {
	        it('should calculate the offset location in the North on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 0);
			    expect(Math.abs(latlng2.lat - 45.8983153)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the East on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 270);
			    expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-75.729694418))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the South on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 180);
			    expect(Math.abs(latlng2.lat - 44.101684716)).to.be.below(0.0001);
			    expect(Math.abs(latlng2.lng - (-77))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in the West on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 90);
				expect(Math.abs(latlng2.lat - 44.992958432)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-78.2703055823))).to.be.below(0.0001);
	        });
	        it('should calculate the offset location in any direction on the Earth surface', function () {
	            var latlng1 = {lat: 45, lng: -77};
	            var latlng2 = Util.computeOffset(latlng1, 100000, 330);
				expect(Math.abs(latlng2.lat - 45.7761709351)).to.be.below(0.0001);
				expect(Math.abs(latlng2.lng - (-76.35602524215))).to.be.below(0.0001);
	        });
	    });
	    describe('Util create a circle on the Earth with a center and radius in meter', function () {
	        it('should create a circle on the Earth', function () {
	            var latlng = {lat: 45.008284, lng: -77.184177};
	            var circle = Util.computeCircle(latlng, 1000);
	            expect(circle).to.have.length(37);
	            for (var i = 0; i <= 36; i++) {
					expect(Math.abs(Util.computeDistance(latlng, circle[i]) - 1000)).to.be.below(0.01);
				}
	        });
	    });
	    describe('Util compute the bound for an array of latlng', function () {
	        it('should compute the bound', function () {
	            var latlngs = [{lat: 45.008284, lng: -77.184177}, {lat: 44.008284, lng: -79.184177}, {lat: 46.008284, lng: -73.184177}];
	            var bounds = Util.computePointsBounds(latlngs);
				expect(Math.abs(bounds.southWest.lat - 44.008284)).to.be.below(0.0001);
				expect(Math.abs(bounds.southWest.lng - (-79.184177))).to.be.below(0.0001);
				expect(Math.abs(bounds.northEast.lat - 46.008284)).to.be.below(0.0001);
				expect(Math.abs(bounds.northEast.lng - (-73.184177))).to.be.below(0.0001);
	        });
	    });
		describe('Util compute the clusters for an array of features', function () {
			it('should compute the clusters', function () {
				var features = [{latlng: {lat: 45, lng: -77}, attributes: {attr: "test"}}, {latlng: {lat: 45, lng: -77}, attributes: {attr: "test"}}, {latlng: {lat: 45.008284, lng: -77.184177}, attributes: {attr: "test"}}, {latlng: {lat: 44.008284, lng: -79.184177}, attributes: {attr: "test"}}];
				var clusters = Util.computeClusters(features);
				expect(clusters).to.have.length(3);
			});
		});
		describe('Util convert a latitude & longitude to a UTM coordinate', function () {
			it('should convert a latitude & longitude to a UTM coordinate', function () {
				var UTM = Util.convertLatLngtoUTM(44.51848, -81.11352);
				expect(Math.abs(UTM.Zone - 17)).to.be.below(0.0001);
				expect(Math.abs(UTM.Easting - 490978)).to.be.below(0.0001);
				expect(Math.abs(UTM.Northing - 4929468)).to.be.below(0.0001);
			});
		});
		describe('Util replace a char in a string with another char', function () {
			it('should replace a char in a string with another char', function () {
				var str = Util.replaceChar('Apple', 'p', 'b');
				expect(str).to.equal('Abble');
			});
		});
		describe('Util word capitalize a string', function () {
			it('should word capitalize a string with all letters in upper case', function () {
				var str = Util.wordCapitalize('APPLE JUICE');
				expect(str).to.equal('Apple Juice');
			});
			it('should word capitalize a string with all letters in lower case', function () {
				var str = Util.wordCapitalize('apple juice');
				expect(str).to.equal('Apple Juice');
			});
			it('should word capitalize a string with some letters in lower case and some letters in upper case', function () {
				var str = Util.wordCapitalize('aPPle juIce');
				expect(str).to.equal('Apple Juice');
			});
		});
		describe('Util compute the number of features in different layers in the query result from ArcGIS Server', function () {
			it('should compute the number of features in different layers in the query result from ArcGIS Server', function () {
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var total = Util.computeFeaturesNumber(results);
				expect(total).to.equal(4);
			});
		});
		describe('Util combine the features in different layers in the query result from ArcGIS Server', function () {
			it('should combine the features in different layers in the query result from ArcGIS Server', function () {
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var totalFeatures = Util.combineFeatures(results);
				expect(totalFeatures).to.have.length(4);
			});
		});
		describe('Util split the query results from different layers from ArcGIS Server into valid features and invalid features with the provided invalid locations', function () {
			it('should split the query results into valid features and invalid features with the provided invalid locations', function () {
				var invalidFeatureLocations = [{
					lat: 0,
					lng: 0,
					difference: 0.0001
				}];
				var results = [
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -81.11352, y: 44.008284}
						}]
					},
					{
						features: [{
							geometry: {x: 0, y: 0}
						}, {
							geometry: {x: -82.11352, y: 45.008284}
						}]
					},
				];
				var splittedResults = Util.splitResults(results, invalidFeatureLocations);
				expect(splittedResults.validResults).to.have.length(2);
				expect(splittedResults.validResults[0].features).to.have.length(1);
				expect(splittedResults.validResults[1].features).to.have.length(1);
				expect(splittedResults.invalidResults).to.have.length(2);
				expect(splittedResults.invalidResults[0].features).to.have.length(1);
				expect(splittedResults.invalidResults[1].features).to.have.length(1);				
			});
		});
	});
})();
