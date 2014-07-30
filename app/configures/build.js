// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
	console.log('Usage: node ' + process.argv[1] + ' FolderName Langauge(en/fr)');
	process.exit(1);
}

var removeLangaugeRelated = function(data, language) {
	var codeArray = data.trim().split((language=== "en") ? "French Begins" : "English Begins");
	var result = codeArray[0];
	for(var i=1; i<codeArray.length; i++) {
		result = result + codeArray[i].trim().split((language=== "en") ? "French Ends" : "English Ends")[1];
	}
	result = result.split("\\\r\n").join("");
	return result;
}

var fs = require('fs')
	, foldername = process.argv[2]
	, language = process.argv[3];
fs.readFile(foldername + "/configure.js", 'utf8', function(err, data) {
	if (err) throw err;
	//console.log(data);
	fs.writeFile(foldername + "/configure." + language + ".js", removeLangaugeRelated(data, language), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The " + language + " file was saved!");
		}
	});
});