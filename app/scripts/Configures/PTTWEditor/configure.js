/* global _, $, google */
/*JAVASCRIPT
bower_components/underscore/underscore.js
bower_components/jquery.dataTables/jquery.dataTables.js
bower_components/jquery-impromptu/jquery-impromptu.min.js
bower_components/jquery.ui/ui/jquery.ui.core.js
bower_components/jquery.ui/ui/jquery.ui.datepicker.js
JAVASCRIPT*/

/*CSS
bower_components/jquery.dataTables/jquery.dataTables.css
bower_components/jquery-impromptu/jquery-impromptu.min.css
scripts/Configures/FacilitiesMap/Facilities.css
CSS*/


'use strict';
//facilitesEditor
/*Geocoder setup starts*/
//var GeographicTownship = require('../scripts/Geocoders/GeographicTownship');
//var GeographicTownshipWithLotConcession = require('../scripts/Geocoders/GeographicTownshipWithLotConcession');
var LatLngInDecimalDegree = require('../scripts/Geocoders/LatLngInDecimalDegree');
var LatLngInDMSSymbols = require('../scripts/Geocoders/LatLngInDMSSymbols');
var LatLngInSymbols = require('../scripts/Geocoders/LatLngInSymbols');
var UTM = require('../scripts/Geocoders/UTM');
var UTMInDefaultZone = require('../scripts/Geocoders/UTMInDefaultZone');
var GoogleGeocoder = require('../scripts/Geocoders/GoogleGeocoder');
var Geocoder = require('../scripts/Geocoders/Geocoder');
var defaultGeocoderConfigurations = require('../scripts/Geocoders/configurations/default');
var GeocoderSettings = {
	//GeocoderList: [LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone, GeographicTownship, GeographicTownshipWithLotConcession],
	GeocoderList: [LatLngInDecimalDegree, LatLngInDMSSymbols, LatLngInSymbols, UTM, UTMInDefaultZone],
	defaultGeocoder: GoogleGeocoder/*,
	reverseGeocoder: GoogleReverseGeocoder*/
};
GeocoderSettings = _.defaults(defaultGeocoderConfigurations, GeocoderSettings);
Geocoder.init(GeocoderSettings);
/*Geocoder setup ends*/
var GoogleMapsAdapter = require('../scripts/Basemaps/GoogleMapsAdapter');

