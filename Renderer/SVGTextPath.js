/* Copyright (c) 2015 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Overwrite the SVG function to allow text along a path
*	setStyle function 
*
*	Add new options to the Openlayers.Style

pathLabel: {String} Label to draw on the path
pathLabelXOffset: {String} Offset along the line to start drawing text in pixel or %, default: "50%"
pathLabelYOffset: {Number} Distance of the line to draw the text
pathLabelCurve: {String} Smooth the line the label is drawn on (empty string for no)
pathLabelReadable: {String} Make the label readable (empty string for no)

*	Extra standard values : all label and text values

*/

(function(){

/** 
 * Method: removeChildById
 * Remove child in a node.
 * 
 */
function removeChildById(node,id)
{	var c = node.children;
	for (var i=0; i<c.length; i++) 
	{	if (c[i].id == id) 
		{	node.removeChild(c[i]);
			return;
		}
	}
}


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
OpenLayers.Renderer.SVG.LABEL_STARTOFFSET = { "l":"0%", "r":"100%", "m":"50%" };

OpenLayers.Renderer.SVG.prototype.pathText = function (node, style, suffix)
{	var label = this.nodeFactory(null, "text");
	label.setAttribute("id",node._featureId+"_"+suffix);
	if (style.fontColor) label.setAttributeNS(null, "fill", style.fontColor);
	if (style.fontStrokeColor) label.setAttributeNS(null, "stroke", style.fontStrokeColor);
	if (style.fontStrokeWidth) label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
	if (style.fontOpacity) label.setAttributeNS(null, "opacity", style.fontOpacity);
	if (style.fontFamily) label.setAttributeNS(null, "font-family", style.fontFamily);
	if (style.fontSize) label.setAttributeNS(null, "font-size", style.fontSize);
	if (style.fontWeight) label.setAttributeNS(null, "font-weight", style.fontWeight);
	if (style.fontStyle) label.setAttributeNS(null, "font-style", style.fontStyle);
	if (style.labelSelect === true) 
	{	label.setAttributeNS(null, "pointer-events", "visible");
		label._featureId = node._featureId;
	} 
	else 
	{	label.setAttributeNS(null, "pointer-events", "none");
	}

	function getpath (pathStr, readeable)
	{	var npath = pathStr.split(",");
		var pts = [];
		if (!readeable || Number(npath[0]) - Number(npath[npath.length-2]) < 0)
		{	while (npath.length) pts.push ( { x:Number(npath.shift()), y:Number(npath.shift()) } );
		}
		else 
		{	while (npath.length) pts.unshift ( { x:Number(npath.shift()), y:Number(npath.shift()) } );
		}
		return pts;
	}
	
	var path = this.nodeFactory(null, "path");
	var tpid = node._featureId+"_t"+suffix;
	if (style.pathLabelCurve)
	{	var pts = getpath (node._path, style.pathLabelReadable);
		var p = pts[0].x+" "+pts[0].y;
		var dx, dy, s1, s2;
		dx = (pts[0].x-pts[1].x)/4;
		dy = (pts[0].y-pts[1].y)/4;
		for (var i=1; i<pts.length-1; i++)
		{	p += " C "+(pts[i-1].x-dx)+" "+(pts[i-1].y-dy);
			dx = (pts[i-1].x-pts[i+1].x)/4;
			dy = (pts[i-1].y-pts[i+1].y)/4;
			s1 = Math.sqrt( Math.pow(pts[i-1].x-pts[i].x,2)+ Math.pow(pts[i-1].y-pts[i].y,2) );
			s2 = Math.sqrt( Math.pow(pts[i+1].x-pts[i].x,2)+ Math.pow(pts[i+1].y-pts[i].y,2) );
			p += " "+(pts[i].x+s1*dx/s2)+" "+(pts[i].y+s1*dy/s2);
			dx *= s2/s1;
			dy *= s2/s1;
			p += " "+pts[i].x+" "+pts[i].y;
		}
		p += " C "+(pts[i-1].x-dx)+" "+(pts[i-1].y-dy);
		dx = (pts[i-1].x-pts[i].x )/4;
		dy = (pts[i-1].y-pts[i].y )/4;
		p += " "+(pts[i].x+dx)+" "+(pts[i].y+dy);
		p += " "+pts[i].x+" "+pts[i].y;

		path.setAttribute("d","M "+p);
	}
	else 
	{	if (style.pathLabelReadable)
		{	var pts = getpath (node._path, style.pathLabelReadable);
			var p="";
			for (var i=0; i<pts.length; i++) p += " "+pts[i].x+" "+pts[i].y;
			path.setAttribute("d","M "+p);
		}
		else path.setAttribute("d","M "+node._path);
	}
	path.setAttribute("id",tpid);

	var defs = this.createDefs();
	removeChildById (defs, tpid); 
	defs.appendChild(path);
	
	var textPath = this.nodeFactory(null, "textPath");
	textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#"+tpid);
	var align = style.labelAlign || OpenLayers.Renderer.defaultSymbolizer.labelAlign;
	label.setAttributeNS(null, "text-anchor", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");
	textPath.setAttribute("startOffset", style.pathLabelXOffset || OpenLayers.Renderer.SVG.LABEL_STARTOFFSET[align[0]] || "50%");
	if (OpenLayers.IS_GECKO === true) label.setAttributeNS(null, "dominant-baseline", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
	if (style.pathLabelYOffset) label.setAttribute("dy", style.pathLabelYOffset);
	//textPath.setAttribute("method","stretch");
	//textPath.setAttribute("spacing","auto");

	textPath.textContent = style.pathLabel;
	label.appendChild(textPath);

	removeChildById (this.textRoot, node._featureId+"_"+suffix); 
	this.textRoot.appendChild(label);
};
			
OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options)
{	
	if (node._geometryClass == "OpenLayers.Geometry.LineString" && style.pathLabel && node._path)
	{	if (node._geometryClass == "OpenLayers.Geometry.LineString" && style.pathLabel)
		{	
		
			var drawOutline = (!!style.labelOutlineWidth);
			// First draw text in halo color and size and overlay the
			// normal text afterwards
			if (drawOutline) 
			{	var outlineStyle = OpenLayers.Util.extend({}, style);
				outlineStyle.fontColor = outlineStyle.labelOutlineColor;
				outlineStyle.fontStrokeColor = outlineStyle.labelOutlineColor;
				outlineStyle.fontStrokeWidth = style.labelOutlineWidth;
				if (style.labelOutlineOpacity) outlineStyle.fontOpacity = style.labelOutlineOpacity;
				delete outlineStyle.labelOutlineWidth;
				this.pathText(node, outlineStyle, "path0");
			}
        
			this.pathText(node, style, "path");

			setStyle.apply(this,arguments);
		}
	}
	else setStyle.apply(this,arguments);
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
	if (rendered === false) 
	{	removeChildById(this.textRoot,  id+"_path");
		removeChildById(this.textRoot,  id+"_path0");
	}
	return rendered;
};

/**
 * Method: drawLineString
 * Save the path to draw after.
 * 
 * Parameters: 
 * node - {DOMElement}
 * geometry - {<OpenLayers.Geometry>}
 * 
 * Returns:
 * {DOMElement} or null if the renderer could not draw all components of
 *     the linestring, or false if nothing could be drawn
 */ 
var drawLineString = OpenLayers.Renderer.SVG.prototype.drawLineString;
OpenLayers.Renderer.SVG.prototype.drawLineString = function(node, geometry) 
{	drawLineString.apply(this,arguments);
	node._path = this.getComponentsString(geometry.components).path;
};

})();