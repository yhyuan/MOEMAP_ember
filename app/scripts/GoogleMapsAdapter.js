/* global _, $, google, goog, yepnope */
'use strict';
var Geocoder = require('./Geocoder');
var Util = require('./Util');
var ArcGISServerAdapter = require('./ArcGISServerAdapter');
var ImageOverlay = require('./GoogleMaps/ImageOverlay');
//var PubSub = require('./PubSub');

var map;
var overlays = [];
var globalConfigure;
var arcGISMapServices = [];
var previousBounds;
var infoWindow;
var marker;

var clear = function () {
	if (infoWindow) {
		infoWindow.setMap(null);
	}
	if (marker) {
		marker.setMap(null);
	}
	if (overlays) {
		_.each(overlays,function (overlay) {
			overlay.setMap(null);	
		});
	}
	$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
	$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
	$("#" + globalConfigure.queryTableDivId).html('');
	$('#' + globalConfigure.informationDivId).html(globalConfigure.searchHelpText);
	var center = new google.maps.LatLng(globalConfigure.orgLatitude, globalConfigure.orgLongitude);
	map.setCenter(center);
	map.setZoom(globalConfigure.orgzoomLevel);
};

var openInfoWindow = function (latlng, container){
	if (!infoWindow) {
		infoWindow = new google.maps.InfoWindow({
			content: container,
			position: latlng
		});
	} else {
		infoWindow.setContent(container);
		infoWindow.setPosition(latlng);
	}
	infoWindow.open(map);
};

var closeInfoWindow = function (){
	if (infoWindow) {
		infoWindow.setMap(null);
	}
};

var queryLayers = function (searchParams) {
	var queryParamsList = searchParams.queryParamsList;
	//var options = searchParams.options;
	var promises = _.map(queryParamsList, function(queryParams) {
		var result = {
			mapService: queryParams.mapService,
			layerID: queryParams.layerID,
			returnGeometry: queryParams.returnGeometry,
			where: queryParams.where,
			outFields: queryParams.outFields		
		};
		if (queryParams.hasOwnProperty('geometry')) {
			result.geometry = queryParams.geometry;
		}
		return ArcGISServerAdapter.query(result);
	});
	return $.when.apply($, promises);
};

var geocode = function(input) {
	var geocodeParams = {};
	var defaultGeocoder = function(params) {
		var dfd = new $.Deferred();			
		if (params.address.toUpperCase() === "ONTARIO") {
			var result = {
				status: 'No_Result'
			};
			dfd.resolve(result);
		} else {
			//Private method: test whether the input ends with region names.
			var regionAddressProcess = function(addressStr, defaultRegionNames){
				var isAddressEndsWithRegionName = function(address, str) {
					if (address.length > str.length + 1) {
						var substr = address.substring(address.length - str.length - 1);
						if (substr === (" " + str) || substr === ("," + str)) {
							return true;
						}
					}
					return false;
				};					
				var address = addressStr.toUpperCase();
				var res = _.some(defaultRegionNames, function(regionName) {
					return isAddressEndsWithRegionName(address, regionName);
				});
				if(!res){
					return addressStr + " Ontario";
				}
				return addressStr;
			};

			var Geocoder = new google.maps.Geocoder();
			Geocoder.geocode({
				'address': regionAddressProcess(params.address, params.defaultRegionNames)
			}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					var geocodeResult = _.find(results, function(result){
						var point = result.geometry.location;
						var failedPositions = _.filter(params.failedLocation.positions, function(position) {
							return ((Math.abs(point.lat() - position[0]) + Math.abs(point.lng() - position[1])) < params.failedLocation.difference);
						});
						return (failedPositions.length === 0) && (params.validateLatLngInPolygon({lat: point.lat(), lng: point.lng()}, params.regionBoundary));
					});
					if (geocodeResult) {
						var point = geocodeResult.geometry.location;
						var result = {
							latlng: {
								lat: point.lat(),
								lng: point.lng()
							},
							address: params.address,
							geocodedAddress: geocodeResult.formatted_address.toString(),
							status: 'OK'
						};
						dfd.resolve(result);
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				} else {
					dfd.resolve({status: 'No_Result'});
				}
			});
		}
		return dfd.promise();
	};

	if (input.hasOwnProperty('lat') && input.hasOwnProperty('lng')) {
		var reverseGeocoder = function(params) {
			var dfd = new $.Deferred();
			var Geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(input.lat, input.lng);
			Geocoder.geocode({'latLng': latlng}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						var result = {
							address: results[1].formatted_address,
							latlng: params.latlng,
							status: 'OK'
						};
						dfd.resolve(result);
					} else {
						dfd.resolve({status: 'No_Result'});
					}
				} else {
					dfd.resolve({status: 'No_Result'});
				}
			});
			return dfd.promise();
		};
		geocodeParams = {
			latlng: input,
			reverseGeocoder: reverseGeocoder
		};
	} else if (typeof input === 'string') {
		geocodeParams = {
			address: input,
			defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
			failedLocation: {
				positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
				difference: 0.00001
			},
			defaultGeocoder: defaultGeocoder
		};
	} else if (input.hasOwnProperty('GeocoderList') && input.hasOwnProperty('address')) {
		geocodeParams = {
			address: input.address,
			defaultRegionNames: ["ON", "ONT", "ONTARIO"], 
			failedLocation: {
				positions: [[51.253775,-85.32321389999998], [42.832714, -80.279923]],
				difference: 0.00001
			},			
			GeocoderList: input.GeocoderList,
			defaultGeocoder: defaultGeocoder
		};
	}
	return Geocoder.geocode(geocodeParams);
};


