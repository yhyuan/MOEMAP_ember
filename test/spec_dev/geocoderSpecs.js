/* global describe, it, expect, $ */
var Geocoder = require('../../app/scripts/Geocoder');

var GeographicTownship = require('../../app/scripts/Geocoders/GeographicTownship');
var GeographicTownshipWithLotConcession = require('../../app/scripts/Geocoders/GeographicTownshipWithLotConcession');
var LatLngInDecimalDegree = require('../../app/scripts/Geocoders/LatLngInDecimalDegree');
var LatLngInDMSSymbols = require('../../app/scripts/Geocoders/LatLngInDMSSymbols');
var LatLngInSymbols = require('../../app/scripts/Geocoders/LatLngInSymbols');
var UTM = require('../../app/scripts/Geocoders/UTM');
var UTMInDefaultZone = require('../../app/scripts/Geocoders/UTMInDefaultZone');
//var GoogleGeocoder = require('../../app/scripts/Geocoders/GoogleGeocoder');
var Geocoder = require('../../app/scripts/Geocoders/Geocoder');
//var GoogleReverseGeocoder = require('../scripts/Geocoders/GoogleReverseGeocoder');
var defaultGeocoderConfigurations = require('../../app/scripts/Geocoders/configurations/default');
var DummyGeocoder = {
	'name': 'Dummy Geocoder',
	'format': function (params) {
		return params.address === 'Dummy address';
	},					
	'match': function (params) {
		return params.address === 'Dummy address';
	},
	'geocode': function (params) {
		var result = {
			latlng: {lat: 45.067567,lng: -77.16453},
			address: params.address,
			status: 'OK'
		};
		var dfd = new $.Deferred();
		setTimeout(function() {
			dfd.resolve(result);
		}, 1);
		return dfd.promise();
	}
};

var dummyDefaultGeocoder = {
	'name': 'dummy default geocoder',
	'geocode': function(params) {
		var result = {
			latlng:{lat: 45.067567,lng: -77.16453},
			address: params.address,
			status: 'OK'
		};
		var dfd = new $.Deferred();
		setTimeout(function() {
			dfd.resolve(result);
		}, 1);
		return dfd.promise();
	}
};

var dummyReverseGeocoder = {
	'name': 'dummy Reverse Geocoder',
	'geocode': function(params) {
		var result = {
			address: 'Dummy address',
			latlng: params.latlng,
			status: 'OK'
		};
		var dfd = new $.Deferred();
		setTimeout(function() {
			dfd.resolve(result);
		}, 1);
		return dfd.promise();
	}
};
				
var GeocoderSettings = {
	GeocoderList: [DummyGeocoder, LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone, GeographicTownship, GeographicTownshipWithLotConcession],
	defaultGeocoder: dummyDefaultGeocoder,
	reverseGeocoder: dummyReverseGeocoder
};
GeocoderSettings = _.defaults(defaultGeocoderConfigurations, GeocoderSettings);
Geocoder.init(GeocoderSettings);

