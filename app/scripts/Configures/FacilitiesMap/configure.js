/* global _, $, google */
'use strict';
/*Geocoder setup starts*/
var GeographicTownship = require('../scripts/Geocoders/GeographicTownship');
var GeographicTownshipWithLotConcession = require('../scripts/Geocoders/GeographicTownshipWithLotConcession');
var LatLngInDecimalDegree = require('../scripts/Geocoders/LatLngInDecimalDegree');
var LatLngInDMSSymbols = require('../scripts/Geocoders/LatLngInDMSSymbols');
var LatLngInSymbols = require('../scripts/Geocoders/LatLngInSymbols');
var UTM = require('../scripts/Geocoders/UTM');
var UTMInDefaultZone = require('../scripts/Geocoders/UTMInDefaultZone');
var GoogleGeocoder = require('../scripts/Geocoders/GoogleGeocoder');
var Geocoder = require('../scripts/Geocoders/Geocoder');
var defaultGeocoderConfigurations = require('../scripts/Geocoders/configurations/default');
var GeocoderSettings = {
	GeocoderList: [LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone, GeographicTownship, GeographicTownshipWithLotConcession],
	defaultGeocoder: GoogleGeocoder/*,
	reverseGeocoder: GoogleReverseGeocoder*/
};
GeocoderSettings = _.defaults(defaultGeocoderConfigurations, GeocoderSettings);
Geocoder.init(GeocoderSettings);
/*Geocoder setup ends*/
var GoogleMapsAdapter = require('../scripts/Basemaps/GoogleMapsAdapter');
var facilities; 
var websiteURL = 'http://localhost:9000';
//var websiteURL = 'http://lrcdrrvsdvap002/web/FacilitiesMap/FacilitiesMap.en.htm';
window.MOECC_UI = {
	logout: function() {
		$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
			Password: <input type="password" id="password" name="password">\
			<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
			<div id="information">Please log in</div>');
		
	},
	zoomInRecord: function (objectID) {
		var fac = _.find(facilities, function(facility) {
			return facility.attributes.OBJECTID === objectID;
		});
		PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {zoomLevel: 10, center: {lat: fac.attributes.POINT_Y, lng: fac.attributes.POINT_X}});
	},
	deleteRecord: function (objectID) {
		$.prompt("Do you really want to delete this facility?", {
			title: "Are you sure?",
			buttons: { "Yes, I am": true, "No, I am not": false },
			submit: function(e,v,m,f){
				// use e.preventDefault() to prevent closing when needed or return false. 
				// e.preventDefault(); 
				if (v) {
					var fac = _.find(facilities, function(facility) {
						return facility.attributes.OBJECTID === objectID;
					});
					PubSub.emit("MOECC_MAP_REMOVE_MARKER", {OBJECTID: fac.attributes.OBJECTID});
					$('#row-' + objectID).parent().parent().children().each(function(){
						$(this).css("display","none");
					});					
				}
			}
		});		
	},
	editRecord: function (objectID) {
		console.log(objectID);
	},
	/*validateAddress: function() {
		var initParams = {address: $('#Address').val(), withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);
		Geocoder.geocode(geocodingParams).done(function(result) {
			if (result.status === "OK"){
				$('#addRecordConfirmed').removeAttr('disabled');
				//result.latlng
				$.prompt("The address is verified now.");
			} else {
				$.prompt("The address is not successfully verified. Please fix the errors.");			}
		});
	},*/
	leasedOwnedChange: function (leased_owned) {
		if ($("#leased").is(':checked'))  {
			$("#LeaseExpiry").prop('disabled', false);
			$("#LeaseExpiry1").prop('disabled', false);
			$("#LeaseExpiry2").prop('disabled', false);
		} else {
			$("#LeaseExpiry").prop('disabled', true);
			$("#LeaseExpiry1").prop('disabled', true);
			$("#LeaseExpiry2").prop('disabled', true);
		}
	},
	addOccupant: () {
		
	},
	addRecord: function () {
		var tableContent = 'Location: <input type="text" id="Location" name="Location"><br>\
		Address: <input type="text" id="Address" name="Address" size="50"><br>\
		Total Square Feets (Number Only): <input type="text" id="TotalSquarFeets" name="TotalSquarFeets" size="10"><br>\
		Annual Cost (Number Only): <input type="text" id="LeaseCost" name="LeaseCost" size="10"><br>\
		Leased or Owned: <input type="radio" name="leased_owned" id="leased" value="leased" onclick="MOECC_UI.leasedOwnedChange(this)" checked>Leased<input type="radio" id="owned" name="leased_owned" value="owned" onclick="MOECC_UI.leasedOwnedChange(this)">Owned<br>\
		Lease Expiry (Date Only): <input type="text" id="LeaseExpiry" name="LeaseExpiry" size="10"><br>\
		Lease Expiry1 (Date Only): <input type="text" id="LeaseExpiry1" name="LeaseExpiry1" size="10"><br>\
		Lease Expiry2 (Date Only): <input type="text" id="LeaseExpiry2" name="LeaseExpiry2" size="10"><br>\
		Occupants: <textarea id="Occupants" name="Occupants" rows="4" cols="50"></textarea>\
		<input id="addOccupant" type="submit" title="addOccupant" onclick="MOECC_UI.addOccupant()" value="Submit"></input><br>\
		Number of Staffs (Number Only): <input type="text" id="NumberofStaffs" name="NumberofStaffs" size="10"><br>\
		Staff Capacity (Number Only): <input type="text" id="StaffCapacity" name="StaffCapacity" size="10"><br>\
		RSF_per_FTE (Number Only): <input type="text" id="RSF_per_FTE" name="RSF_per_FTE" size="10"><br>\
		Number of Fleet (Number Only): <input type="text" id="NumberofFleet" name="NumberofFleet" size="10"><br>\
		<input id="addRecordSubmited" type="submit" title="addRecordSubmited" onclick="MOECC_UI.addRecordSubmited()" value="Submit"></input>\
		<input id="addRecordCancelled" type="submit" title="addRecordCancelled" onclick="MOECC_UI.addRecordCancelled()" value="Cancell"></input>';
		$('#' + globalConfigure.queryTableDivId).html(tableContent);
		$( "#LeaseExpiry" ).datepicker();
		$( "#LeaseExpiry1" ).datepicker();
		$( "#LeaseExpiry2" ).datepicker();
		$('#Location').on('input', function() {
			var input=$(this);
			var is_name=input.val();
			if(is_name){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#Address').on('input', function() {
			var input=$(this);
			var is_name=input.val();
			if(is_name){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#TotalSquarFeets').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#LeaseCost').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#NumberofStaffs').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#StaffCapacity').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#RSF_per_FTE').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
		$('#NumberofFleet').on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
	},
	addRecordCancelled: function() {
		PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
	},
	addRecordSubmited: function() {
		var initParams = {address: $('#Address').val(), withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);
		Geocoder.geocode(geocodingParams).done(function(result) {
			if (result.status === "OK"){
				//result.latlng
				$.prompt("The address is verified now.");
			} else {
				$.prompt("The address is not successfully verified. Please fix the errors.");			}
		});		
	},
	login: function() {
		var username = $('#username').val();
		var password = $('#password').val();
		var url = 'https://lrctptvsuaap003:6443/arcgis/tokens/?request=gettoken&username=' + username + '&password=' + password + '&clientid=ref.' + websiteURL + '&expiration=1';
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			beforeSend: function() {				
			},
			success: function(data, textStatus, xhr) {
				$("#" + globalConfigure.searchControlDivId).html('You have successfully loged in. The system will automatically log you out if no activity is detected with 10 minutes.\
					<input id="login" type="submit" title="Login" onclick="MOECC_UI.logout()" value="Logout"></input>');			
				var token = data;
				var queryParamsList = [{
					mapService: 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/FacilitiesMap/MapServer',
					layerID: 0,
					returnGeometry: false,
					token: token,
					where: '1=1',
					outFields: ['*']
				}];
				ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
					facilities = Util.combineFeatures(arguments);
					PubSub.emit("MOECC_MAP_INITIALIZATION", {
						mapCanvasDivId: globalConfigure.mapCanvasDivId,
						orgLatitude: globalConfigure.orgLatitude,
						orgLongitude: globalConfigure.orgLongitude,
						orgzoomLevel: globalConfigure.orgzoomLevel,
						defaultMapTypeId: globalConfigure.defaultMapTypeId,
						maxQueryZoomLevel: globalConfigure.maxQueryZoomLevel,
						dynamicResourcesLoadingURL: globalConfigure.dynamicResourcesLoadingURL,
						maxMapScale: globalConfigure.maxMapScale,
						minMapScale: globalConfigure.minMapScale
					});
				});
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log(textStatus);
			}
		});
	}
};

