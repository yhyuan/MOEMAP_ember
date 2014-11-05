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

var api = {
	codeToName: codeToName,
	organizationTable: organizationTable
};

module.exports = api;