var facilities;
var username;
var token;
var timeCount;
var timer;
var websiteURL = 'http://localhost:9000';
//var websiteURL = 'http://lrcdrrvsdvap002/web/FacilitiesMap/FacilitiesMap.en.htm';
var gpURL = 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/PTTW/GPServer/PTTW/execute';
window.MOECC_UI = {
	logout: function() {
		$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
			Password: <input type="password" id="password" name="password">\
			<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
			<div id="information"></div>');
		$("#" + globalConfigure.mapCanvasDivId).hide();
		$('#' + globalConfigure.queryTableDivId).html('');
		clearInterval(timer);
		token = '';
	},
	zoomInRecord: function (objectID) {
		timeCount = 0;
		var fac = _.find(facilities, function(facility) {
			return facility.attributes.OBJECTID === objectID;
		});
		PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {zoomLevel: 18, center: {lat: fac.geometry.y, lng: fac.geometry.x}});
	},
	deleteRecord: function (objectID) {
		timeCount = 0;
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
					var DATA = '' + fac.attributes.OBJECTID;
					var url = gpURL + '?USER=' + username+ '&ACTION=DELETE&DATA=' + DATA + '&env%3AoutSR=&env%3AprocessSR=&returnZ=false&returnM=false&f=pjson&token=' + token;
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						beforeSend: function() {
							
						},
						success: function(data, textStatus, xhr) {
							PubSub.emit("MOECC_MAP_REMOVE_MARKER", {OBJECTID: fac.attributes.OBJECTID});
							$('#row-' + objectID).parent().parent().children().each(function(){
								$(this).css("display","none");
							});
						},
						error: function(xhr, textStatus, errorThrown) {
							console.log(textStatus);
						}
					});					
				}
			}
		});		
	},
	editRecord: function (objectID) {
		timeCount = 0;
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD", {objectID: objectID});
	},
	leasedOwnedChange: function (leased_owned) {
		timeCount = 0;
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
	addRecord: function () {
		timeCount = 0;
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD");
	},
	cancelRecord: function(objectID) {
		timeCount = 0;
		PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
	},
	submitRecord: function() {
		timeCount = 0;		
		var DATA =  $('#OBJECTID').val() + '|LATITUDE|' + $('#Latitude').val() + '|LONGITUDE|' + $('#Longitude').val();
		var url = gpURL + '?USER=' + username+ '&ACTION=UPDATE&DATA=' + DATA + '&env%3AoutSR=&env%3AprocessSR=&returnZ=false&returnM=false&f=pjson&token=' + token;					
		PubSub.emit("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", {url: url, OBJECTID: $('#OBJECTID').val(), LATITUDE: $('#Latitude').val(), LONGITUDE: $('#Longitude').val()});
	},
	login: function() {
		username = $('#username').val();
		var password = $('#password').val();
		var url = 'https://lrctptvsuaap003:6443/arcgis/tokens/?request=gettoken&username=' + username + '&password=' + password + '&clientid=ref.' + websiteURL + '&expiration=600';
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			beforeSend: function() {				
			},
			success: function(data, textStatus, xhr) {
				token = data;
				$("#" + globalConfigure.mapCanvasDivId).show();
				$("#" + globalConfigure.searchControlDivId).html('<input type="text" id="Address" name="Address" size="50" value=""></input>&nbsp;&nbsp;<input id="search" type="submit" title="Search Location" onclick="MOECC_UI.searchLocation()" value="Search Location"></input>&nbsp;&nbsp;<input id="logout" type="submit" title="Logout" onclick="MOECC_UI.logout()" value="Logout"></input>\
					<div id="information">You have successfully loged in. The system will automatically log you out if no activity is detected with 60 minutes.</div>');							
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
			},
			error: function(xhr, textStatus, errorThrown) {
				$('#information').html('<font color="red">Your username or password is wrong. Please try again.</font>');
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

/*
var url = defaultConfiguration.dynamicResourcesLoadingURL;
//var urls = [url + 'css/jquery.dataTables.css', url + 'js/jquery.dataTables.js'];
//var urls = [url + 'css/jquery.dataTables.css'];
var urls = ['bower_components/jquery.dataTables/jquery.dataTables.css'];
_.each(urls, function(url) {yepnope({load: url,callback: function(){}});});
*/

PubSub.on("MOECC_MAP_BOUNDS_CHANGED", function (params) {
	if (params.zoomLevel >= 13) {
		var queryParamsList = [{
			mapService: 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/PTTW/MapServer',
			layerID: 0,
			returnGeometry: true,
			geometry: params.bounds,
			token: token,
			where: '1=1',
			outFields: ['*']
		}];
		ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
			var features = Util.combineFeatures(arguments);
			//console.log(features.length);
			//console.log(features);
			var markers = _.map(features, function(facility) {
				return {
					latlng: {
						lng: facility.geometry.x, 
						lat: facility.geometry.y
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
					},
					//draggable: true
				};
			});
			facilities = features;
			PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: markers});
			PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY", {features: features});			
		});
	}
});