var ArcGISServerAdapter = require('../scripts/FeatureLayers/ArcGISServerAdapter');
var Util = require('../scripts/Util');
/*English Begins*/
var langSetting = require('../scripts/Configures/Languages/English');
/*English Ends*/
/*French Begins*/
var langSetting = require('../scripts/Configures/Languages/French');
/*French Ends*/
var PubSub = require('../scripts/PubSub');
var defaultConfiguration = require('../scripts/Configures/Defaults');

var url = defaultConfiguration.dynamicResourcesLoadingURL;
var urls = [url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});

PubSub.on("MOECC_MAP_SEARCH_REQUEST_READY", function (params) {
	var infoWindowHeight = '140px';
	var infoWindowWidth = '280px';
	if (params.type === 'search') {
		var initParams = {address: params.searchString, withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);
		Geocoder.geocode(geocodingParams).done(function(result) {
			if (result.status === "OK") {
				
				PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {
					center: result.latlng,
					zoomLevel: (result.hasOwnProperty('zoomLevel')) ? result.zoomLevel : globalConfigure.maxQueryZoomLevel
				});
				
				if (result.hasOwnProperty('geometry')) {
					PubSub.emit("MOECC_MAP_ADD_POLYLINES", {
						geometry: result.geometry,
						boundary: result.boundary
					});
				}
				var radius = $('#lstRadius')[0].value * 1000;
				console.log(radius);
				var circle = Util.computeCircle(result.latlng, radius);
				var queryParamsList = _.map(_.range(5), function(num){
					return {
						mapService: mainMapService,
						layerID: num,
						returnGeometry: false,
						geometry: (num === 4) ? Util.computeCircle(result.latlng, 1) : circle,
						outFields: (num === 4) ? ['MOE_REGION'] : ['TILE']
					};
				});
				ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
					var moeRegion = 'N/A';
					if (arguments[4].features && arguments[4].features.length > 0) {
						moeRegion = arguments[4].features[0].attributes.MOE_REGION;
					}
					var tiles = _.map(Util.combineFeatures(_.initial(arguments)), function(feature) {
						return "<a href='https://www.ontario.ca/sites/default/files/moe_mapping/mapping/data/DEM/tile" + feature.attributes.TILE + ".zip'>" + feature.attributes.TILE + "</a>";
					}).join(', ');
					var container = document.createElement('div');
					container.style.width = infoWindowWidth;
					container.style.height = infoWindowHeight;
					container.innerHTML = 'The DEM for <strong>' + params.searchString + '</strong> with radius of <strong>' + $('#lstRadius')[0].value + '</strong> km can be downloaded at the following URLs:<strong>' + tiles + '</strong>';
					PubSub.emit("MOECC_MAP_GEOCODING_ADDRESS_MARKER_READY", {container: container, latlng: result.latlng});
					PubSub.emit("MOECC_MAP_OPEN_INFO_WINDOW", {container: container, latlng: result.latlng});
					
					//var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedOneResultLang);
					$('#' + globalConfigure.informationDivId).html('<i>' + container.innerHTML + '.</i>');		
				});
			} else {
				var message = (globalConfigure.langs.yourLocationSearchForLang + '<strong>' + params.searchString + '</strong> ' + globalConfigure.langs.returnedNoResultLang);
				$('#' + globalConfigure.informationDivId).html('<i>' + message + '</i>');		
			}
		});	
	}
});

