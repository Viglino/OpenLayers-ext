/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/

/**
* Function : OpenLayers.Layer.preview
* return a preview of the layer
*
* Extend
* - <OpenLayers.Layer>
*
* Parameters:
* lonlat - {OpenLayers.Lonlat} preview coordinates
* lonlat - {OpenLayers.Lonlat} preview coordinates
*
* Returns:
* {bool} - false if no preview
* {image} - the preview
*/

(function(){

// Usefull function
function getXYZ (layer, lonlat, zoom)
{	if (!lonlat) lonlat = layer.map.getCenter();
	if (!zoom) zoom = Math.round(layer.numZoomLevels/2)+layer.zoomOffset;

	var resolutions = layer.serverResolutions || layer.resolutions;
	var res = zoom-layer.zoomOffset;
	if (res < 0) res = 0;
	if (res >= resolutions.length) res = resolutions.length-1;
	zoom = res + layer.zoomOffset;
	
	var x = Math.floor ((lonlat.lon - layer.maxExtent.left) / layer.resolutions[res] / layer.tileSize.w);
	var y = Math.floor ((layer.maxExtent.top - lonlat.lat) / layer.resolutions[res] / layer.tileSize.h);
	
	console.log (lonlat.lon+","+lonlat.lat+" - "+x+","+y);
	return { x:x, y:y, z:zoom };
}

// Non default preview
OpenLayers.Layer.prototype.getPreview = function(lonlat, zoom)
{	return false;
}

// OpenLayers.Layer.XYZ
OpenLayers.Layer.XYZ.prototype.getPreview = function(lonlat, zoom)
{	var xyz = getXYZ(this,lonlat,zoom);
	
	var url = this.url.length ? this.url[0] : this.url;
	url = url.replace("${x}", xyz.x);
	url = url.replace("${y}", xyz.y);
	url = url.replace("${z}", xyz.z);
	
	var img = new Image();
	img.src = url;
	return img;
}

// OpenLayers.Layer.WMTS
OpenLayers.Layer.WMTS.prototype.getPreview = function(lonlat, zoom)
{
	var xyz = getXYZ(this,lonlat,zoom);

	var url = OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, [
			{	SERVICE: "WMTS",
				REQUEST: "GetTile",
				VERSION: this.version,
				LAYER: this.layer,
				STYLE: this.style,
				TILEMATRIXSET: this.matrixSet,
				TILEMATRIX: xyz.z,
				TILEROW: xyz.y,
				TILECOL: xyz.x,
				FORMAT: this.format
			}]);
	
	var img = new Image();
	img.src = url;
	return img
}

// OpenLayers.Layer.WMS
OpenLayers.Layer.WMS.prototype.getPreview = function(lonlat, zoom)
{	if (!lonlat) lonlat = this.map.getCenter();
	if (!zoom) zoom = map.getZoomForResolution ((this.maxResolution + this.minResolution)/2);
	var res = map.getResolutionForZoom (zoom);
	if (res >= this.maxResolution) res = (this.maxResolution + this.minResolution)/2;
	if (res <= this.minResolution) res = (this.maxResolution + this.minResolution)/2;

	var bounds = new OpenLayers.Bounds();
	var s = 256 * res / 2;
	bounds.extend(new OpenLayers.LonLat(lonlat.lon-s, lonlat.lat-s));
	bounds.extend(new OpenLayers.LonLat(lonlat.lon+s, lonlat.lat+s));
	
	var newParams = {};
    // WMS 1.3 introduced axis order
    var reverseAxisOrder = this.reverseAxisOrder();
    newParams.BBOX = this.encodeBBOX ?
        bounds.toBBOX(null, reverseAxisOrder) :
        bounds.toArray(reverseAxisOrder);
    newParams.WIDTH = 256;
    newParams.HEIGHT = 256;
    var url = this.getFullRequestString(newParams);

	var img = new Image();
	img.src = url;
	return img;
}

})();