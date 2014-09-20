var data = {};
var query = function (p) {
    var dfd = new $.Deferred();
    if (!p) {
        return;
    }
    if(!p.hasOwnProperty('mapService') || !p.hasOwnProperty('layerID')) {
        return;
    }
    // handle text, where, relationParam, objectIds, maxAllowableOffset
    var params = _.clone(p);
    var url = params.mapService + '/' + params.layerID;
    delete params.mapService;
    delete params.layerID;

    if (p.hasOwnProperty('geometry')) {
        params.geometryType = 'esriGeometryPolygon';
        params.geometry = '{rings:[[' + _.map(p.geometry, function(pt) {
            return '[' + pt.lng.toFixed(6) + ',' + pt.lat.toFixed(6) + ']';
        }).join(',') + ']], spatialReference:{wkid:4326}}';
        params.inSR = 4326;
    }
    if (p.spatialRelationship) {
        params.spatialRel = p.spatialRelationship;
        delete params.spatialRelationship;
    }
    if (p.outFields && $.isArray(p.outFields)) {
        params.outFields = p.outFields.join(',');
    }
    if (p.objectIds) {
        params.objectIds = p.objectIds.join(',');
    }
    if (p.time) {
        params.time = formatTimeString_(p.time, p.endTime);
    }
    params.outSR = 4326;
    params.returnGeometry = p.returnGeometry === false ? false : true;
    params.returnIdsOnly = p.returnIdsOnly === true ? true : false;
    getJSON_(url + '/query', params, '', function(json) {
        if(json) {
            dfd.resolve(json);
        } else {
            dfd.resolve({status: 'Error'});
        }
    });
    return dfd.promise();
};

  /**
   * Export an image with given parameters.
   * For more info see <a  href  = 'http://sampleserver3.arcgisonline.com/ArcGIS/SDK/REST/export.html'>Export Operation</a>.
   * <br/> The <code>params</code> is an instance of {@link ExportMapOptions}.
   * The following properties will be set automatically if not specified:...
   * <br/> The <code>callback</code> is the callback function with argument of
   * an instance of {@link MapImage}.
   * @param {ExportMapOptions} params
   * @param {Function} callback
   * @param {Function} errback
   * @return {String|None} url of image if f=image, none if f=json
   */
  var exportMap = function (p) {
      var dfd = new $.Deferred();
      if (!p || !p.bounds) {
        return;
      }
      var url = p.mapService;
      // note: dynamic map may overlay on top of maptypes with different projection
      var params = {};// augmentObject_(p, );
      params.f = 'json';
      var bnds = p.bounds;
      params.bbox = '' + bnds.southWest.lng + ',' + '' + bnds.southWest.lat + ',' + bnds.northEast.lng + ',' + '' + bnds.northEast.lat;
      params.size = '' + p.width + ',' + p.height;
      params.imageSR = 102113;
      params.bboxSR = '4326';
      // for 9.3 compatibility:
      params.layerDefs = '';
      params.layers =  'show' + ':' + p.visibleLayers.join(',');
      params.transparent = true;
      getJSON_(url + '/export', params, '', function (json) {
        if (json.extent) {
          dfd.resolve(json);
        } else {
          dfd.resolve({status: 'Error'});
        }
      });
      return dfd.promise();
  };

var api = {
    query: query,
    exportMap: exportMap
};

module.exports = api;
