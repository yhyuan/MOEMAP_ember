// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
	console.log('Usage: node ' + process.argv[1] + ' FolderName Langauge(en/fr)');
	process.exit(1);
}

var removeLangaugeRelated = function(data, language) {
	var codeArray = data.split((language=== "en") ? "French Begins" : "English Begins");
	var result = codeArray[0];
	for(var i=1; i<codeArray.length; i++) {
		result = result + codeArray.split((language=== "en") ? "French Ends" : "English Ends")[1];
	}
	return result;
}

var fs = require('fs')
	, foldername = process.argv[2]
	, language = process.argv[3];
fs.readFile(foldername + "/configure.js", 'utf8', function(err, data) {
	if (err) throw err;
	fs.writeFile(foldername + "/configure.en.js", removeLangaugeRelated(data, "en"), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
	fs.writeFile(foldername + "/configure.en.js", removeLangaugeRelated(data, "en"), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
});