var init = function(initParams) {
	var globalConfigLanguage = {
		'EN': {
			SearchInteractiveMapFormLang: 'Search interactive map form',
			SearchInteractiveMapLang: 'Search the map',
			SearchLang: 'Search',
			TermLang: 'Term',
			InputBoxSizeLang: '415px',
			degreeSymbolLang: '&deg;',
			selectTooltip: 'Select',
			UTM_ZoneLang: 'UTM Zone',
			EastingLang: 'Easting',
			NorthingLang: 'Northing',
			noResultFoundMsg: 'Your search returned no result. Please refine your search.',
			searchCenterLang: 'Search center',
			searchRadiusLang: 'search radius',
			searchKMLang: 'KM',
			totalFeatureReturnedLang: 'Total features returned',
			only1DisplayedLang: ', only 1 is displayed.',
			westSymbolLang: 'W',
			distanceLang: 'Distance (KM)',
			searchingLang: 'Searching for results...',
			inGobalRegionLang: 'in Ontario',
			inCurrentMapExtentLang: 'in the current map display',
			forLang: 'for',
			yourSearchLang: 'Your search',
			returnedNoResultLang: 'returned no result',
			pleaseRefineSearchLang: 'Please refine your search',
			oneResultFoundLang: '1 result found',
			moreThanLang: 'More than',
			resultsFoundLang: 'results found',
			onlyLang: 'Only',
			returnedLang: 'returned',
			seeHelpLang: 'See help for options to refine your search',
			InformationLang: 'Information',
			CurrentMapDisplayLang: 'Search current map display only',
			CurrentMapDisplayTitleLang: 'Current Map Display: Limit your search to the area displayed',
			distanceFieldNote: 'The Distance(KM) column represents the distance between your search location and the permit location in the specific row.',
//			noCoordinatesTableTitleLang: 'The following table contains the records without valid coordinates. <a href=\'#WhyAmISeeingThis\'>Why am I seeing this?</a>',
			//whyAmISeeingThisLang: '<a id=\'WhyAmISeeingThis\'><strong>Why am I seeing this?</strong></a><br>The map locations shown as points have been determined by using addresses or other information to calculate a physical location on the map.  In some cases, the information needed to calculate a location was incomplete, incorrect or missing.  The records provided in the table have been included because there is a close match on the name or city/town or other field(s). These records may or may not be near your specified location, and users are cautioned in using these records. They have been included as potential matches only.',
			ThisResultDoesNotHaveValidCoordinates: 'This result does not have valid coordinates.',
			AmongReturnedResults: 'Among returned results',
			ResultDoesNotHaveValidCoordinates: ' result does not have valid coordinates.',
			ResultsDoNotHaveValidCoordinates: ' results do not have valid coordinates.',
			youMaySearchByLang: 'You may search by ',
			seeHelpForAdvancedOptionsLang: 'or see help for advanced options.'
		},
		'FR': {
			SearchInteractiveMapFormLang: 'Recherche carte interactive forme',
			SearchInteractiveMapLang: 'Recherche dans la carte interactive',
			SearchLang: 'Recherche',
			TermLang: 'Terme',
			InputBoxSizeLang: '450px',
			degreeSymbolLang: '&deg;',
			selectTooltip: 'Choisir',
			UTM_ZoneLang: 'Zone UTM',
			EastingLang: 'abscisse',
			NorthingLang: 'ordonn\u00e9e',
			noResultFoundMsg: 'Votre recherche n\'a produit aucun r\u00e9sultat. Veuillez affiner la recherche.',
			searchCenterLang: 'Cercle de recherche',
			searchRadiusLang: 'rayon de recherche',
			searchKMLang: 'km',
			totalFeatureReturnedLang: 'Nombre total de r\u00e9sultats',
			only1DisplayedLang: ', only 1 is displayed.',
			westSymbolLang: 'O',
			distanceLang: 'Distance (en km)',
			searchingLang: 'Recherche des r\u00e9sultats ...',
			inGobalRegionLang: 'en Ontario',
			inCurrentMapExtentLang: 'dans l\'affichage actuel de la carte',
			forLang: 'pour',
			yourSearchLang: 'Votre recherche',
			returnedNoResultLang: 'n\'a donn\u00e9 aucun r\u00e9sultat',
			pleaseRefineSearchLang: 'S\'il vous plait affiner votre recherche',
			oneResultFoundLang: '1 r\u00e9sultat',
			moreThanLang: 'Plus de',
			resultsFoundLang: 'r\u00e9sultats',
			onlyLang: 'Seulement',
			returnedLang: 'retourn\u00e9s',
			seeHelpLang: 'Consulter l\'aide pour affiner votre recherche',
			//disclaimerLang: '<p>Ce site web et toute l&rsquo;information qu&rsquo;il contient sont fournis sans garantie quelconque, expr&egrave;s ou tacite. <a href=\'/environment/fr/resources/collection/data_downloads/STDPROD_078138.html\'>Voir l&rsquo;avis de non-responsabilit&eacute;</a>.</p>';
			InformationLang: 'Information',
			CurrentMapDisplayLang: '\u00c9tendue de la carte courante',
			CurrentMapDisplayTitleLang: 'Afficher la carte : Limiter la recherche \u00e0 la carte donn\u00e9e.',
			distanceFieldNote: 'La colonne de distance (en km) donne la distance entre le lieu de votre recherche et le lieu du puits dans la rang\u00e9e donn\u00e9e.',
//			noCoordinatesTableTitleLang: 'Le tableau suivant contient des données sans coordonnées valides.  <a href=\'#WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a>',
//			whyAmISeeingThisLang: '<a id=\'WhyAmISeeingThis\'>Pourquoi cela s’affiche-t-il?</a><br>Les lieux indiqués par des points sur la carte ont été déterminés en fonction d’adresses ou d’autres renseignements servant à calculer un emplacement physique sur la carte. Dans certains cas, ces renseignements étaient incomplets, incorrects ou manquants. Les données fournies dans le deuxième tableau ont été incluses, car il y a une correspondance étroite avec le nom de la ville ou d’autre champ. Ces données peuvent ou non être proches du lieu précisé, et on doit les utiliser avec prudence. Elles ont été incluses seulement parce qu’il peut y avoir une correspondance.',
			ThisResultDoesNotHaveValidCoordinates: 'This result does not have valid coordinates.',
			AmongReturnedResults: 'Parmi les résultats obtenus',
			ResultDoesNotHaveValidCoordinates: ' résultat n’a pas de coordonnées valides.',
			ResultsDoNotHaveValidCoordinates: ' résultats n’ont pas de coordonnées valides.',
			youMaySearchByLang: 'Vous pouvez rechercher par ',
			seeHelpForAdvancedOptionsLang: 'ou consulter l\'aide pour de l\'information sur les recherches avanc&eacute;es.',
			dataTableLang: {
				'sProcessing':     'Traitement en cours...',
				'sSearch':         'Rechercher&nbsp;:',
				'sLengthMenu':     'Afficher _MENU_ &eacute;l&eacute;ments',
				'sInfo':           'Affichage de l\'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments',
				'sInfoEmpty':      'Affichage de l\'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments',
				'sInfoFiltered':   '(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)',
				'sInfoPostFix':    '',
				'sLoadingRecords': 'Chargement en cours...',
				'sZeroRecords':    'Aucun &eacute;l&eacute;ment &agrave; afficher',
				'sEmptyTable':     'Aucune donn&eacute;e disponible dans le tableau',
				'oPaginate': {
					'sFirst':      'Premier',
					'sPrevious':   'Pr&eacute;c&eacute;dent',
					'sNext':       'Suivant',
					'sLast':       'Dernier'
				},
				'oAria': {
					'sSortAscending':  ': activer pour trier la colonne par ordre croissant',
					'sSortDescending': ': activer pour trier la colonne par ordre d&eacute;croissant'
				}
			}		
		}
	};	
	var defaultParams = {
		searchControlDivId: 'searchControl',
		orgLatitude: 49.764775,
		orgLongitude: -85.323214,
		orgzoomLevel: 5,
		defaultMapTypeId: google.maps.MapTypeId.ROADMAP,
		mapCanvasDivId: 'map_canvas',
		isCoordinatesVisible: true,
		coordinatesDivId: 'coordinates',
		minMapScale: 5,
		maxMapScale: 21,
		disallowMouseClick: false,
		searchInputBoxDivId: 'map_query',
		informationDivId: 'information',
		maxQueryZoomLevel: 17,
		maxQueryReturn: 500,
		queryTableDivId: 'query_table',
		otherInfoDivId: 'otherInfo',
		infoWindowWidth: '280px',
		infoWindowHeight: '200px',
		infoWindowContentHeight: '160px',
		infoWindowContentWidth: '240px',
		preIdentifyCallbackName: 'Default',
		preIdentifyCallbackList: {
			'Default': function (identifySettings) {
				closeInfoWindow();
				var identifyRadiusZoomLevels = [-1, 320000, 160000, 80000, 40000, 20000, 9600, 4800, 2400, 1200, 600, 300, 160, 80, 50, 20, 10, 5, 3, 2, 1, 1];
				var radius = (identifySettings.hasOwnProperty('radius')) ?  identifySettings.radius : identifyRadiusZoomLevels[identifySettings.map.getZoom()];
				var circle = Util.computeCircle(identifySettings.latlng, radius);
				return {
					queryParamsList: _.map(identifySettings.identifyLayersList, function(layer) {
						return {
							mapService: layer.mapService,
							layerID: layer.layerID,
							returnGeometry: layer.hasOwnProperty('returnGeometry') ? layer.returnGeometry : false,
							outFields: layer.outFields,
							geometry: circle
						};
					})
				};
			}
		},
		identifyCallbackName: 'Default',
		identifyCallbackList: {
			'Default': queryLayers
		},
		postIdentifyCallbackName: 'OneFeatureNoTab',
		postIdentifyCallbackList: {
			/*If there are more than one layer, they must have the same structure. Or there is only one layer. 
			Get the first result from query results and use it to create the info window. The info window contains no tabs and no tables inside. 
			Sport Fish, Lake Partner, TRAIS, 
			*/
			'OneFeatureNoTab': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var attrs = features[0].attributes;  // The attributes for the first feature. 
				var container = document.createElement('div');
				container.style.width = globalConfigure.infoWindowWidth;
				container.style.height = globalConfigure.infoWindowHeight;
				container.innerHTML = _.template(identifySettings.identifyTemplate, {attrs: attrs, Util: Util, globalConfigure: globalConfigure});
				openInfoWindow(identifySettings.gLatLng, container);
			},
			/*Wells, Permits to take water, One tab with many features*/
			'ManyFeaturesOneTab': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var content = _.template(identifySettings.identifyTemplate, {features: features, Util: Util});
				var settings = {
					infoWindowWidth: globalConfigure.infoWindowWidth,
					infoWindowHeight: globalConfigure.infoWindowHeight,
					infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
					infoWindowContentWidth: globalConfigure.infoWindowContentWidth
				};
				var container = Util.createTabBar ([{
					label: globalConfigure.langs.InformationLang,
					content: content
				}], settings);
				openInfoWindow(identifySettings.gLatLng, container);
			},
			/*PWQMN, PGMN, many tabs with one features. identifyTemplate is an array with objects. Each object contains two perperties: label and content*/
			'OneFeatureManyTabs': function(results, identifySettings) {
				var featuresLength = Util.computeFeaturesNumber (results);
				if (featuresLength === 0) {
					return;
				}
				var features = Util.combineFeatures(results);
				var attrs = features[0].attributes;  // The attributes for the first feature. 
				var settings = {
					infoWindowWidth: globalConfigure.infoWindowWidth,
					infoWindowHeight: globalConfigure.infoWindowHeight,
					infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
					infoWindowContentWidth: globalConfigure.infoWindowContentWidth
				};
				var container = Util.createTabBar (_.map(identifySettings.identifyTemplate, function(template) {
					return {
						label: _.template(template.label,  {attrs: attrs, Util: Util, globalConfigure: globalConfigure}),
						content: _.template(template.content,  {attrs: attrs, Util: Util, globalConfigure: globalConfigure})
					};
				}), settings);
				openInfoWindow(identifySettings.gLatLng, container);			
			},
			/*District locator, watershed locator, source water protection One feature with no tab*/
			'OneFeatureNoTabPolygon': function(results, identifySettings) {
				var process = function (results, identifySettings, geocodingResult) {					
					var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
					$('#' + globalConfigure.informationDivId).html('<i>' + globalConfigure.generateMessage(results, geocodingResult, searchString) + '</i>');
					if (marker) {
						marker.setMap(null);
					}
					_.each(overlays, function(overlay){
						overlay.setMap(null);
					});
					overlays = [];

					var contents = identifySettings.identifyTemplate(results, Util, geocodingResult, searchString);

					$("#" + globalConfigure.queryTableDivId).html(contents.table);

					marker = new google.maps.Marker({
						map: map,
						draggable: true,
						position: identifySettings.gLatLng,
						visible: true
					});

					var boxText = document.createElement("div");
					boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: white; padding: 5px;";
					boxText.innerHTML = contents.infoWindow;

					var myOptions = {
						 content: boxText
						,disableAutoPan: false
						,maxWidth: 0
						,pixelOffset: new google.maps.Size(-140, 0)
						,zIndex: null
						,boxStyle: { 
						  background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat"
						  ,opacity: 0.75
						  ,width: "280px"
						 }
						,closeBoxMargin: "10px 2px 2px 2px"
						,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
						,infoBoxClearance: new google.maps.Size(1, 1)
						,isHidden: false
						,pane: "floatPane"
						,enableEventPropagation: false
					};

					google.maps.event.addListener(marker, "click", function (e) {
						infoWindow.open(map, this);
					});
					google.maps.event.addListener(marker, 'dragend', function (e) {
						$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
						$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
						$("#" + globalConfigure.queryTableDivId).html('');
						var latlng = marker.getPosition();
						map.setCenter(latlng);
						google.maps.event.trigger(map, 'click', {latLng: latlng});
					});
					infoWindow = new InfoBox(myOptions);

					infoWindow.open(map, marker);

					var isReturnGeometryTrue = _.some(identifySettings.identifyLayersList, function(setting) {return setting.returnGeometry;});
					if (isReturnGeometryTrue) {
						var polylinesOnMap = _.reduce(_.range(identifySettings.identifyLayersList.length), function(totalPolylines, i) {
							if (identifySettings.identifyLayersList[i].returnGeometry) {
								var strokeOptions = identifySettings.identifyLayersList[i].strokeOptions;
								var polylines = _.reduce(results[i].features, function(total, feature) {
									if(feature.hasOwnProperty('geometry')) {
										return total.concat(createPolylines(feature.geometry.rings, strokeOptions));
									} else {
										return total;
									}
								}, []);
								return totalPolylines.concat(polylines);
							} else {
								return totalPolylines;
							}
						}, []);
						_.each(polylinesOnMap, function(line){
							line.setMap(map);
							overlays.push(line);
						});
					}
				};

				if (identifySettings.hasOwnProperty('requireReverseGeocoding') && identifySettings.requireReverseGeocoding) {
					var geocodePromise = geocode(identifySettings.latlng);
					geocodePromise.done(function (result) {
						if (result.status === 'OK') {
							process (results, identifySettings, result);
						} else {
							process (results, identifySettings);
						}
					});
				} else {
					process (results, identifySettings);
				}
			}
		},
		preSearchCallbackName: 'Default',
		preSearchCallbackList: {
			'Default': function (searchString) {
				var searchParams = globalConfigure.getSearchParams(searchString);
				var queryParamsList = searchParams.queryParamsList;
				var options = searchParams.options;
				if(!!options && options.withinExtent) {
					var getCurrentMapExtent = function () {
						var b = map.getBounds();
						var ne = b.getNorthEast();
						var sw = b.getSouthWest();
						var nLat = ne.lat();
						var eLng = ne.lng();
						var sLat = sw.lat();
						var wLng = sw.lng();
						var swLatLng = {lat: sLat, lng: wLng};
						var seLatLng = {lat: sLat, lng: eLng};
						var neLatLng = {lat: nLat, lng: eLng};
						var nwLatLng = {lat: nLat, lng: wLng};
						return [swLatLng, seLatLng, neLatLng, nwLatLng, swLatLng];
					};
					var geometry = getCurrentMapExtent();
					_.each(queryParamsList, function(queryParams) {
						queryParams.geometry = geometry;
					});
				}
				return {
					queryParamsList: queryParamsList//, 
					//options: options
				};
			},
			'OneFeatureNoTabPolygon': function (searchString) {
				if (!!globalConfigure.searchGeocoderList) {
					return {
						GeocoderList: globalConfigure.searchGeocoderList,
						address: searchString
					};
				} else {
					return searchString;
				}
			}
		},
		searchCallbackName: 'Default',
		searchCallbackList: {
			'Default': queryLayers,
			'OneFeatureNoTabPolygon': geocode
		},
		postSearchCallbackName: 'OneFeatureNoTab',
		postSearchCallbackList: {
			/* If there is no returned result, it is allowed to call geocoding to geocode the location. 

			are more than one layer, they must have the same structure. Or there is only one layer. 
			Get the first result from query results and use it to create the info window. The info window contains no tabs and no tables inside. 
			Sport Fish, Lake Partner, TRAIS, 
			*/
			'OneFeatureNoTab': function(results) {
				var featuresLength = Util.computeFeaturesNumber (results);
				var searchString = $('#' + globalConfigure.searchInputBoxDivId).val().trim();
				var searchParams = globalConfigure.getSearchParams(searchString);
				var options = searchParams.options;
				if ((featuresLength === 0) && options.hasOwnProperty('geocodeWhenQueryFail') && options.geocodeWhenQueryFail && options.hasOwnProperty('searchString')) {
					var geocodingParams = options.searchString;
					if (options.hasOwnProperty('GeocoderList')) {
						geocodingParams = {
							GeocoderList: options.GeocoderList,
							address: options.searchString
						};
					}
					var geocodePromise = geocode(geocodingParams);
					geocodePromise.done(function(result){
						if (result.status === "OK") {
							//result.latlng result.geocodedAddress, map zoom to specific area, add a location pin to the location, update search message.
						} else {
							//update search meesage
						}
					});
					return;
				}

				var features = Util.combineFeatures(results);
				var splited = Util.splitResults(results, options.invalidFeatureLocations);
				var invalidNumber = Util.computeFeaturesNumber (splited.invalidResults);
				var invalidFeatures;
				if (invalidNumber > 0) {
					features =Util.combineFeatures(splited.validResults);
					invalidFeatures = Util.combineFeatures(splited.invalidResults);
				}
				if (invalidNumber > 0) {
					var str1 = _.template(globalConfigure.tableTemplate, {features: features, Util: Util, globalConfigure: globalConfigure});
					var str2 = _.template(globalConfigure.invalidTableTemplate, {features: invalidFeatures, Util: Util, globalConfigure: globalConfigure});
					$('#' + globalConfigure.queryTableDivId).html(str1 + '<br><br>' + str2);	
				} else {
					$('#' + globalConfigure.queryTableDivId).html(_.template(globalConfigure.tableTemplate, {features: features, Util: Util, globalConfigure: globalConfigure}));	
				}
				var dataTableOptions = {
					'bJQueryUI': true,
					'sPaginationType': 'full_numbers' 
				};
				if (globalConfigure.language !== 'EN') {
					dataTableOptions['oLanguage'] = globalConfigure.langs.dataTableLang;
				}
				var tableID = Util.getTableIDFromTableTemplate(globalConfigure.tableTemplate);
				$('#' + tableID).dataTable(dataTableOptions);
				if (invalidNumber > 0) {
					tableID = Util.getTableIDFromTableTemplate(globalConfigure.invalidTableTemplate);
					$('#' + tableID).dataTable(dataTableOptions);				
				}
				var markers = _.map(features, function(feature) {
					var gLatLng = new google.maps.LatLng(feature.geometry.y, feature.geometry.x);
					var container = document.createElement('div');
					container.style.width = globalConfigure.infoWindowWidth;
					container.style.height = globalConfigure.infoWindowHeight;
					var identifyTemplate = globalConfigure.identifySettings.identifyTemplate;
					if (typeof identifyTemplate == 'string' || identifyTemplate instanceof String) {
						container.innerHTML = _.template(identifyTemplate, {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure});
					} else if($.isArray(identifyTemplate)) {
						var settings = {
							infoWindowWidth: globalConfigure.infoWindowWidth,
							infoWindowHeight: globalConfigure.infoWindowHeight,
							infoWindowContentHeight: globalConfigure.infoWindowContentHeight,
							infoWindowContentWidth: globalConfigure.infoWindowContentWidth
						};
						container = Util.createTabBar (_.map(identifyTemplate, function(template) {
							return {
								label: _.template(template.label,  {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure}),
								content: _.template(template.content,  {attrs: feature.attributes, Util: Util, globalConfigure: globalConfigure})
							};
						}), settings);
					}

					var marker = new google.maps.Marker({
						position: gLatLng
					});		
					(function (container, marker) {
						google.maps.event.addListener(marker, 'click', function () {
							openInfoWindow(marker.getPosition(), container);
						});
					})(container, marker);
					return marker;
				});
				_.each(markers, function(marker){
					marker.setMap(map);
					overlays.push(marker);
				});

				if(options.hasOwnProperty('withinExtent') && !options.withinExtent) {
					var convertToGBounds = function(b) {
						var sw = new google.maps.LatLng(b.southWest.lat, b.southWest.lng);
						var ne = new google.maps.LatLng(b.northEast.lat, b.northEast.lng);			 
						var bounds = new google.maps.LatLngBounds(sw, ne);
						return bounds;
					};
					var bounds = convertToGBounds(Util.computePointsBounds(_.map(features, function(feature) {
						return {lng: feature.geometry.x, lat: feature.geometry.y};
					})));
					_.each(arcGISMapServices, function(arcGISMapService) {
						arcGISMapService.setMap(null);
					});
					map.fitBounds(bounds);
					var maxQueryZoomLevel = globalConfigure.maxQueryZoomLevel;
					if (map.getZoom() > maxQueryZoomLevel) {
						map.setZoom(maxQueryZoomLevel);
					}
				}
				var messageParams = {
					totalCount: featuresLength,
					maxQueryReturn: globalConfigure.maxQueryReturn,
					searchString: options.searchString,
					withinExtent: options.withinExtent
				};
				if (invalidNumber > 0) {
					messageParams.invalidCount = invalidNumber;
				}
				$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
			},
			/*District locator, watershed locator, source water protection One feature with no tab*/
			'OneFeatureNoTabPolygon': function(results) {
				if(results[0].status === 'OK') {
					var latlng = new google.maps.LatLng(results[0].latlng.lat, results[0].latlng.lng);
					_.each(arcGISMapServices, function(arcGISMapService) {
						arcGISMapService.setMap(null);
					});
					//console.log(results);
					map.setCenter(latlng);
					var zoomLevel = (results[0].hasOwnProperty('zoomLevel')) ? results[0].zoomLevel : globalConfigure.searchZoomLevel;
					map.setZoom(zoomLevel);
					google.maps.event.trigger(map, 'click', {latLng: latlng});
				} else {
					var messageParams = {
						totalCount: 0,
						maxQueryReturn: globalConfigure.maxQueryReturn,
						searchString: results[0].address
					};
					$('#' + globalConfigure.informationDivId).html('<i>' + Util.generateMessage(messageParams, globalConfigure.langs) + '</i>');
				}
			}
		}		
	};
	var params = _.defaults(initParams, defaultParams);
	params.searchHelpText = Util.getSearchHelpText(params.searchControlHTML);
	//console.log(params.searchHelpText);
	globalConfigure = params;
	if (globalConfigure.hasOwnProperty('otherInfoHTML')) {
		$('#' + globalConfigure.otherInfoDivId).html(globalConfigure.otherInfoHTML);
	}
	var url = 'http://files.ontariogovernment.ca/moe_mapping/mapping/js/MOEMap/';
	var urls = [];
	if(globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTabPolygon') {
		urls = urls.concat([url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js']);
	}	
	if(globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTab' && globalConfigure.postIdentifyCallbackName !== 'OneFeatureNoTabPolygon') {
		urls = urls.concat([url + 'css/multipletabs.css', url + 'js/closure-library-multipletabs-min.js']);
	}
	_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

	globalConfigure.langs = globalConfigLanguage[params.language];
	//search = params.search;
	$("#" + params.searchControlDivId).html(params.searchControlHTML);
	var center = new google.maps.LatLng(params.orgLatitude, params.orgLongitude);
	var mapOptions = {
		zoom: params.orgzoomLevel,
		center: center,
		scaleControl: true,
		streetViewControl: true,
		mapTypeId: params.defaultMapTypeId
	};
	if (globalConfigure.hasOwnProperty('extraImageServices')) {
		var ids = _.map(globalConfigure.extraImageServices, function(extraImageService) {return extraImageService.id;});
		mapOptions.mapTypeControlOptions = {
			mapTypeIds: ids.concat([google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN])
		};
	}
	map = new google.maps.Map($('#' + params.mapCanvasDivId)[0], mapOptions);
	if (globalConfigure.hasOwnProperty('extraImageServices')) {
		yepnope({load: 'http://lrcdrrvsdvap002/web/arcgislink.js',callback: function(){
			_.each(globalConfigure.extraImageServices, function(extraImageService) {
				var agsType = new gmaps.ags.MapType(extraImageService.url, {
					name: extraImageService.name
				});
				map.mapTypes.set(extraImageService.id, agsType);
			});			
		}});
	}

	/*bounds changed*/	
	var boundsChangedHandler = function() {
		if(previousBounds) {
			var computeBoundsDifference = function(b1, b2) {
				return Math.abs(b1.getNorthEast().lat() - b2.getNorthEast().lat()) + Math.abs(b1.getNorthEast().lng() - b2.getNorthEast().lng()) + Math.abs(b1.getSouthWest().lat() - b2.getSouthWest().lat()) + Math.abs(b1.getSouthWest().lng() - b2.getSouthWest().lng());
			};
			if (computeBoundsDifference(map.getBounds(), previousBounds) < 0.000000001) {
				return;
			}
		}

		_.each(arcGISMapServices, function(arcGISMapService) {
			arcGISMapService.setMap(null);
		});
		var convertBounds = function(latLngBounds) {
			var latLngNE = latLngBounds.getNorthEast();
			var latLngSW = latLngBounds.getSouthWest();
			return {
				southWest: {lat: latLngSW.lat(), lng: latLngSW.lng()},
				northEast: {lat: latLngNE.lat(), lng: latLngNE.lng()}
			};
		};
		var googleBounds = map.getBounds();
		var bounds = convertBounds(googleBounds);
		var div = map.getDiv();
		var width = div.offsetWidth;
		var height = div.offsetHeight;
		var promises = _.map(params.mapServices, function(mapService) {
			var exportParams =  {
				bounds: bounds,
				width: width,
				height: height,
				mapService: mapService.url,
				visibleLayers: mapService.visibleLayers
			};
			return ArcGISServerAdapter.exportMap(exportParams);
		});
		$.when.apply($, promises).done(function() {
			arcGISMapServices = _.map(arguments, function(argument) {
				return new ImageOverlay(googleBounds, argument.href, map);
			});
		});
		previousBounds = googleBounds;
	};
	/*Check bounds change every second.*/
	setInterval(boundsChangedHandler,1000);
	/*bounds changed*/
	/*mouse move*/
	var	mouseMoveHandler = function(event) {
		if(params.isCoordinatesVisible){
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			var utm = Util.convertLatLngtoUTM(lat, lng);
			$("#" + params.coordinatesDivId).html("Latitude:" + lat.toFixed(5) + ", Longitude:" + lng.toFixed(5) + " (" + globalConfigure.langs.UTM_ZoneLang + ":" + utm.Zone + ", " + globalConfigure.langs.EastingLang + ":" + utm.Easting + ", " + globalConfigure.langs.NorthingLang +":" + utm.Northing + ")<br>");
		}
	};
	google.maps.event.addListener(map, 'mousemove', mouseMoveHandler);
	google.maps.event.trigger(map, 'mousemove', {latLng: center});
	/*mouse move*/
	/*zoom changed*/
	var zoom_changedHandler = function () {
		if (map.getZoom() > params.maxMapScale) {
			map.setZoom(params.maxMapScale);
		}
		if (map.getZoom() < params.minMapScale) {
			map.setZoom(params.minMapScale);
		}
	};
	google.maps.event.addListener(map, 'zoom_changed', zoom_changedHandler);
	/*zoom changed*/
	/*mouse click*/
	var mouseClickHandler = function(event) {
		var identifySettings = _.clone(globalConfigure.identifySettings);
		identifySettings.gLatLng = event.latLng;
		identifySettings.latlng = {lat: event.latLng.lat(), lng: event.latLng.lng()};
		identifySettings.map = map;
		var identifyParams = globalConfigure.preIdentifyCallbackList[globalConfigure.preIdentifyCallbackName](identifySettings);
		var promise = globalConfigure.identifyCallbackList[globalConfigure.identifyCallbackName](identifyParams);
		promise.done(function () {
			globalConfigure.postIdentifyCallbackList[globalConfigure.postIdentifyCallbackName](arguments, identifySettings);
		});
	};	
	if (!globalConfigure.disallowMouseClick) {
		google.maps.event.addListener(map, 'click', mouseClickHandler);
	}
	/*mouse click*/
};

var search = function(input) {
	var searchString = (!!input) ? input : $('#' + globalConfigure.searchInputBoxDivId).val().trim();

	if(searchString.length === 0){
		return;
	}
	_.each(overlays, function(overlay){
		overlay.setMap(null);
	});
	overlays = [];

	var searchParams = globalConfigure.preSearchCallbackList[globalConfigure.preSearchCallbackName](searchString);
	var promise = globalConfigure.searchCallbackList[globalConfigure.searchCallbackName](searchParams);
	promise.done(function () {
		globalConfigure.postSearchCallbackList[globalConfigure.postSearchCallbackName](arguments);
	});
};




/*
	Usage: Add the polylines overlays on the map. If the LOCATOR module return the result for Township with/without 
	Lot and Concession, the related polygons will be add to Google Maps by this method. 
	Called by: queryLayerWithPointBuffer 
*/		
var createPolylines = function (rings, strokeOptions){
	return _.map(rings, function(ring) {
		return new google.maps.Polyline({    
			path: _.map(ring, function(pt) {
				return new google.maps.LatLng(pt[1], pt[0]);
			}),
			strokeColor: strokeOptions.color,    
			strokeOpacity: strokeOptions.opacity,   
			strokeWeight: strokeOptions.weight,
			geodesic: false
		});
	});
};

/*
	Usage: Create a marker on a location with pop up content and used icon. 
	Called by: queryLayerWithPointBuffer.
	Rely on: map, openInfoWindow function.  
*/	
/*var createMarker = function (latlng, popupContent, icon) {
	var gLatLng = new google.maps.LatLng(latlng.lat, latlng.lng);
	var marker = new google.maps.Marker({
		position: gLatLng,
		icon: icon
	});
	(function (popupContent, marker) {
		google.maps.event.addListener(marker, 'click', function () {
			MOEMAP.openInfoWindow(marker.getPosition(), popupContent);
		});
	})(popupContent, marker);
	return marker;
};*/



var entsub = function(event){
	if (event && event.which === 13){
		search();
	}else{
		return true;
	}
};

var searchChange = function (type) {
	globalConfigure.searchChange(type);
};

var setPubSub = function (thePubSub) {
	PubSub = thePubSub;
};

PubSub.on("MOECC_MAP_INITIALIZATION", function(configure) {
	
});

var api = {
	init: init,
    geocode: geocode,
    createPolylines: createPolylines,
	search: search,
	entsub: entsub,
	searchChange: searchChange,
	openInfoWindow: openInfoWindow,
	queryLayers: queryLayers,
	clear: clear,
	setPubSub
};

module.exports = api;