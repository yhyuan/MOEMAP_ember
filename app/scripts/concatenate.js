// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
	console.log('Usage: node ' + process.argv[1] + ' FolderName Langauge(en/fr)');
	process.exit(1);
}

var fs = require('fs')
	, foldername = process.argv[2]
	, language = process.argv[3];

var config = fs.readFileSync("Configures/" + foldername + "/configure.js", 'utf8');
var libs = config.split("JAVASCRIPT")[1].trim().split('\r\n');
//console.log(libs);
var result = '';
for (var i = 0; i < libs.length; i++) {
	result = result + fs.readFileSync("../" + libs[i], 'utf8');
}
result = result + fs.readFileSync("../configures/configure.js", 'utf8');
fs.writeFileSync("../configures/" + foldername + "." + language + ".js", result);
fs.writeFileSync("../configures/configure.js", result);

if (config.indexOf("CSS") > -1) {
	libs = config.split("CSS")[1].trim().split('\r\n');
	result = '';
	for (var i = 0; i < libs.length; i++) {
		result = result + fs.readFileSync("../" + libs[i], 'utf8');
	}
	fs.writeFileSync("../configures/" + foldername + "." + language + ".css", result);
	fs.writeFileSync("../configures/configure.css", result);
}

fs.readFile("../configures/index.html", 'utf8', function(err, data) {
	var array = data.split('MOEMAPJAVASCRIPT');
	var content = array[0] + foldername + "." + language + ".js" + array[1];
	fs.writeFile("../configures/" + foldername + "." + language + ".htm", content, function(err3) {
		if(err3) {
			console.log(err3);
		}
	});
});