PubSub.on("MOECC_MAP_SEARCH_TABLE_READY", function (params) {	
	var tableTemplate = '<button type="submit" onclick="MOECC_UI.addRecord()" style="background-color:transparent; border-color:transparent;"><img src="Add-icon.png" height="20"/></button><br><table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
	<thead><tr><th><center>ID</center></th><th><center>Location</center></th><th><center>Address</center></th><th><center>Total_Sq_Ft</center></th><th><center>Lease_Cost</center></th><th><center>Lease_Expiry</center></th><th><center>Occupants</center></th><th><center>Num_of_Staff</center></th><th><center>Staff_Cap</center></th><th><center>RSF_per_FTE</center></th><th><center>Num_of_Fleet</center></th><th><center>Action</center></th></tr></thead><tbody>\
	<% _.each(features, function(feature) {\
		var attrs = feature.attributes; %> \
		<tr><td><div id="row-<%= attrs.OBJECTID %>"><%= attrs.OBJECTID %></div></td><td><%= attrs.Location %></td><td><%= attrs.Address %></td><td><%= attrs.Total_Sq_Ft %></td><td><%= attrs.Lease_Cost %></td>\
		<td><%= attrs.Lease_Expiry %></td><td><%= attrs.Occupants %></td><td><%= attrs.Num_of_Staff %></td><td><%= attrs.Staff_Cap %></td><td><%= attrs.RSF_per_FTE %></td><td><%= attrs.Num_of_Fleet %></td>\
		<td><button type="submit" onclick="MOECC_UI.zoomInRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="zoom-in-2-xxl.png" height="20"/></button><button type="submit" onclick="MOECC_UI.editRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="Edit.png" height="20"/></button><button type="submit" onclick="MOECC_UI.deleteRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="DeleteRed.png" height="20"/></button></td></tr>\
	<% }); %>\
	</tbody></table>';
	
	var tableContent = _.template(tableTemplate, {features: facilities});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	tableID = Util.getTableIDFromTableTemplate(tableTemplate);	
	var dataTableOptions = {
		'bJQueryUI': true,
		//paging: false,
		iDisplayLength: 50,
		"aaSorting": [[1, "asc" ]],
		'sPaginationType': 'full_numbers',
		"fnDrawCallback": function(){
			$('table#' + tableID + ' td').bind('mouseenter', function (e, OBJECTID, myValue) {
				if (OBJECTID) {
					$('#row-' + OBJECTID).parent().parent().children().each(function(){
						$(this).addClass('datatablerowhighlight');
					});
				} else {
					$(this).parent().children().each(function(){
						$(this).addClass('datatablerowhighlight');
					});
					var objectID = parseInt($(this).parent()[0].cells[0].innerHTML.split('>')[1].split('<')[0]);
					var fac = _.find(facilities, function(facility) {
						return facility.attributes.OBJECTID === objectID;
					});
					PubSub.emit("MOECC_MAP_MOUSEOVER_TABLE", {OBJECTID: fac.attributes.OBJECTID});
				}
			});
			$('table#' + tableID + ' td').bind('mouseleave', function (e, OBJECTID, myValue) {
				if (OBJECTID) {
					$('#row-' + OBJECTID).parent().parent().children().each(function(){
						$(this).removeClass('datatablerowhighlight');
					});					
				} else {
					$(this).parent().children().each(function(){
						$(this).removeClass('datatablerowhighlight');
					});
					var objectID = parseInt($(this).parent()[0].cells[0].innerHTML.split('>')[1].split('<')[0]);
					var fac = _.find(facilities, function(facility) {
						return facility.attributes.OBJECTID === objectID;
					});
					PubSub.emit("MOECC_MAP_MOUSEOUT_TABLE", {OBJECTID: fac.attributes.OBJECTID});
				}
			});
		}		
	};
	$('#' + tableID).dataTable(dataTableOptions);	
});
PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function (params) {
	//console.log(facilities);
	var markers = _.map(facilities, function(facility) {
		return {
			latlng: {
				lng: facility.attributes.POINT_X, 
				lat: facility.attributes.POINT_Y
			},
			OBJECTID: facility.attributes.OBJECTID, 
			icon: {
				//url: 'http://www.centralparknyc.org/assets/images/map-thumbs/service-facilities.png',
				url: 'service-facilities.png',
				// This marker is 20 pixels wide by 32 pixels tall.
				size: new google.maps.Size(32, 37),
				// The origin for this image is 0,0.
				origin: new google.maps.Point(0,0),
				// The anchor for this image is the base of the flagpole at 0,32.
				anchor: new google.maps.Point(0, 32)
			},
			mouseoverIcon: {
				//url: 'http://www.tednolanfoundation.com/wp-content/uploads/leaflet-maps-marker-icons/home.png',
				url: 'home.png',
				// This marker is 20 pixels wide by 32 pixels tall.
				size: new google.maps.Size(32, 37),
				// The origin for this image is 0,0.
				origin: new google.maps.Point(0,0),
				// The anchor for this image is the base of the flagpole at 0,32.
				anchor: new google.maps.Point(0, 32)
			}
		};
	});
	PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: markers});
	PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
});
var tableID;
PubSub.on("MOECC_MAP_MOUSEOVER_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseenter', [params.OBJECTID]);
});
PubSub.on("MOECC_MAP_MOUSEOUT_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseleave', [params.OBJECTID]);
});



