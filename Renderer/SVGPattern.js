/* Copyright (c) 2015 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Overwrite the SVG setStyle function to draw fill polygons with pattern
*
*	Add new options to the Openlayers.Style

pattern : {String} Name of the pattern
patternColor: {String} The pattern color, to be provided like CSS.
patternOpacity: {Number} Pattern opacity (0-1).  Default is 1
fillColor: {String} The fill color for the polygon, to be provided like CSS.
fillOpacity: {number} Fill opacity for the pattern background (0-1).  Default is 1

*	Extra standard values : all label and text values

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

function existPattern(defs, id)
{	if (defs.querySelector)	return defs.querySelector("#"+id);
	// For old browsers
	var d = defs.childNodes;
	for (var i=0; i<d.length; i++) 
	{	if (d[i].id == id) return true;
	}
	return false;
}

/** Patterns definitions
	Examples : http://seig.ensg.ign.fr/fichchap.php?NOFICHE=FP31&NOCHEM=CHEMS009&NOLISTE=1&N=8
*/
OpenLayers.Renderer.SVG.prototype.patterns =
{
	"point":
	{	width:8,
		height:8,
		endering:"auto",
		circles:[[5,5,2]],
		stroke:false,
		fill:true,
		angle:45
	},
	"circle":
	{	width:10,
		height:10,
		rendering:"auto",
		circles:[[5,5,2]],
		stroke:1,
		fill:false,
		angle:45
	},
	"cemetry":
	{	width:15,
		height:17,
		lines:[[0,3,5,3],[3,0,3,8],[7,12,12,12],[10,9,10,17]],
		stroke:1
	},
	"sand":
	{	width:20,
		height:20,
		//rendering:"auto",
		circles:[[1,2,1],[9,3,1],[2,16,1],
				[7,8,1],[6,14,1],[4,19,1],
				[14,2,1],[12,10,1],[14,18,1],
				[18,8,1],[18,14,1]],
		fill:1
	},
	"conglomerate":
	{	width:30,
		height:20,
		//rendering:"auto",
		circles:[[2,4,1],[17,3,1],[26,18,1],[12,17,1],[5,17,2],[28,11,2]],
		paths:["M 7,5 6,7 9,9 11,8 11,6 9,5 z M 16,10 15,13 16,14 19,15 21,13 22,9 20,8 19,8 z M 24,6 26,7 27,5 26,4 24,4 z"],
		stroke:1,
		angle:45
	},
	"gravel":
	{	width:15,
		height:10,
		//rendering:"auto",
		circles:[[2,4,1],[5,9,1],[1,9,1]],//[9,9,1],,[15,2,1]],
		paths:["M 7,5 6,6 7,7 8,7 9,7 10,5 9,4 z M 11,2 14,4 14,1 12,1 z"],
		stroke:1,
		angle:50
	},
	"brick":
	{	width:18,
		height:16,
		lines:[	[0,1,18,1],[0,10,18,10], [6,0,6,10],[12,10,12,18]],
		stroke:1
	},
	"dolomite":
	{	width:20,
		height:16,
		lines:[[0,1,20,1],[0,9,20,9],[1,9,6,1],[11,9,14,16]],
		stroke:1
	},
	"coal":
	{	width:20,
		height:16,
		paths:["M 1,5 7,1 7,7 z M 11,10 12,5 18,9 z M 5,10 2,15 9,15 z M 15,16 15,13 20,16 M 15,0 15,2 20,0"],
		fill:1,
		stroke:1,
		angle:10
	},
	"breccia":
	{	width:20,
		height:16,
		paths:["M 1,5 7,1 7,7 z M 11,10 12,5 18,9 z M 5,10 2,15 9,15 z M 15,16 15,13 20,16 M 15,0 15,2 20,0"],
		stroke:1,
		angle:10
	},
	"clay":
	{	width:20,
		height:20,
		paths:["M 0,0 3,11 0,20 M 11,0 10,3 13,13 11,20 M 0,0 10,3 20,0 M 0,11 3,11 13,13 20,12"],
		stroke:1
	},
	"flooded":
	{	width:15,
		height:10,
		lines:[	[0,1,10,1],[0,6,5,6], [10,6,15,6]],
		stroke:1
	},
	"chaos":
	{	width:40,
		height:40,
		paths:["M 40,2 40,0 38,0 40,2 z M 4,0 3,2 2,5 0,0 0,3 2,7 5,6 7,7 8,10 9,12 9,13 9,14 8,14 6,15 2,15 0,20 0,22 2,20 5,19 8,15 10,14 11,12.25 10,12 10,10 12,9 13,7 12,6 13,4 16,7 17,4 20,0 18,0 15,3 14,2 14,0 12,1 11,0 10,1 11,4 10,7 9,8 8,5 6,4 5,3 5,1 5,0 4,0 z M 7,1 7,3 8,3 8,2 7,1 z M 4,3 5,5 4,5 4,3 z M 34,5 33,7 38,10 38,8 36,5 34,5 z M 27,0 23,2 21,8 30,0 27,0 z M 25,8 26,12 26,16 22.71875,15.375 20,13 18,15 17,18 13,22 17,21 19,22 21,20 19,18 22,17 30,25 26,26 24,28 21.75,33.34375 20,36 18,40 20,40 24,37 25,32 27,31 26,38 27,37 30,32 32,35 36,37 38,40 38,39 40,40 37,36 34,32 37,31 36,29 33,27 34,24 39,21 40,21 40,16 37,20 31,22 32,25 27,20 29,15 30,20 32,20 34,18 33,12 31,11 29,14 26,9 25,8 z M 39,24 37,26 40,28 39,24 z M 13,15 9,19 14,18 13,15 z M 18,23 14,27 16,27 17,25 20,26 18,23 z M 6,24 2,26 1,28 2,30 5,28 12,30 16,32 18,30 15,30 12,28 9,25 7,27 6,24 z M 29,27 32,28 33,31 30,29 27,28 29,27 z M 5,35 1,33 3,36 13,38 15,35 10,36 5,35 z"],
		fill:1,
		angle:160
	},
	"grass":
	{	width:22,
		height:20,
		lines:[[4,7,1,6],[5,6,1,3],[6,5,4,1],[7,4,7,1],
			[12,16,9,15],[13,15,9,12],[14,14,12,10],[15,13,15,10]],
		stroke:1,
		angle:45
	},
	"swamp":
	{	width:16,
		height:15,
		paths:["M 1,7 5,3 4,0 M 0,0 4,4 M 7,1 3,5 0,4 M 4,7 7,4"],
		stroke:1,
		angle:45
	},
	"wave":
	{	width:10,
		height:8,
		rendering:"auto",
		paths:[ "M 0,0 5,4 10,0 " ],
		stroke:1
	},
	"vine":
	{	width:13,
		height:13,
		lines:[[3,0,3,6],[9,7,9,13]],
		stroke:1.0
	},
	"forest":
	{	width:30,
		height:20,
		rendering:"auto",
		circles:[[5,5,3.5],[18,18,1.5]],
		stroke:1,
		angle:-45
	},
	"scrub":
	{	width:26,
		height:20,
		rendering:"auto",
		paths:["M 1,4 5,5 4,0"],
		circles:[[20,13,1.5]],
		stroke:1,
		angle:45
	},
	"tree":
	{	width:22,
		height:20,
		rendering:"auto",
		paths:["M 6,11 4,9 6,7 5,6 5,4 4,3 5,1 7,0 11,1 13,4 12,7 10,7 8,8 6,7"],
		stroke:1,
		angle:-45
	},
	"pine":
	{	width:22,
		height:20,
		rendering:"auto",
		paths:[ "M 4,10 2,8 4,6 2,4 10,0 6,8 4,6" ],
		stroke:1,
		angle:-45

	},
	"pines":
	{	width:22,
		height:20,
		lines:[[1,4,4,1],[3,1,6,4],[1,8,4,5],[3,5,6,8],[4,1,4,11],
			[12,14,17,14],[12,17,17,17],[15,12,15,18]],
		stroke:1
	},
	"rock":
	{	width:20,
		height:20,
		rendering:"auto",
		lines:[	[0,0,0,9],[3,0,3,9],[6,0,6,9], 
				[10,1,19,1],[10,4,19,4],[10,7,19,7],
				[0,11,9,11],[0,14,9,14],[0,17,9,17], 
				[11,10,11,19],[14,10,14,19],[17,10,17,19] ],
		stroke:1,
		angle:45
	},
	"rocks":
	{	width:20,
		height:20,
		rendering:"auto",
		paths:[	"M 5,0 3,0 5,4 4,6 0,3 0,5 3,6 5,9 3.75,10 2.5,10 0,9 0,10 4,11 5,14 4,15 0,13 0,13 0,13 0,14 0,14 5,16 5,18 3,19 0,19 -0.25,19.9375 5,20 10,19 10,20 11,20 12,19 14,20 15,20 17,19 20,20 20,19 19,16 20,15 20,11 20,10 19,8 20,5 20,0 19,0 20,2 19,4 17,4 16,3 15,0 14,0 15,4 11,5 10,4 11,0 10,0 9,4 6,5 5,0 z M 18,5 19,6 18,10 16,10 14,9 16,5 18,5 z M 5,6 9,5 10,6 10,9 6,10 5,6 z M 14,5 14,8 13,9 12,9 11,7 12,5 14,5 z M 5,11 8,10 9,11 10,14 6,15 6,15 5,11 z M 13,10 14,11 15,14 15,14 15,14 11,15 10,11 11,10 13,10 z M 15,12 16,11 19,11 19,15 16,14 16,14 15,12 z M 6,16 9,15 10,18 5,19 6,16 z M 10,16 14,16 14,18 13,19 11,18 10,16 z M 15,15 18,16 18,18 16,19 15,18 15,15 z" ],
		fill:1,
		angle:25
	},
	// Hash
	"hash":
	{	width:5,
		height:5,
		lines:[[0,3,5,3]],
		stroke:1,
		fill:false,
		angle:135
	},
	"cross":
	{	width:7,
		height:7,
		lines:[[0,3,10,3],[3,0,3,10]],
		stroke:1,
		fill:false
	}
}

