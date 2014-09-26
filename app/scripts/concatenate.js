// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
	console.log('Usage: node ' + process.argv[1] + ' FolderName Langauge(en/fr)');
	process.exit(1);
}

var fs = require('fs')
	, foldername = process.argv[2]
	, language = process.argv[3];

fs.readFile("../configures/configure.js", 'utf8', function(err, data) {
	if (err) throw err;
	fs.readFile("../bower_components/yepnope/yepnope.1.5.4-min.js", 'utf8', function(err1, yepnope) {
		if (err1) throw err1;
		fs.readFile("../bower_components/underscore/underscore.js", 'utf8', function(err2, underscore) {
			if (err2) throw err2;
			fs.writeFile("../configures/" + foldername + "." + language + ".js", "/*" + (new Date()) + "*/\n" + yepnope + underscore + data, function(err3) {
				if(err3) {
					console.log(err3);
				}
			});			
		});		
	});
});

fs.readFile("../configures/index.html", 'utf8', function(err, data) {
	var array = data.split('MOEMAPJAVASCRIPT');
	var content = array[0] + foldername + "." + language + ".js" + array[1];
	fs.writeFile("../configures/" + foldername + "." + language + ".htm", content, function(err3) {
		if(err3) {
			console.log(err3);
		}
	});
});