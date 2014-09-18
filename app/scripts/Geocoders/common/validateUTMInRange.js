/**
 * Validate whether a UTM coordinate is inside a UTM range or not. 
 *
 * @param {utmCoors} The UTM coorindate to be tested.
 * @param {UTMRange} The UTM range to be tested.
 *
 * @return {Boolean} whether the UTM coorindate is inside the UTM range or not.
 **/
module.exports = function (utmCoors, UTMRange) {
	var northing = utmCoors.northing;
	var easting = utmCoors.easting;
	return ((easting < UTMRange.maxEasting) && (easting > UTMRange.minEasting) && (northing < UTMRange.maxNorthing) && (northing > UTMRange.minNorthing));
};