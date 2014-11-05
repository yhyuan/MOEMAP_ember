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
var MOEOccupants = require('../scripts/Configures/FacilitiesMap/Occupants');
var loginHTMLUI = 'Username: <input type="text" id="username" name="username">\
			Password: <input type="password" id="password" name="password">\
			<input id="login" type="submit" title="Login" onclick="MOECC_UI.login()" value="Login"></input>\
			<div id="information"></div>';
//var facilities;
var facsDict;
//var currentEditingObjectID = null;
var username;
var token;
var timeCount;
var timer;
var websiteURL = 'http://localhost:9000';
//var websiteURL = 'https://lrctptvsuaap003/FacilitiesMap/';
var gpURL = 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/Facilities4/GPServer/Facilities4/execute';
var tokenURL = 'https://lrctptvsuaap003:6443/arcgis/tokens/';
var mapService = 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/Facilities2/MapServer';
window.MOECC_UI = {
	logout: function() {
		$("#" + globalConfigure.searchControlDivId).html(loginHTMLUI);
		$("#" + globalConfigure.mapCanvasDivId).hide();
		$('#' + globalConfigure.queryTableDivId).html('');
		$("#" + globalConfigure.coordinatesDivId).html('');
		clearInterval(timer);
		token = '';
	},
	zoomInRecord: function (objectID) {
		timeCount = 0;
		var fac = facsDict[objectID];
		PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {zoomLevel: 10, center: {lat: fac.geometry.y, lng: fac.geometry.x}});
	},
	deleteRecord: function (objectID) {
		timeCount = 0;
		$.prompt("Do you really want to delete this facility?", {
			title: "Are you sure?",
			buttons: { "Yes, I am": true, "No, I am not": false },
			submit: function(e,v,m,f){
				if (v) {
					ArcGISServerAdapter.geoprocessing({
						gpURL: gpURL,
						username: username,
						token: token,
						ACTION: 'DELETE',
						DATA: objectID
					}).done(function() {
						PubSub.emit("MOECC_MAP_REMOVE_MARKER", {OBJECTID: objectID});
						var row = $('#row-' + objectID).closest('tr');
						$('#' + tableID).DataTable().fnDeleteRow(row[0]);
					});
				}
			}
		});
	},
	editRecord: function (objectID) {
		timeCount = 0;
		//currentEditingObjectID = objectID;
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD", {objectID: objectID});
	},
	leasedOwnedChange: function (leased_owned) {
		timeCount = 0;
		_.each(["LeaseExpiry", "LeaseExpiry1", "LeaseExpiry2"], function(div) {
			$("#" + div).prop('disabled', !$("#leased").is(':checked'));
		});
	},
	addRecord: function () {
		timeCount = 0;
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD");
	},
	cancelRecord: function(objectID) {
		timeCount = 0;
		PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
	},
	submitRecord: function(objectID) {
		timeCount = 0;
		var Occupants = _.map(_.filter(MOEOccupants.organizationTable, function(organization) {
			return $('#org' + organization.code).is(':checked');
		}), function(organization) {
			return organization.code;
		});
		var initParams = {address: $('#Address').val(), withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);	
		if (objectID) {
			var fac = facsDict[objectID];
			var DATA = {
				LOCATION: $('#Location').val(),
				TOTALSQUAREFEET: $('#TotalSquarFeets').val(),
				ANNUALCOST: $('#AnnualCost').val(),
				LEASEDOWNED: ($("#leased").is(':checked') ? 'Leased' : 'Owned'),
				LEASEEXPIRY: $('#LeaseExpiry').val(),
				LEASEEXPIRY1: $('#LeaseExpiry1').val(),
				LEASEEXPIRY2: $('#LeaseExpiry2').val(),
				OCCUPANTS: Occupants.join(','),
				NUMBEROFSTAFF: $('#NumberofStaffs').val(),
				STAFFCAPACITY: $('#StaffCapacity').val(),
				RSFPERFTE: $('#RSF_per_FTE').val(),
				NUMBEROFFLEET: $('#NumberofFleet').val(),
				LOCATIONNAME: $('#LocationName').val()
			};
			DATA = _.filter(_.map(_.keys(DATA), function(field) {return (DATA[field] === fac.attributes[field]) ? "" : (field + '|' + DATA[field]);}), function (item) {return item.length > 0;}).join('|');
			if (fac.attributes.ADDRESS !== $('#Address').val()) {
				Geocoder.geocode(geocodingParams).done(function(result) {
					if (result.status === "OK"){
						DATA = objectID + '|LATITUDE|' + result.latlng.lat.toFixed(6) + '|LONGITUDE|' + result.latlng.lng.toFixed(6) + '|ADDRESS|' + $('#Address').val() + '|' + DATA;
						ArcGISServerAdapter.geoprocessing({
							gpURL: gpURL,
							username: username,
							token: token,
							ACTION: 'UPDATE',
							DATA: DATA
						}).done(function() {
							PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED");
						});						
					} else {
						$.prompt("The address is not successfully verified. Please fix the errors.");
					}
				});
			} else {
				DATA = objectID + '|' + DATA;
				ArcGISServerAdapter.geoprocessing({
					gpURL: gpURL,
					username: username,
					token: token,
					ACTION: 'UPDATE',
					DATA: DATA
				}).done(function() {
					PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED");
				});
			}
		} else {
			Geocoder.geocode(geocodingParams).done(function(result) {
				if (result.status === "OK"){
					var DATA = [result.latlng.lat.toFixed(6), result.latlng.lng.toFixed(6), $('#Location').val(), $('#Address').val(), $('#TotalSquarFeets').val(), $('#AnnualCost').val(), ($("#leased").is(':checked') ? 'Leased' : 'Owned'), $('#LeaseExpiry').val(), $('#LeaseExpiry1').val(), $('#LeaseExpiry2').val(), Occupants.join(','), $('#NumberofStaffs').val(),$('#StaffCapacity').val(),$('#RSF_per_FTE').val(),$('#NumberofFleet').val(), $('#LocationName').val()].join('|'); 
					ArcGISServerAdapter.geoprocessing({
						gpURL: gpURL,
						username: username,
						token: token,
						ACTION: 'APPEND',
						DATA: DATA
					}).done(function() {
						PubSub.emit("MOECC_MAP_INITIALIZATION_FINISHED");
					});
				} else {
					$.prompt("The address is not successfully verified. Please fix the errors.");
				}
			});
		}
	},
	login: function() {
		username = $('#username').val();
		var password = $('#password').val();
		var promise = ArcGISServerAdapter.getToken({
			tokenURL: tokenURL,
			username: username,
			password: $('#password').val(),
			websiteURL: websiteURL,
			expiration: 600
		});
		promise.fail(function(){
			$('#information').html('<font color="red">Your username or password is wrong. Please try again.</font>');
		});
		promise.done(function(data) {
			token = data;
			timeCount = 0;
			timer = setInterval(function(){
				timeCount = timeCount + 1;
				if (timeCount >= 6) {
					MOECC_UI.logout();
				}
				PubSub.emit("MOECC_MAP_REGULAR_UPDATE");
			}, 1000*60*10); 			
			$("#" + globalConfigure.mapCanvasDivId).show();
			$("#" + globalConfigure.searchControlDivId).html('<input id="logout" type="submit" title="Logout" onclick="MOECC_UI.logout()" value="Logout"></input>\
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
		});
	}
};
PubSub.on("MOECC_MAP_REGULAR_UPDATE", function (params) {
	var queryParamsList = [{
		mapService: mapService,
		layerID: 0,
		returnGeometry: true,
		token: token,
		where: '1=1',
		outFields: ['*']
	}];
	ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
		var facilities = Util.combineFeatures(arguments);
		var newFacsDict = _.object(_.map(facilities, function(feature) {
			return feature.attributes.OBJECTID;
		}), facilities);
		var oldFacKeys = _.keys(facsDict);
		var newFacKeys = _.keys(newFacsDict);
		var deletedFacKeys = _.difference(oldFacKeys, newFacKeys);
		var addedFacKeys = _.difference(newFacKeys, oldFacKeys);
		var modiFacKeys = _.filter(_.intersection(oldFacKeys, newFacKeys), function (key) {
			return (!_.isEqual(facsDict[key].attributes, newFacsDict[key].attributes)) || (!_.isEqual(facsDict[key].geometry, newFacsDict[key].geometry));
		});
		if ((deletedFacKeys.length > 0)|| (addedFacKeys.length > 0) || (modiFacKeys.length > 0)){
			$.prompt("Because the data on server have been updated, your map and table will be refreshed now.");
			PubSub.emit("MOECC_MAP_UPDATE_MARKERS_TABLE", {features: facilities});				
		}
	});
	console.log("MOECC_MAP_REGULAR_UPDATE");
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
	var fac = (params) ?  facsDict[params.objectID] : {attributes: _.object(fields, _.range(fields.length).map(function () { return '' })),geometry:{x: 0,y: 0}};
	var tableContent = 'Facility Name: <input type="text" id="LocationName" name="LocationName" value="<%= fac.LOCATIONNAME %>"><br>\
		Municipality: <input type="text" id="Location" name="Location" value="<%= fac.LOCATION %>"><br>\
		Address: <input type="text" id="Address" name="Address" size="80" value="<%= fac.ADDRESS %>"><br>\
		Total Square Footage (Number Only): <input type="text" id="TotalSquarFeets" name="TotalSquarFeets" size="10" value="<%= fac.TOTALSQUAREFEET %>"><br>\
		Annual Cost (Number Only): $<input type="text" id="AnnualCost" name="AnnualCost" size="10" value="<%= fac.ANNUALCOST %>"><br>\
		Leased or Owned: <input type="radio" name="leased_owned" id="leased" value="Leased" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED.length === 0 || fac.LEASEDOWNED === "Leased")? "checked" : ""  %> >Leased<input type="radio" id="owned" name="leased_owned" value="Owned" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED === "Owned")? "checked" : ""  %>>Owned<br>\
		Lease Expiry (Date Only): <input type="text" id="LeaseExpiry" name="LeaseExpiry" size="10" value="<%= fac.LEASEEXPIRY %>">, \
		<input type="text" id="LeaseExpiry1" name="LeaseExpiry1" size="10" value="<%= fac.LEASEEXPIRY1 %>">,\
		<input type="text" id="LeaseExpiry2" name="LeaseExpiry2" size="10" value="<%= fac.LEASEEXPIRY2 %>"><br>\
		Number of Staff (Number Only): <input type="text" id="NumberofStaffs" name="NumberofStaffs" size="10" value="<%= fac.NUMBEROFSTAFF %>"><br>\
		Staff Capacity (Number Only): <input type="text" id="StaffCapacity" name="StaffCapacity" size="10" value="<%= fac.STAFFCAPACITY %>"><br>\
		RSF_per_FTE (Number Only): <input type="text" id="RSF_per_FTE" name="RSF_per_FTE" size="10" value="<%= fac.RSFPERFTE %>"><br>\
		Number of Fleet (Number Only): <input type="text" id="NumberofFleet" name="NumberofFleet" size="10" value="<%= fac.NUMBEROFFLEET %>"><br>\
		Occupants: ' + _.template(tableTemplate, {organizations: MOEOccupants.organizationTable}) + '\
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
	var tableTemplate = '<button type="submit" onclick="MOECC_UI.addRecord()" style="background-color:transparent; border-color:transparent;"><img src="Add-icon.png" height="20"/></button><br>\
		<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
		<thead><tr><th><center>ID</center></th><th><center>Facility Name</center></th><th><center>Municipality</center></th><th><center>Address</center></th><th><center>Total Square Footage</center></th>\
		<th><center>Annual Cost</center></th><th><center>Lease Expiry</center></th><th><center>Owned or Leased</center></th><th><center>Occupants</center></th>\
		<th><center>Number of Staff</center></th><th><center>Staff Capacity</center></th><th><center>RSF per FTE</center></th><th><center>Number of Fleet</center></th>\
		<th><center>Action</center></th></tr></thead><tbody>\
		<% _.each(features, function(feature) {\
			var attrs = feature.attributes; %> \
			<tr><td><div id="row-<%= attrs.OBJECTID %>"><%= attrs.OBJECTID %></div></td><td><%= attrs.LOCATIONNAME %></td><td><%= attrs.LOCATION %></td><td><%= attrs.ADDRESS %></td><td><%= attrs.TOTALSQUAREFEET %></td><td><%= attrs.ANNUALCOST %></td>\
			<td><%= attrs.LEASEEXPIRY %><%= attrs.LEASEEXPIRY1 === "" ? " " : (", " + attrs.LEASEEXPIRY1) %><%= attrs.LEASEEXPIRY2 === "" ? " " : (", " + attrs.LEASEEXPIRY2) %></td>\
			<td><%= attrs.LEASEDOWNED %></td><td><%= convertOccupantsCode(attrs.OCCUPANTS) %></td><td><%= attrs.NUMBEROFSTAFF %></td><td><%= attrs.STAFFCAPACITY %></td><td><%= attrs.RSFPERFTE %></td><td><%= attrs.NUMBEROFFLEET %></td>\
			<td><button type="submit" onclick="MOECC_UI.zoomInRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="zoom-in-2-xxl.png" height="20"/></button>\
			<button type="submit" onclick="MOECC_UI.editRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="Edit.png" height="20"/></button>\
			<button type="submit" onclick="MOECC_UI.deleteRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="DeleteRed.png" height="20"/></button></td></tr>\
		<% }); %>\
		</tbody></table>';
	var convertOccupantsCode = function (OccupantsCode) {
		return _.map(OccupantsCode.split(','), function(code) {
			return MOEOccupants.codeToName[code];
		}).join(',');
	};
	var tableContent = _.template(tableTemplate, {features: params.features, convertOccupantsCode: convertOccupantsCode});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	tableID = Util.getTableIDFromTableTemplate(tableTemplate);	
	var dataTableOptions = {
		'bJQueryUI': true,
		iDisplayLength: 50,
		"aaSorting": [[2, "asc" ]],
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
					PubSub.emit("MOECC_MAP_MOUSEOUT_TABLE", {OBJECTID: objectID});
				}
			});
		}		
	};
	$('#' + tableID).dataTable(dataTableOptions);	
});
PubSub.on("MOECC_MAP_INITIALIZATION_FINISHED", function (params) {
	PubSub.emit("MOECC_MAP_REMOVE_ALL_MARKER");
	//currentEditingObjectID = null;
	var queryParamsList = [{
		mapService: mapService,
		layerID: 0,
		returnGeometry: true,
		token: token,
		where: '1=1',
		outFields: ['*']
	}];
	ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
		var facilities = Util.combineFeatures(arguments);
		PubSub.emit("MOECC_MAP_UPDATE_MARKERS_TABLE", {features: facilities});
	});
});
PubSub.on("MOECC_MAP_UPDATE_MARKERS_TABLE", function (params) {
	var facilities = params.features;
	facsDict = _.object(_.map(facilities, function(feature) {
		return feature.attributes.OBJECTID;
	}), facilities);
	var markers = _.map(facilities, function(facility) {
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
			}
		};
	});
	PubSub.emit("MOECC_MAP_SEARCH_MARKERS_READY", {markers: markers});
	PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY", {features: facilities});
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
$("#" + globalConfigure.searchControlDivId).html(loginHTMLUI);
/*English Ends*/
/*French Begins*/
$("#" + globalConfigure.searchControlDivId).html(loginHTMLUI);
/*French Ends*/