PubSub.on("MOECC_MAP_MOUSE_MOVE_MESSAGE", function (params) {
	
});
PubSub.on("MOECC_MAP_POINT_BUFFER_MESSAGE", function (params) {
	var lat = params.center.lat;
	var lng = params.center.lat;
	var radius = params.radiusInKM;
	$('#' + globalConfigure.informationDivId).html('<i>' + globalConfigure.langs.searchCenterLang + " (latitude:" + lat.toFixed(6) + ", longitude:" + lng.toFixed(6) + "), " + globalConfigure.langs.searchRadiusLang + " (" + radius.toFixed(2) + " " + globalConfigure.langs.searchKMLang + ")" + '</i>');
});
PubSub.on("MOECC_MAP_RESET_SEARCH_INPUTBOX", function (params) {
	$('#' + globalConfigure.searchInputBoxDivId)[0].value = '';
	$('#' + globalConfigure.searchInputBoxDivId)[0].focus();
});
PubSub.on("MOECC_MAP_RESET_QUERY_TABLE", function (params) {
	$("#" + globalConfigure.queryTableDivId).html('');
});
PubSub.on("MOECC_MAP_RESET_MESSAGE_CENTER", function (params) {
	$('#' + globalConfigure.informationDivId).html(globalConfigure.searchHelpText);
});	
GoogleMapsAdapter.init(PubSub);
var mainMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/AirDispersionModellingMap1/MapServer';
var globalConfigure = {
	langs: langSetting,
	maxMapScale: 19
};
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

/*English Begins*/
$('#' + globalConfigure.otherInfoDivId).html("");	
/*English Ends*/
/*French Begins*/
$('#' + globalConfigure.otherInfoDivId).html('');
/*French Ends*/
/*English Begins*/
$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
	Password: <input type="password" id="password" name="password">\
	<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
	<div id="information">Please log in</div>');
/*English Ends*/
/*French Begins*/
$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
	Password: <input type="password" id="password" name="password">\
	<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
	<div id="information">Please log in</div>');
/*French Ends*/

//PubSub.emit("MOECC_MAP_INITIALIZATION", globalConfigure);

/*
disallowMouseClick
extraImageServices
pointBufferToolCircle.color,  
pointBufferToolCircle.opacity,
pointBufferToolCircle.weight
pointBufferToolAvailable
legendAvailable
legendLocation
legendSize
legendURL
pointBufferToolSize
pointBufferToolLocation

pointBufferToolDownIcon
pointBufferToolUpIcon
langs.selectTooltip,
*/