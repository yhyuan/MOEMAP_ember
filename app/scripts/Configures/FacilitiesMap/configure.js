/* global _, $, google */
'use strict';
//facilitesEditor
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
var occupants = {
	"Drinking Water Management Division": {
		"Assistant Deputy Minister's Office":null,
		"Drinking Water Programs Branch":null,
		"Safe Drinking Water Branch":null,
		"Source Protection Programs Branch":null
	},
	"Operations Division": {
		"Assistant Deputy Minister's Office":null,
		"Environmental Approvals Access and Service Integration Branch":null,
		"Environmental Approvals Branch":null,
		"Operations Integration/Spills Action Centre":null,
		"Sector Compliance Branch":null,
		"Investigations and Enforcement":null,
		"Central Regional Office":{
			"Barrie District Office":null,
			"Halton-Peel District Office":null,
			"Toronto District Office":null,
			"York-Durham District Office":null
		},
		"Eastern Regional Office":{
			"Kingston District Office":{
				"Belleville Area Office": null
			},
			"Ottawa District Office":{
				"Cornwall Area Office": null
			},
			"Peterborough District Office":null
		},
		"Northern Regional Office":{
			"Thunder Bay District Office": {
				"Kenora Area Office": null
			},
			"Sudbury District Office": {
				"North Bay Area Office": null,
				"Sault Ste Marie Area Office": null
			},
			"Timmins District Office": null
		},
		"Southwestern Regional Office":{
			"London District Office": null,
			"Owen Sound District Office": null,
			"Sarnia District Office": {
				"Windsor Area Office": null
			}
		},
		"West Central Regional Office":{
			"Hamilton District Office": null,
			"Guelph District Office": null,
			"Niagara District Office": null
		},
		"Northern Development Initiatives":null	
	},
	"Corporate Management Division": {
		"Assistant Deputy Minister's Office":null,
		"Business and Fiscal Planning Branch":null,
		"Information Management & Access Branch":null,
		"Strategic Human Resources Branch":null,
		"Transition Office":null,
		"French Language Services":null	
	},
	"Environmental Sciences and Standards Division": {
		"Assistant Deputy Minister's Office":null,
		"Drive Clean Office":null,
		"Environmental Monitoring and Reporting Branch":null,
		"Laboratory Services Branch":null,
		"Standards Development Branch":null	
	},
	"Integrated Environmental Policy Division": {
		"Assistant Deputy Minister's Office":null,
		"Air Policy and Climate Change Branch":null,
		"Air Policy Instruments and Program Design Branch":null,
		"Land and Water Policy Branch":null,
		"Environmental Intergovernmental Affairs Branch":null,
		"Strategic Policy Branch":null,
		"Waste Management Policy Branch":null	
	},
	"Environmental Programs Division": {
		"Assistant Deputy Minister's Office":null,
		"Aboriginal Affairs Branch":null,
		"Environmental Innovations Branch":null,
		"Program Planning and Implementation Branch":null,
		"Modernization of Approvals Branch ":null
	},
	"Minister's Office": {
		"Parliamentary Assistant":null	
	},
	"Deputy Minister's Office": {
		"Communications Branch":null,
		"Legal Services":null,
		"Ontario Internal Audit, Resources and Labour Audit Services Team":null	
	}
};

var getTableFromTree = function (tree, level, topname) {
	var names = _.keys(tree);
	var result = [];
	_.each(_.range(names.length), function (i) {
		var name = names[i];
		if (topname.length !== 0) {
			name = topname + ' - ' + name;
		}
		var code = level + (i + 1);
		_.each(_.range(code.length, 4), function (j) {
			code = code + '0';
		});
		result.push({
			name: name,
			code: code
		});
		var subtree = tree[names[i]];
		if (subtree) {
			result = result.concat(getTableFromTree(subtree, level + (i + 1), name));
		}
	});
	return result;
};
var organizationTable = getTableFromTree(occupants, '', '');
var organizationCodes = _.map(organizationTable, function(row) {
	return row.code;
});
var organizationNames = _.map(organizationTable, function(row) {
	return row.name;
});
var codeToName = _.object(organizationCodes, organizationNames);
var nameToCode = _.object(organizationNames, organizationCodes);

