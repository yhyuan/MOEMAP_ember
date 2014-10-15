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
fs.readFile("Configures/" + foldername + "/configure.js", 'utf8', function(err, data) {
	if (err) throw err;
	//fs.readFile("Configures/Defaults/AGServer/before.js", 'utf8', function(err1, before) {
	//	if (err1) throw err1;
	//	fs.readFile("Configures/Defaults/AGServer/after.js", 'utf8', function(err2, after) {
	//		if (err2) throw err2;
			fs.writeFile("../configures/configure.language.js", removeLangaugeRelated(data, language), function(err3) {
				if(err3) {
					console.log(err3);
				} else {
					console.log("The " + language + " file was saved!");
				}
			});			
		//});		
	//});
	//console.log(data);
});