(function () {
    'use strict';

    describe('Geocoder', function () {
        describe('Geocoder can parse a string containing decimal latitude and longitude in Ontario', function () {
			it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43.71702, -79.54158'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
			});

            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '-79.54158, 43.71702'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with positive longitude', function (done) {
				var geocodeParams = {address: '43.71702, 79.54158'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71702)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54158))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '43.19040, -77.57275'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using degree, minute, second symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '43°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40°42\'37.05", 79°32\'28.92"'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });

        describe('Geocoder can parse a string containing latitude and longitude using DMS symbols in Ontario', function () {
            it('should parse the latitude and longitude in Ontario', function (done) {
				var geocodeParams = {address: '43d42m37.05s, 79d32m28.92s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the latitude and longitude in Ontario with revese order', function (done) {
				var geocodeParams = {address: '79d32m28.92s, 43d42m37.05s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.71029)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.541366))).to.be.below(0.001);
					done();
				});
            });
            it('should not parse the latitude and longitude outside Ontario', function (done) {
				var geocodeParams = {address: '40d42m37.05s, 79d32m28.92s'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });
        describe('Geocoder can parse a string containing UTM coordinates in Ontario', function () {
            it('should parse the UTM coordinate within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate with reverse order within default zone: 17 in Ontario', function (done) {
				var geocodeParams = {address: '617521.28, 4840730.67'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in Ontario', function (done) {
				var geocodeParams = {address: '17, 4840730.67, 617521.28'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 43.710291)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.54126))).to.be.below(0.001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 18 in Ontario', function (done) {
				var geocodeParams = {address: '18, 517468, 5019950'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.33284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-74.77707))).to.be.below(0.0001);
					done();
				});
            });
            it('should parse the UTM coordinate in zone 15 in Ontario', function (done) {
				var geocodeParams = {address: '15, 412541, 5503272'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 49.67563)).to.be.below(0.0001);
					expect(Math.abs(result.latlng.lng - (-94.21223))).to.be.below(0.0001);
					done();
				});
            });
            it('should not parse the UTM coordinate outside Ontario', function (done) {
				var geocodeParams = {address: '17, 333050, 4920558'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
            });
        });
	    describe('Geocoder can parse a string containing Geographic Township name in Ontario', function () {
	        this.timeout(150000);
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger TWP'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township with French keyword in Ontario', function (done) {
				var geocodeParams = {address: 'Canton Abinger'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger TWP'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger Township'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.008284)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.184177))).to.be.below(0.001);
					expect(result.geometry).to.have.length(1);
					done();
				});
	        });
	        it('should parse the Geographic Township with multiple polygons in Ontario', function (done) {
				var geocodeParams = {address: 'Gibson Township'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 44.9980573)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-79.8036325))).to.be.below(0.001);
					expect(result.geometry).to.have.length(11);
					done();
				});
	        });
	        it('should not parse the wrong Geographic Township in Ontario', function (done) {
				var geocodeParams = {address: 'Apple Township'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
	        });
	    });
	    describe('Geocoder can parse a string containing Geographic Township name with Lot and Concession in Ontario', function () {
	        this.timeout(150000);
	        it('should parse the Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger TWP, Lot 8, Con 14'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession with French keyword in Ontario', function (done) {
				var geocodeParams = {address: 'Canton Abinger, Lot 8, Con 14'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Concession and Lot in Ontario', function (done) {
				var geocodeParams = {address: 'ABinger TWP, Con 14, Lot 8'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        it('should parse the Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Abinger Township, Lot 8, Con 14'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should parse the Geographic Township with multiple polygons in Ontario', function (done) {
				var geocodeParams = {address: 'North Crosby Township, Lot 1, Con 9'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 44.610877)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-76.3844359))).to.be.below(0.001);
					done();
				});
	        });
	        
	        it('should not parse the wrong Geographic Township with Lot and Concession in Ontario', function (done) {
				var geocodeParams = {address: 'Apple Township, Lot 1, Con 2'};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('No_Result');
					done();
				});
	        });
	    });
	    describe('Geocoder can parse a string with Geocoder provided by caller', function () {
	        it('should parse the dummy address with the provided dummy Geocoder', function (done) {
				var geocodeParams = {
					address: 'Dummy address'
				};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	    });
	    describe('Geocoder can reverse a latitude, longitude to address with a reverse Geocoder provided by caller', function () {
	        it('should reverse geocode a latitude, longitude to an address', function (done) {
				var geocodeParams = {
					latlng:{lat: 45.067567,lng: -77.16453}
				};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(result.address).to.equal('Dummy address');
					done();
				});
	        });
	    });

	    describe('Geocoder can use default Geocoder provided by caller if no pattern match can be made', function () {
	        it('should geocode an address with provided default Geocoder', function (done) {
				var geocodeParams = {
					address: 'Dummy address for default Geocoder'
				};
				var geocodePromise = Geocoder.geocode(geocodeParams);
				geocodePromise.done(function (result) {
					expect(result.status).to.equal('OK');
					expect(Math.abs(result.latlng.lat - 45.067567)).to.be.below(0.001);
					expect(Math.abs(result.latlng.lng - (-77.16453))).to.be.below(0.001);
					done();
				});
	        });
	    });
    });
})();