/// Compute point patterns : point-size
for (var size=1; size<7; size++)
{	var id = "point-"+size;
	OpenLayers.Renderer.SVG.prototype.patterns[id] = OpenLayers.Util.extend({}, OpenLayers.Renderer.SVG.prototype.patterns.point);
	OpenLayers.Renderer.SVG.prototype.patterns[id].circles = [[5,5,size]];
}
/// Compute hash patterns : hash-angle-stroke
for (var angle=0; angle<180; angle+=45) for (var stroke=1; stroke<5; stroke++)
{	var id = "hash-"+angle+(stroke>1?"-"+stroke:"");
	OpenLayers.Renderer.SVG.prototype.patterns[id] = OpenLayers.Util.extend({}, OpenLayers.Renderer.SVG.prototype.patterns.hash);
	OpenLayers.Renderer.SVG.prototype.patterns[id].stroke = stroke;
	OpenLayers.Renderer.SVG.prototype.patterns[id].angle = angle;
}
/// Compute hash patterns : cross-angle-stroke
for (var angle=0; angle<90; angle+=45) for (var stroke=1; stroke<6; stroke++)
{	var id = "cross-"+angle+(stroke>1?"-"+stroke:"");
	OpenLayers.Renderer.SVG.prototype.patterns[id] = OpenLayers.Util.extend({}, OpenLayers.Renderer.SVG.prototype.patterns.cross);
	OpenLayers.Renderer.SVG.prototype.patterns[id].stroke = stroke;
	OpenLayers.Renderer.SVG.prototype.patterns[id].angle = angle;
}

