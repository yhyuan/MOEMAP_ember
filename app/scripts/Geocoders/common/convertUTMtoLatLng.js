/**
 * Convert a UTM coordinate to a latlng under WGS 84. 
 *
 * @param {utmCoors} The UTM coordinate.
 * @return {latlng}  The converted latlng.
 **/
module.exports = function (utmCoors) {
	var zone = utmCoors.zone;
	var north = utmCoors.northing;
	var east = utmCoors.easting;

	var pi = 3.14159265358979; //PI
	var a = 6378137; //equatorial radius for WGS 84
	var k0 = 0.9996; //scale factor
	var e = 0.081819191; //eccentricity
	var e2 = 0.006694380015894481; //e'2
	//var corrNorth = north; //North Hemishpe
	var estPrime = 500000 - east;
	var arcLength = north / k0;
	var e4 = e2 * e2;
	var e6 = e4 * e2;
	var t1 = Math.sqrt(1 - e2);
	var e1 = (1 - t1) / (1 + t1);
	var e12 = e1 * e1;
	var e13 = e12 * e1;
	var e14 = e13 * e1;
	var C1 = 3 * e1 / 2 - 27 * e13 / 32;
	var C2 = 21 * e12 / 16 - 55 * e14 / 32;
	var C3 = 151 * e13 / 96;
	var C4 = 1097 * e14 / 512;
	var mu = arcLength / (a * (1 - e2 / 4.0 - 3 * e4 / 64 - 5 * e6 / 256));
	var FootprintLat = mu + C1 * Math.sin(2 * mu) + C2 * Math.sin(4 * mu) + C3 * Math.sin(6 * mu) + C4 * Math.sin(8 * mu);
	var FpLatCos = Math.cos(FootprintLat);
	//var C1_an = e2*FpLatCos*FpLatCos;
	var FpLatTan = Math.tan(FootprintLat);
	var T1 = FpLatTan * FpLatTan;
	var FpLatSin = Math.sin(FootprintLat);
	var FpLatSinE = e * FpLatSin;
	var t2 = 1 - FpLatSinE * FpLatSinE;
	var t3 = Math.sqrt(t2);
	var N1 = a / t3;
	var R1 = a * (1 - e2) / (t2 * t3);
	var D = estPrime / (N1 * k0);
	var D_2 = D * D;
	var D_4 = D_2 * D_2;
	var D_6 = D_4 * D_2;
	var fact1 = N1 * FpLatTan / R1;
	var fact2 = D_2 / 2;
	var fact3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2) * D_4 / 24;
	var fact4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2 - 3 * C1 * C1) * D_6 / 720;
	var lofact1 = D;
	var lofact2 = (1 + 2 * T1 + C1) * D_2 * D / 6;
	var lofact3 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2 + 24 * T1 * T1) * D_4 * D / 120;
	var deltaLong = (lofact1 - lofact2 + lofact3) / FpLatCos;
	var zoneCM = 6 * zone - 183;
	var latitude = 180 * (FootprintLat - fact1 * (fact2 + fact3 + fact4)) / pi;
	var longitude = zoneCM - deltaLong * 180 / pi;
	var res = {
		lat: latitude,
		lng: longitude
	};
	return res;
};