PubSub.on("MOECC_MAP_MARKER_DRAGEND", function (params) {
	console.log(params);
});
PubSub.on("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", function (params) {
	$.ajax({
		url: params.url,
		type: 'GET',
		dataType: 'json',
		beforeSend: function() {				
		},
		success: function(data, textStatus, xhr) {
			console.log(params);
			/*var queryParamsList = [{
				mapService: 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/Facilities2/MapServer',
				layerID: 0,
				returnGeometry: true,
				token: token,
				where: '1=1',
				outFields: ['*']
			}];
			ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
				facilities = Util.combineFeatures(arguments);
				PubSub.emit("MOECC_MAP_REMOVE_ALL_MARKER");
				PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED");
			});*/
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log(textStatus);
		}
	});	
});
PubSub.on("MOECC_MAP_ADD_EDIT_RECORD", function (params) {
	var tableTemplate = '<table id="organizationTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center></center></th><th><center>Name</center></th></tr></thead><tbody>\
		<% _.each(organizations, function(organization) {\
			%> \
			<tr><td><input type="checkbox" name="org<%= organization.code %>" value="org<%= organization.code %>" id="org<%= organization.code %>" ></td><td><%= organization.name %></td></tr>\
		<% }); %>\
		</tbody></table>';
	var fields = ["LOCATION", "ADDRESS", "TOTALSQUAREFEET", "ANNUALCOST", "LEASEDOWNED", "LEASEEXPIRY", "LEASEEXPIRY1", "LEASEEXPIRY2", "OCCUPANTS", "NUMBEROFSTAFF", "STAFFCAPACITY", "RSFPERFTE", "NUMBEROFFLEET"];
	var fac = (params) ? _.find(facilities, function(facility) {return facility.attributes.OBJECTID === params.objectID;}) : {attributes: _.object(fields, _.range(fields.length).map(function () { return '' })),geometry:{x: 0,y: 0}};
	var tableContent = 'Location: <input type="text" id="Location" name="Location" value="<%= fac.LOCATION %>"><br>\
		Address: <input type="text" id="Address" name="Address" size="100" value="<%= fac.ADDRESS %>"><br>\
		Facility Name: <input type="text" id="LocationName" name="LocationName" value="<%= fac.LOCATIONNAME %>"><br>\
		Total Square Footage (Number Only): <input type="text" id="TotalSquarFeets" name="TotalSquarFeets" size="10" value="<%= fac.TOTALSQUAREFEET %>"><br>\
		Annual Cost (Number Only)$: <input type="text" id="AnnualCost" name="AnnualCost" size="10" value="<%= fac.ANNUALCOST %>"><br>\
		Leased or Owned: <input type="radio" name="leased_owned" id="leased" value="Leased" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED.length === 0 || fac.LEASEDOWNED === "Leased")? "checked" : ""  %> >Leased<input type="radio" id="owned" name="leased_owned" value="Owned" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED === "Owned")? "checked" : ""  %>>Owned<br>\
		Lease Expiry (Date Only): <input type="text" id="LeaseExpiry" name="LeaseExpiry" size="10" value="<%= fac.LEASEEXPIRY %>">, \
		<input type="text" id="LeaseExpiry1" name="LeaseExpiry1" size="10" value="<%= fac.LEASEEXPIRY1 %>">,\
		<input type="text" id="LeaseExpiry2" name="LeaseExpiry2" size="10" value="<%= fac.LEASEEXPIRY2 %>"><br>\
		Number of Staff (Number Only): <input type="text" id="NumberofStaffs" name="NumberofStaffs" size="10" value="<%= fac.NUMBEROFSTAFF %>"><br>\
		Staff Capacity (Number Only): <input type="text" id="StaffCapacity" name="StaffCapacity" size="10" value="<%= fac.STAFFCAPACITY %>"><br>\
		RSF_per_FTE (Number Only): <input type="text" id="RSF_per_FTE" name="RSF_per_FTE" size="10" value="<%= fac.RSFPERFTE %>"><br>\
		Number of Fleet (Number Only): <input type="text" id="NumberofFleet" name="NumberofFleet" size="10" value="<%= fac.NUMBEROFFLEET %>"><br>\
		Occupants: ' + _.template(tableTemplate, {organizations: organizationTable}) + '\
		<input id="submitRecord" type="submit" title="submitRecord" onclick="MOECC_UI.submitRecord(<%= fac.OBJECTID %>)" value="Submit"></input>\
		<input id="cancelRecord" type="submit" title="cancelRecord" onclick="MOECC_UI.cancelRecord(<%= fac.OBJECTID %>)" value="Cancel"></input>';
	tableContent = 	_.template(tableContent, {fac: fac.attributes})
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	if (fac.attributes.OCCUPANTS.length > 0) {
		_.each(fac.attributes.OCCUPANTS.split(','), function(code) {
			$('#org' + code).prop('checked', true);
		});
	}
	tableID = Util.getTableIDFromTableTemplate(tableTemplate);	
	var dataTableOptions = {
		'bJQueryUI': true,
		iDisplayLength: 100,
		"aaSorting": [[1, "asc" ]],
		'sPaginationType': 'full_numbers'		
	};
	$('#' + tableID).dataTable(dataTableOptions);
	_.each(['LeaseExpiry', 'LeaseExpiry1', 'LeaseExpiry2'], function(divID) {
		$( "#" + divID).datepicker();	
	});
	_.each(['Location', 'Address'], function(divID) {
		$('#' + divID).on('input', function() {
			var input=$(this);
			var is_name=input.val();
			if(is_name){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});		
	});
	_.each(['TotalSquarFeets', 'LeaseCost', 'NumberofStaffs', 'StaffCapacity', 'RSF_per_FTE', 'NumberofFleet'], function(divID) {
		$('#' + divID).on('input', function() {
			var re = /^\d+$/
			var input=$(this);
			var is_int=re.test(input.val());
			if(is_int){input.removeClass("invalid").addClass("valid");}
			else{input.removeClass("valid").addClass("invalid");}
		});
	});
});

PubSub.on("MOECC_MAP_SEARCH_TABLE_READY", function (params) {
	var fieldList = [{
			column: 'ID',
			field: 'OBJECTID'
		},{
			column: 'Permit#',
			field: 'PERMITNO'
		},{
			column: 'Client Name',
			field: 'CLIENTNAME'
		},{
			column: 'Purpose',
			field: 'PURPOSECAT'
		}/*,{
			column: 'Expiry Date',
			field: 'EXPIRYDATE'
		},{
			column: 'Issued Data',
			field: 'ISSUEDDATE'
		},{
			column: 'Renew Date',
			field: 'RENEWDATE'
		}*/];
	
	var tableTemplate = 'OBJECTID: <input type="text" id="OBJECTID" name="OBJECTID" size="10" value="">\
		Latitude: <input type="text" id="Latitude" name="Latitude" size="10" value="">\
		Longitude: <input type="text" id="Longitude" name="Longitude" size="10" value="">\
		<input id="submitRecord" type="submit" title="submitRecord" onclick="MOECC_UI.submitRecord()" value="Update"></input><br>\
		<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>' + _.map(fieldList, function(f) {return f.column;}).join('</center></th><th><center>') + '</center></th><th><center>Action</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><div id="row-<%= attrs.OBJECTID %>"><%= attrs.OBJECTID %></div></td><td><%= attrs.' + _.map(_.rest(fieldList), function(f) {return f.field;}).join(' %></td><td><%= attrs.') + ' %></td>\
			<td><button type="submit" onclick="MOECC_UI.zoomInRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="zoom-in-2-xxl.png" height="20"/></button></td></tr>\
		<% }); %>\
		</tbody></table>';
	//console.log(tableTemplate);
	var tableContent = _.template(tableTemplate, {features: params.features});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	tableID = Util.getTableIDFromTableTemplate(tableTemplate);	
	var dataTableOptions = {
		'bJQueryUI': true,
		iDisplayLength: 50,
		"aaSorting": [[0, "asc" ]],
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
					/*var fac = _.find(params.features, function(facility) {
						return facility.attributes.OBJECTID === objectID;
					});
					PubSub.emit("MOECC_MAP_MOUSEOVER_TABLE", {OBJECTID: fac.attributes.OBJECTID});
					*/
					PubSub.emit("MOECC_MAP_MOUSEOVER_TABLE", {OBJECTID: objectID});
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
					/*var fac = _.find(params.features, function(facility) {
						return facility.attributes.OBJECTID === objectID;
					});
					PubSub.emit("MOECC_MAP_MOUSEOUT_TABLE", {OBJECTID: fac.attributes.OBJECTID});
					*/
					PubSub.emit("MOECC_MAP_MOUSEOUT_TABLE", {OBJECTID: objectID});
				}
			});
		}		
	};
	$('#' + tableID).dataTable(dataTableOptions);	
});
PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function (params) {
	PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: []});
	PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY", {features: []});
});
var tableID;
PubSub.on("MOECC_MAP_MOUSEOVER_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseenter', [params.OBJECTID]);
});
PubSub.on("MOECC_MAP_MOUSEOUT_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseleave', [params.OBJECTID]);
});
PubSub.on("MOECC_MAP_MOUSE_MOVE_MESSAGE", function (params) {
	var latLng = params.latlng;
	var utm = Util.convertLatLngtoUTM(latLng.lat, latLng.lng);
	$("#" + globalConfigure.coordinatesDivId).html("Latitude:" + latLng.lat.toFixed(5) + ", Longitude:" + latLng.lng.toFixed(5) + " (" + globalConfigure.langs.UTM_ZoneLang + ":" + utm.Zone + ", " + globalConfigure.langs.EastingLang + ":" + utm.Easting + ", " + globalConfigure.langs.NorthingLang +":" + utm.Northing + ")<br>");
});

GoogleMapsAdapter.init(PubSub);
var globalConfigure = {
	langs: langSetting,
	maxMapScale: 19
};
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);
/*English Begins*/
$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
	Password: <input type="password" id="password" name="password">\
	<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
	<div id="information"></div>');
/*English Ends*/
/*French Begins*/
$("#" + globalConfigure.searchControlDivId).html('Username: <input type="text" id="username" name="username">\
	Password: <input type="password" id="password" name="password">\
	<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
	<div id="information"></div>');
/*French Ends*/
