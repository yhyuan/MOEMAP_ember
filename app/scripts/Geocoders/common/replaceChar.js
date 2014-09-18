/**
 * Replace the char A with char B in a String. 
 *
 * @param {str} The string to be processed.
 * @param {charA} the char to be replaced.
 * @param {charB} the char to replace.
 * @return {String} An ojbect sendt to Geocoder.
 **/
module.exports = function (str, charA, charB) {
	var temp = [];
	temp = str.split(charA);
	var result = temp[0];
	if (temp.length >= 2) {
		for (var i = 1; i < temp.length; i++) {
			result = result + charB + temp[i];
		}
	}
	return result;
};