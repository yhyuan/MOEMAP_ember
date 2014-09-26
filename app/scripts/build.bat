:: usage: build SportFish en

node build.js %1 %2

node ..\..\node_modules\browserify\bin\cmd.js ..\configures\configure.language.js > ..\configures\configure.js

node concatenate.js %1 %2

node ..\..\node_modules\grunt-contrib-uglify\node_modules\uglify-js\bin\uglifyjs ..\configures\%1.%2.js > ..\configures\%1.%2.min.js