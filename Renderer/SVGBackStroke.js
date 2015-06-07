/* Copyright (c) 2015 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Draw symbols on a line
*
*	Add new options to the Openlayers.Style

lineSymbol: {String} Name of the symbol
lineSymbolRadius: {Number} Size of the symbol in pixel, default: 5
lineSymbolOffset: {Number} Line symbol offset, default 0
lineSymbolRepeat: {Number/String} Distance for line symbol repeat or 'center' to center symbol on line, default 0 : draw symbol at the end

*/

(function(){

/** 
 * Method: setStyle
 * Use to set all the style attributes to a SVG node.
 * 
 * Takes care to adjust stroke width and point radius to be
 * resolution-relative
 *
 * Parameters:
 * node - {SVGDomElement} An SVG element to decorate
 * style - {Object}
 * options - {Object} Currently supported options include 
 *                              'isFilled' {Boolean} and
 *                              'isStroked' {Boolean}
 */
var setStyle = OpenLayers.Renderer.SVG.prototype.setStyle;

/** 
 * Method: removeChildById
 * Remove child in a node.
 * 
 */
function removeChildById(node,id)
{	if (node.querySelector)	
	{	var c = node.querySelector("#"+id);
		if (c) node.removeChild(c);
		return;
	}
	// For old browsers
	var c = node.childNodes;
	if (c) for (var i=0; i<c.length; i++) 
	{	if (c[i].id == id) 
		{	node.removeChild(c[i]);
			return;
		}
	}
}

OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options)
{	// Default function
	setStyle.apply(this, arguments);

	// Draw line and symbols
	if (node._geometryClass=="OpenLayers.Geometry.LineString" && style.backstrokeWidth)
	{	
		if (!this.backstrokeRoot) 
		{	this.backstrokeRoot = this.createRoot("_broot");
			this.root.insertBefore(this.backstrokeRoot, this.root.firstChild);
			//this.rendererRoot.insertBefore(this.backstrokeRoot, this.root);
		}

		var id = node.getAttribute("id") + "_bpath";
		removeChildById(this.backstrokeRoot,  id);
		// Draw line
		var npath = this.nodeFactory(null, "path");
		npath.setAttributeNS(null, "id", id);

		npath.setAttributeNS(null, "d", "M "+node.getAttribute("points"));
        npath.setAttributeNS(null, "fill", "none");
        npath.setAttributeNS(null, "stroke", style.backstrokeColor || "#000");
        npath.setAttributeNS(null, "stroke-opacity", style.backstrokeOpacity || 1);
        npath.setAttributeNS(null, "stroke-width", style.backstrokeWidth || 5);
        npath.setAttributeNS(null, "stroke-linecap", style.backstrokeLinecap || "round");
        npath.setAttributeNS(null, "stroke-linejoin", "round");
        if (style.backstrokeDashstyle)
		{	var ls = style.strokeDashstyle;
			style.strokeDashstyle = style.backstrokeDashstyle;
			npath.setAttributeNS(null,"stroke-dasharray", this.dashStyle(style, 1));
			style.backstrokeDashstyle = ls;
		}
		npath.setAttributeNS(null, "pointer-events", "visible");
		npath._featureId = node._featureId;

		this.backstrokeRoot.appendChild(npath);
	}
	return node;
};

/** 
 * Method: drawGeometry 
 * Remove the textpath if no geometry is drawn.
 *
 * Parameters:
 * geometry - {<OpenLayers.Geometry>}
 * style - {Object}
 * featureId - {String}
 * 
 * Returns:
 * {Boolean} true if the geometry has been drawn completely; null if
 *     incomplete; false otherwise
 */
var drawGeometry = OpenLayers.Renderer.SVG.prototype.drawGeometry;
OpenLayers.Renderer.SVG.prototype.drawGeometry = function(geometry, style, id)
{   var rendered = drawGeometry.apply(this,arguments);
	if (this.backstrokeRoot && rendered === false && geometry.CLASS_NAME=="OpenLayers.Geometry.LineString") 
	{	removeChildById(this.backstrokeRoot,  geometry.id + "_bpath");
	}
	return rendered;
};

var clear = OpenLayers.Renderer.SVG.prototype.clear;
OpenLayers.Renderer.SVG.prototype.clear = function()
{   var root = this.backstrokeRoot;
    if (root) {
        while (child = root.firstChild) {
            root.removeChild(child);
        }
    }
	return clear.apply(this,arguments);
};

/** 
* Method: eraseGeometry
* Erase a geometry from the renderer. In the case of a multi-geometry, 
*     we cycle through and recurse on ourselves. Otherwise, we look for a 
*     node with the geometry.id, destroy its geometry, and remove it from
*     the DOM.
* 
* Parameters:
* geometry - {<OpenLayers.Geometry>}
* featureId - {String}
*/
var eraseGeometry = OpenLayers.Renderer.SVG.prototype.eraseGeometry;
OpenLayers.Renderer.SVG.prototype.eraseGeometry = function(geometry, featureId)
{   eraseGeometry.apply(this,arguments);
	if (this.backstrokeRoot && geometry.CLASS_NAME=="OpenLayers.Geometry.LineString") 
	{	removeChildById(this.backstrokeRoot,  geometry.id + "_bpath");
	}
};

})();