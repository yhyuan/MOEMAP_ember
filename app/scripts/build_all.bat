set list=GreatLakesWatershedLocator DistrictLocator LakePartner PGMN PTTW PWQMN SportFish TRAIS Wells
set langlist=en fr

(for %%a in (%list%) do (
	(for %%b in (%langlist%) do (
		node build.js %%a %%b

		node ..\..\node_modules\browserify\bin\cmd.js ..\configures\configure.language.js > ..\configures\configure.js

		node concatenate.js %%a %%b

		node ..\..\node_modules\grunt-contrib-uglify\node_modules\uglify-js\bin\uglifyjs ..\configures\%%a.%%b.js > ..\configures\%%a.%%b.min.js
	))
))



