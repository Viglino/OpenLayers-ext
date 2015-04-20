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


OpenLayers.Renderer.lineSymbol =
{
	"arrow":
	{	/*path: [-20,10, 0,0, -20,-10, -6,0, -20,10],
		fill: true*/
		path: [-20,10, 0,0, -20,-10]
	},
	"farrow":
	{	path: [-20,10, 0,0, -20,-10, -20,10],
		fill: true,
		close:true
	},
	"ladder":
	{	path: [0,-10, 0,10]
	},
	"barb":
	{	path: [0,10, 0,0]
	},
	"cross":
	{	path: [10,0, -10,0, 0,0, 0,10, 0,-10]
	},
	"cross-x":
	{	path: [7,7, -7,-7, 0,0, -7,7, 7,-7]
	},
	"triangle":
	{	path: [10,0,0,10,-10,0],
		fill:true
	},
	"circle":
	{	path: [10,0, 9,4, 7,7, 4,9, 0,10, -4,9, -7,7, -9,4, -10,0,
				-9,-4, -7,-7, -4,-9, 0,-10, 4,-9, 7,-7, 9,-4, 10,0]
	},
	"disk":
	{	path: [10,0, 9,4, 7,7, 4,9, 0,10, -4,9, -7,7, -9,4, -10,0,
				-9,-4, -7,-7, -4,-9, 0,-10, 4,-9, 7,-7, 9,-4, 10,0],
		fill:true
	},
	"semicircle":
	{	path: [10,0,9,4,7,7,4,9,0,10,-4,9,-7,7,-9,4,-10,0,10,0],
		fill:true
	}
};
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
var getNodeType = OpenLayers.Renderer.SVG.prototype.getNodeType;

function getDist (pt1, pt2)
{   var x = pt2.x - pt1.x;
    var y = pt2.y - pt1.y;
    return Math.sqrt(x*x + y*y);
};
function getOrientation (pt1, pt2) 
{   var x = pt2.x - pt1.x;
    var y = pt2.y - pt1.y;
    var w = Math.sqrt(x*x + y*y);
    return { cos:x/w, sin:y/w };
};

OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options)
{	// Default function
	setStyle.apply(this, arguments);
	
	// Draw line and symbols
	if (node._geometryClass=="OpenLayers.Geometry.LineString" /*&& style.lineSymbol*/)
	{	// Draw line
		var npath = this.nodeFactory(null, "path");
		while (node.firstChild) node.removeChild(node.firstChild);
		var path = node.getAttribute("points");
		npath.setAttributeNS(null, "d", "M "+path);
		node.appendChild(npath);
		
		if (style.lineSymbol && OpenLayers.Renderer.lineSymbol[style.lineSymbol])
		{	// Draw symbols on the line
			npath = this.nodeFactory(null, "path");
			var geo=[], pts = path.split(',');
			for (var i=0; i<pts.length; i+=2) geo.push( { x:Number(pts[i]), y:Number(pts[i+1]) } );
			var n = geo.length-1;
			var s = (style.lineSymbolRadius || 5)/10;
			var p="";
			// Get points
			var start=n, end=0, step=-1;
			if (style.lineSymbolReverse) 
			{	start=0; 
				end=n;
				step=1;
			}
			var pts = [];
			var a = [];
			// Center symbol on the line
			if (style.lineSymbolRepeat == "center")
			{	var dist = 0;
				for (var i=0; i<n; i++) dist += getDist(geo[i],geo[i+1]);
				dist /= 2;
				for (var i=start; ; i+=step)
				{	var dl = getDist(geo[i],geo[i+step]);
					dist -= dl;
					if (dist<0)
					{	var p0 = geo[i];
						var p1 = geo[i+step];
						var pt = { x:(-p0.x*dist/dl + p1.x*(dl+dist)/dl), y:(-p0.y*dist/dl + p1.y*(dl+dist)/dl) };
						pts.push(pt);
						a.push (getOrientation(p1,pt));
						break;
					}
				}
			}
			// Repeat symbol on the line
			else if (style.lineSymbolRepeat)
			{	var dist = -1*style.lineSymbolOffset || 0;
				for (var i=start; ; i+=step)
				{	if (i+step<0 || i+step>n) break;
					var p0 = geo[i];
					var p1 = geo[i+step];
					var dl = getDist(p0,p1);
					dist = dl+dist;
					if (dist>0) do
					{	var pt = { x:(p0.x*dist/dl + p1.x*(dl-dist)/dl), y:(p0.y*dist/dl + p1.y*(dl-dist)/dl) };
						pts.push(pt);
						a.push (getOrientation(p1,pt));
						dist -= style.lineSymbolRepeat;
					} while (dist > 0)
				}
			}
			// Just draw symbol at the end
			else
			{	pts.push(geo[start]);
				a.push (getOrientation(geo[start+step],geo[start]));
			}
			// Draw
			var symb = OpenLayers.Renderer.lineSymbol[style.lineSymbol];
			for (var k=0; k<pts.length; k++)
			{	p += " M ";
				for (var i=0; i<symb.path.length; i+=2) p += ( pts[k].x + s*symb.path[i]*a[k].cos + s*symb.path[i+1]*a[k].sin ) 
						+","+ ( pts[k].y + s*symb.path[i]*a[k].sin - s*symb.path[i+1]*a[k].cos ) +" ";
				if (symb.close) p += " Z ";
			}
			npath.setAttributeNS(null, "d", p);
			if (symb.fill) 
			{	npath.setAttributeNS(null, "fill", style.lineSymbolFillColor || style.strokeColor);
				npath.setAttributeNS(null, "stroke-width", 1);
			}
			npath.setAttributeNS(null, "stroke-dasharray", "none");
			if (style.lineSymbolStrokeColor) npath.setAttributeNS(null, "stroke", style.lineSymbolStrokeColor);
			if (style.lineSymbolStrokeWidth) npath.setAttributeNS(null, "stroke-width", style.lineSymbolStrokeWidth);
			node.appendChild(npath);
		}
	}
	return node;
};

/** 
 * Method: getNodeType 
 * 
 * Parameters:
 * geometry - {<OpenLayers.Geometry>}
 * style - {Object}
 * 
 * Returns:
 * {String} The corresponding node type for the specified geometry
 */
OpenLayers.Renderer.SVG.prototype.getNodeType = function(geometry, style)
{	if (geometry.CLASS_NAME=="OpenLayers.Geometry.LineString" /*&& style.lineSymbol*/) return "g";
	return getNodeType.apply(this,arguments);
};

})();