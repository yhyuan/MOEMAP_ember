/**
 * Validate whether a latlng is inside a polygon or not. 
 * The algorithm is from http://appdelegateinc.com/blog/2010/05/16/point-in-polygon-checking/.
 * Ray Cast Point in Polygon extension for Google Maps GPolygon
 * App Delegate Inc <htttp://appdelegateinc.com> 2010
 * @param {latlng} The latlng to be tested.
 * @param {poly} The polygonto be tested.
 * @return {Boolean} whether the latlng is inside the polygon or not.
 **/
module.exports = function (latlng, poly) {
	var lat = latlng.lat;
	var lng = latlng.lng;

	var numPoints = poly.length;
	var inPoly = false;
	var j = numPoints - 1;
	for (var i = 0; i < numPoints; i++) {
		var vertex1 = poly[i];
		var vertex2 = poly[j];

		if (vertex1.x < lng && vertex2.x >= lng || vertex2.x < lng && vertex1.x >= lng) {
			if (vertex1.y + (lng - vertex1.x) / (vertex2.x - vertex1.x) * (vertex2.y - vertex1.y) < lat) {
				inPoly = !inPoly;
			}
		}

		j = i;
	}
	return inPoly;
};