var facilities;
var username;
var token;
var websiteURL = 'http://localhost:9000';
//var websiteURL = 'http://lrcdrrvsdvap002/web/FacilitiesMap/FacilitiesMap.en.htm';
var gpURL = 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/Facilities3/GPServer/Facilities3/execute';
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
		PubSub.emit("MOECC_MAP_SET_CENTER_ZOOMLEVEL", {zoomLevel: 10, center: {lat: fac.geometry.y, lng: fac.geometry.x}});
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
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD", {objectID: objectID});
	},
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
	addRecord: function () {
		PubSub.emit("MOECC_MAP_ADD_EDIT_RECORD");
	},
	cancelRecord: function(objectID) {
		PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
	},
	submitRecord: function(objectID) {
		var Occupants = [];
		_.each(organizationTable, function(organization) {
			if ($('#org' + organization.code).is(':checked')) {
				Occupants.push(organization.code);
			}
		});	
		var initParams = {address: $('#Address').val(), withinExtent: false};
		var geocodingParams = _.defaults(initParams, GeocoderSettings);	
		if (objectID) {
			var fac = _.find(facilities, function(facility) {
				return facility.attributes.OBJECTID === objectID;
			});
			var fields = ["LOCATION", "TOTALSQUAREFEET", "ANNUALCOST", "LEASEDOWNED", "LEASEEXPIRY", "LEASEEXPIRY1", "LEASEEXPIRY2", "OCCUPANTS", "NUMBEROFSTAFF", "STAFFCAPACITY", "RSFPERFTE", "NUMBEROFFLEET"];
			var DATA = _.object(fields, [$('#Location').val(), $('#TotalSquarFeets').val(), $('#AnnualCost').val(), ($("#leased").is(':checked') ? 'Leased' : 'Owned'), $('#LeaseExpiry').val(), $('#LeaseExpiry1').val(), $('#LeaseExpiry2').val(), Occupants.join(','), $('#NumberofStaffs').val(),$('#StaffCapacity').val(),$('#RSF_per_FTE').val(),$('#NumberofFleet').val()]);
			DATA = _.filter(_.map(fields, function(field) {
				if (DATA[field] === fac.attributes[field])  {
					return "";
				} else {
					return field + '|' + DATA[field];
				}
			}), function (item) {
				return item.length > 0;
			}).join('|');
			if (fac.attributes.ADDRESS !== $('#Address').val()) {
				Geocoder.geocode(geocodingParams).done(function(result) {
					if (result.status === "OK"){
						DATA = objectID + '|LATITUDE|' + result.latlng.lat.toFixed(6) + '|LONGITUDE|' + result.latlng.lng.toFixed(6) + '|ADDRESS|' + $('#Address').val() + '|' + DATA;
						var url = gpURL + '?USER=' + username+ '&ACTION=UPDATE&DATA=' + DATA + '&env%3AoutSR=&env%3AprocessSR=&returnZ=false&returnM=false&f=pjson&token=' + token;					
						PubSub.emit("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", {url: url});
					} else {
						$.prompt("The address is not successfully verified. Please fix the errors.");
					}
				});
			} else {
				DATA = objectID + '|' + DATA;
				var url = gpURL + '?USER=' + username+ '&ACTION=UPDATE&DATA=' + DATA + '&env%3AoutSR=&env%3AprocessSR=&returnZ=false&returnM=false&f=pjson&token=' + token;
				PubSub.emit("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", {url: url});
			}
		} else {
			Geocoder.geocode(geocodingParams).done(function(result) {
				if (result.status === "OK"){
					var DATA = [result.latlng.lat.toFixed(6), result.latlng.lng.toFixed(6), $('#Location').val(), $('#Address').val(), $('#TotalSquarFeets').val(), $('#AnnualCost').val(), ($("#leased").is(':checked') ? 'Leased' : 'Owned'), $('#LeaseExpiry').val(), $('#LeaseExpiry1').val(), $('#LeaseExpiry2').val(), Occupants.join(','), $('#NumberofStaffs').val(),$('#StaffCapacity').val(),$('#RSF_per_FTE').val(),$('#NumberofFleet').val()].join('|'); 
					var url = gpURL + '?USER=' + username+ '&ACTION=APPEND&DATA=' + DATA + '&env%3AoutSR=&env%3AprocessSR=&returnZ=false&returnM=false&f=pjson&token=' + token;
					PubSub.emit("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", {url: url});
				} else {
					$.prompt("The address is not successfully verified. Please fix the errors.");
				}
			});
		}
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
				$("#" + globalConfigure.searchControlDivId).html('You have successfully loged in. The system will automatically log you out if no activity is detected with 10 minutes.\
					<input id="login" type="submit" title="Login" onclick="MOECC_UI.logout()" value="Logout"></input>');			
				token = data;
				var queryParamsList = [{
					mapService: 'https://lrctptvsuaap003:6443/arcgis/rest/services/Interactive_Map_Internal/Facilities2/MapServer',
					layerID: 0,
					returnGeometry: true,
					token: token,
					where: '1=1',
					outFields: ['*']
				}];
				ArcGISServerAdapter.queryLayers(queryParamsList).done(function() {
					//console.log(arguments);
					facilities = Util.combineFeatures(arguments);
					//console.log(facilities);
					
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
PubSub.on("MOECC_MAP_GEOPROCESSING_ADD_EDIT_READY", function (params) {
	$.ajax({
		url: params.url,
		type: 'GET',
		dataType: 'json',
		beforeSend: function() {				
		},
		success: function(data, textStatus, xhr) {
			var queryParamsList = [{
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
			});
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
		Address: <input type="text" id="Address" name="Address" size="50" value="<%= fac.ADDRESS %>"><br>\
		Total Square Feets (Number Only): <input type="text" id="TotalSquarFeets" name="TotalSquarFeets" size="10" value="<%= fac.TOTALSQUAREFEET %>"><br>\
		Annual Cost (Number Only): <input type="text" id="AnnualCost" name="AnnualCost" size="10" value="<%= fac.ANNUALCOST %>"><br>\
		Leased or Owned: <input type="radio" name="leased_owned" id="leased" value="Leased" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED.length === 0 || fac.LEASEDOWNED === "Leased")? "checked" : ""  %> >Leased<input type="radio" id="owned" name="leased_owned" value="Owned" onclick="MOECC_UI.leasedOwnedChange(this)" <%= (fac.LEASEDOWNED === "Owned")? "checked" : ""  %>>Owned<br>\
		Lease Expiry (Date Only): <input type="text" id="LeaseExpiry" name="LeaseExpiry" size="10" value="<%= fac.LEASEEXPIRY %>">, \
		<input type="text" id="LeaseExpiry1" name="LeaseExpiry1" size="10" value="<%= fac.LEASEEXPIRY1 %>">,\
		<input type="text" id="LeaseExpiry2" name="LeaseExpiry2" size="10" value="<%= fac.LEASEEXPIRY2 %>"><br>\
		Number of Staffs (Number Only): <input type="text" id="NumberofStaffs" name="NumberofStaffs" size="10" value="<%= fac.NUMBEROFSTAFF %>"><br>\
		Staff Capacity (Number Only): <input type="text" id="StaffCapacity" name="StaffCapacity" size="10" value="<%= fac.STAFFCAPACITY %>"><br>\
		RSF_per_FTE (Number Only): <input type="text" id="RSF_per_FTE" name="RSF_per_FTE" size="10" value="<%= fac.RSFPERFTE %>"><br>\
		Number of Fleet (Number Only): <input type="text" id="NumberofFleet" name="NumberofFleet" size="10" value="<%= fac.NUMBEROFFLEET %>"><br>\
		Occupants: ' + _.template(tableTemplate, {organizations: organizationTable}) + '\
		<input id="submitRecord" type="submit" title="submitRecord" onclick="MOECC_UI.submitRecord(<%= fac.OBJECTID %>)" value="Submit"></input>\
		<input id="cancelRecord" type="submit" title="cancelRecord" onclick="MOECC_UI.cancelRecord(<%= fac.OBJECTID %>)" value="Cancell"></input>';
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
});

PubSub.on("MOECC_MAP_SEARCH_TABLE_READY", function (params) {	
	var tableTemplate = '<button type="submit" onclick="MOECC_UI.addRecord()" style="background-color:transparent; border-color:transparent;"><img src="Add-icon.png" height="20"/></button><br>\
	<table id="myTable" class="tablesorter" width="700" border="0" cellpadding="0" cellspacing="1">\
	<thead><tr><th><center>ID</center></th><th><center>Location</center></th><th><center>Address</center></th><th><center>Total Square Feet</center></th>\
	<th><center>Annual Cost</center></th><th><center>Lease Expiry</center></th><th><center>Owned or Leased</center></th><th><center>Occupants</center></th>\
	<th><center>Number of Staff</center></th><th><center>Staff Capacity</center></th><th><center>RSF per FTE</center></th><th><center>Number of Fleet</center></th>\
	<th><center>Action</center></th></tr></thead><tbody>\
	<% _.each(features, function(feature) {\
		var attrs = feature.attributes; %> \
		<tr><td><div id="row-<%= attrs.OBJECTID %>"><%= attrs.OBJECTID %></div></td><td><%= attrs.LOCATION %></td><td><%= attrs.ADDRESS %></td><td><%= attrs.TOTALSQUAREFEET %></td><td><%= attrs.ANNUALCOST %></td>\
		<td><%= attrs.LEASEEXPIRY %><%= attrs.LEASEEXPIRY1 === "" ? " " : (", " + attrs.LEASEEXPIRY1) %><%= attrs.LEASEEXPIRY2 === "" ? " " : (", " + attrs.LEASEEXPIRY2) %></td>\
		<td><%= attrs.LEASEDOWNED %></td><td><%= convertOccupantsCode(attrs.OCCUPANTS) %></td><td><%= attrs.NUMBEROFSTAFF %></td><td><%= attrs.STAFFCAPACITY %></td><td><%= attrs.RSFPERFTE %></td><td><%= attrs.NUMBEROFFLEET %></td>\
		<td><button type="submit" onclick="MOECC_UI.zoomInRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="zoom-in-2-xxl.png" height="20"/></button><button type="submit" onclick="MOECC_UI.editRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="Edit.png" height="20"/></button><button type="submit" onclick="MOECC_UI.deleteRecord(<%= attrs.OBJECTID %>)" style="background-color:transparent; border-color:transparent;"><img src="DeleteRed.png" height="20"/></button></td></tr>\
	<% }); %>\
	</tbody></table>';
	var convertOccupantsCode = function (OccupantsCode) {
		return _.map(OccupantsCode.split(','), function(code) {
			return codeToName[code];
		}).join(',');
	};
	var tableContent = _.template(tableTemplate, {features: facilities, convertOccupantsCode: convertOccupantsCode});
	$('#' + globalConfigure.queryTableDivId).html(tableContent);
	tableID = Util.getTableIDFromTableTemplate(tableTemplate);	
	var dataTableOptions = {
		'bJQueryUI': true,
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
	PubSub.emit("MOECC_MAP_SEARCH_TABLE_READY");
});
var tableID;
PubSub.on("MOECC_MAP_MOUSEOVER_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseenter', [params.OBJECTID]);
});
PubSub.on("MOECC_MAP_MOUSEOUT_MARKER", function (params) {
	$('table#' + tableID + ' td').trigger('mouseleave', [params.OBJECTID]);
});
/*


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
*/
GoogleMapsAdapter.init(PubSub);
//var mainMapService = 'http://lrcdrrvsdvap002/ArcGIS/rest/services/Interactive_Map_Public/AirDispersionModellingMap1/MapServer';
var globalConfigure = {
	langs: langSetting,
	maxMapScale: 19
};
globalConfigure = _.defaults(globalConfigure, defaultConfiguration);

/*English Begins*/
//$('#' + globalConfigure.otherInfoDivId).html("");	
/*English Ends*/
/*French Begins*/
//$('#' + globalConfigure.otherInfoDivId).html('');
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