/** 
 * Method: getPattern
 * Add a new pattern to the defs and return the id.
 * 
 * Parameters:
 * style - {Object}
 *
 */ 
OpenLayers.Renderer.SVG.prototype.getPattern = function(style)
{	var defs = this.createDefs();
	var id = (style.pattern+"_"+style.fillColor.replace("#","")+"_"+style.patternColor+"-"+(style.fillOpacity||0)/*+"-"+(style.patternOpacity||1)*/).replace("#","").replace(".","_");

	function setStyle (c, pattern, style)
	{	c.style.fill = pattern.fill ? style.patternColor : "none";
		if (pattern.stroke)
		{	c.style.strokeWidth = pattern.stroke;
			c.style.stroke = style.patternColor;
		}
	}
		
	// Create pattern if not exist
	if (!existPattern(defs, id))
	{	var pattern = OpenLayers.Renderer.SVG.prototype.patterns[style.pattern];
		if (!pattern) return false;

		var pat = this.nodeFactory(null, "pattern");
		pat.setAttribute("id",id);
		pat.setAttribute("patternUnits","userSpaceOnUse");
		pat.setAttribute("width",pattern.width);
		pat.setAttribute("height",pattern.height);
		pat.setAttribute("shape-rendering", pattern.rendering || "optimizeSpeed");
		if (pattern.angle) pat.setAttribute("patternTransform","rotate("+pattern.angle+")");

		if (style.fillOpacity && style.fillColor)
		{	var c = this.nodeFactory(null, "rect");
			c.setAttribute("x",0);
			c.setAttribute("y",0);
			c.setAttribute("width",pattern.width);
			c.setAttribute("height",pattern.height);
			c.style.fill = style.fillColor;
			c.style.fillOpacity = style.fillOpacity;
			pat.appendChild(c);
		}

		if (pattern.circles) for (var i=0; i<pattern.circles.length; i++)
		{	var ci = pattern.circles[i];
			var c = this.nodeFactory(null, "circle");
			c.setAttribute("cx",ci[0]);
			c.setAttribute("cy",ci[1]);
			c.setAttribute("r",ci[2]);
			setStyle(c,pattern,style)
			pat.appendChild(c);
		}
		if (pattern.lines) for (var i=0; i<pattern.lines.length; i++)
		{	var li = pattern.lines[i];
			var c = this.nodeFactory(null, "line");
			c.setAttribute("x1",li[0]);
			c.setAttribute("y1",li[1]);
			c.setAttribute("x2",li[2]);
			c.setAttribute("y2",li[3]);
			setStyle(c,pattern,style)
			pat.appendChild(c);
		}
		if (pattern.paths) for (var i=0; i<pattern.paths.length; i++)
		{	var p = pattern.paths[i];
			var c = this.nodeFactory(null, "path");
			c.setAttribute("d",p);
			setStyle(c,pattern,style)
			pat.appendChild(c);
		}

		defs.appendChild(pat);
	}
	return id;
}

OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options)
{	// Default function
	setStyle.apply(this, arguments);
	
	// Add pattern to polygons
	if (style.pattern && options.isFilled && style.patternOpacity!==0)
	{	node.style.fill = "url(#"+this.getPattern(style)+")";
		node.style.fillOpacity = style.patternOpacity || 1;
	}
	return node;
};

})();