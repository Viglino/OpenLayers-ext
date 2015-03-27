/* Copyright (c) 2015 by Jean-Marc.Viglino[at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/**
 * @requires OpenLayers/Renderer/SVG.js
 */
/**
 * Class: OpenLayers.Renderer.SVGCharts
 * 
 * Inherits:
 *  - <OpenLayers.Renderer.SVG>
 
 chart			{String} A list of values separated by a coma
 pointRadius	{Number} Pixel radius of the chart. Default is 10.
 chartType		{String} The type of chart: pie/bar, default: pie
 chartColor		{String} A list of colors separated by a coma, default: OpenLayers.Renderer.SVGCharts.colors.classic
 chartBarWidth	{Number} The width of the bars, default: 10
 chartBackcolor	{String} The color of the back outline. Display a 3D chart.
 fontsize		{Number} If set draw label on the chart.
 chartSuffix	{String} Suffix to add to the label value
 
 */
 
OpenLayers.Renderer.SVGCharts = OpenLayers.Class(OpenLayers.Renderer.SVG,
{
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
	setStyle : function(node, style, options)
	{	if (node._geometryClass == "OpenLayers.Geometry.Point" && style.chart)
		{	var color = (style.chartColor || OpenLayers.Renderer.SVGCharts.colors.classic).split(",");
			var nc = color.length;
			var chartCount = 0;
			var max = 0;
			if (!style.pointRadius) style.pointRadius=10;
			// Get the chart table
			var chart = style.chart.split(",");
			for (var i=0; i<chart.length; i++)
			{	chart[i] = Number(chart[i]);
				chartCount += chart[i];
				if (max < chart[i]) max = chart[i];
			}
			if (style.chartMax) max = style.chartMax;
			if (!chartCount) return node;
			// Remove existant
			while (node.firstChild) node.removeChild(node.firstChild);
			// New svg
			style.graphicName = "__chart";
			OpenLayers.Renderer.SVG.prototype.setStyle.apply(this,arguments);
			node.removeChild(node.firstChild);
			
			// Draw charts
			switch (style.chartType)
			{	// Bars
				case "bar":
				{	var l = chart.length;
					var bs = style.chartBarWidth || 10;
					var sc = 100 / max;
					var txtnodes = [];
					for (var i=0; i<chart.length; i++) if (chart[i])
					{	var c = this.nodeFactory(null, "polygon");
						var x = 50+bs*i-bs/2*l;
						c.setAttributeNS(null, "points", 
								(x)+","+100+" "
								+ (x)+","+(100-sc*chart[i])+" "
								+ (x+bs)+","+(100-sc*chart[i])+" "
								+ (x+bs)+","+(100)+" "
								+ (x)+","+100+" "
								);
						c.setAttributeNS(null, "fill", color[i%nc]);
						node.appendChild(c);
						// Draw labels
						if (style.fontSize)
						{	at = a - a0/2;
							txt = this.nodeFactory(null, "text");
							txt.textContent = chart[i] + (style.chartSuffix || "");
							txt.setAttributeNS(null, "x", x+bs/2 );
							txt.setAttributeNS(null, "y", 100 -sc*chart[i] - style.fontSize);
							txt.setAttributeNS(null, "font-size", style.fontSize * 50/Number(style.pointRadius));
							txt.setAttributeNS(null, "text-anchor", "middle");
							txt.setAttributeNS(null, "fill", style.fontColor || style.strokeColor);
							if (style.labelOutlineColor) txt.setAttributeNS(null, "stroke", style.labelOutlineColor );
							txt.setAttributeNS(null, "stroke-width", style.labelOutlineWidth || 0);
							txt.setAttributeNS(null, "stroke-opacity", style.labelOutlineOpacity || 1);
							if (style.fontWeight) txt.setAttributeNS(null, "font-weight", style.fontWeight);
							txtnodes.push(txt);
						}
					}
					for (var i=0; i<txtnodes.length; i++) node.appendChild(txtnodes[i]);
					// move up
					node.setAttributeNS (null, "y", Number(node.getAttributeNS(null,"y"))-style.pointRadius);
					break;
				}
				// Pies
				case "pie":
				default:
				{	// Calculate pie
					var flag, a0, at, a = -Math.PI/2;
					var x1=50, y1=0, x2, y2, rx=50, ry=50;
					var txt, txtnodes = [];
					var l = chart.length;
					
					if (style.chartBackcolor)
					{	var c = this.nodeFactory(null, "path");
						c.setAttributeNS(null, "d", "M50,22 A51,35 0 1,1 49.9,22 z");
						c.setAttributeNS(null, "fill", style.chartBackcolor);
						//c.setAttributeNS(null, "stroke-width", 0);
						node.appendChild(c);
						y1 = 20;
						ry = 30;
					}
					
					for (var i=0; i<l; i++) if (chart[i])
					{	var c = this.nodeFactory(null, "path");
						a0 = 2*Math.PI * chart[i]/chartCount;
						a += a0;
						x2 = 50 + rx * Math.cos(a);
						y2 = 50 + ry * Math.sin(a);
						flag = (a0 > Math.PI) ? " 1,1 " : " 0,1 ";
						if (l==1) c.setAttributeNS(null, "d", "M50,0 A"+rx+","+ry+" 0 1,1 49.9,0 z");
						else c.setAttributeNS(null, "d", "M50,50  L" + x1 + "," + y1 + "  A"+rx+","+ry+" 0" + flag + x2 + "," + y2 + " z");
						c.setAttributeNS(null, "fill", color[i%nc]);
						node.appendChild(c);
						x1 = x2; y1 = y2;
						// Draw labels
						if (style.fontSize)
						{	at = a - a0/2;
							txt = this.nodeFactory(null, "text");
							txt.textContent = chart[i] + (style.chartSuffix || "");
							txt.setAttributeNS(null, "x", 50 + (style.fontSize+50) * Math.cos(at) );
							txt.setAttributeNS(null, "y", 50 + (style.fontSize+50) * Math.sin(at) + style.fontSize);
							txt.setAttributeNS(null, "font-size", style.fontSize * 50/Number(style.pointRadius));
							// txt.setAttributeNS(null, "text-anchor", "middle");
							if (at < Math.PI/2) txt.setAttributeNS(null, "text-anchor", "start");
							else txt.setAttributeNS(null, "text-anchor", "end");
							txt.setAttributeNS(null, "fill", style.fontColor || style.strokeColor);
							if (style.labelOutlineColor) txt.setAttributeNS(null, "stroke", style.labelOutlineColor );
							txt.setAttributeNS(null, "stroke-width", style.labelOutlineWidth || 0);
							txt.setAttributeNS(null, "stroke-opacity", style.labelOutlineOpacity || 1);
							if (style.fontWeight) txt.setAttributeNS(null, "font-weight", style.fontWeight);
							txtnodes.push(txt);
						}
					}
					for (var i=0; i<txtnodes.length; i++) node.appendChild(txtnodes[i]);
					break;
				}
			}
		}
		else OpenLayers.Renderer.SVG.prototype.setStyle.apply(this,arguments);
		return node;
	},

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
	getNodeType: function(geometry, style)
	{	if (style.chart) return "svg";
		return OpenLayers.Renderer.SVG.prototype.getNodeType.apply(this,arguments);
	},

	CLASS_NAME: "OpenLayers.Renderer.SVGCharts"

});

/** A 100x100 symbol
*/
OpenLayers.Renderer.symbol["__chart"] = [0,0,100,100];

OpenLayers.Renderer.SVGCharts.colors =
{	classic: "#ffa500,blue,red,green,cyan,magenta,yellow,#0f0",
	dark: "#960,#003,#900,#060,#099,#909,#990,#090",
	pale: "#fd0,#369,#f64,#3b7,#880,#b5d,#666",
	pastel: "#fb4,#79c,#f66,#7d7,#acc,#fdd,#ff9,#b9b",
	neon: "#ff0,#0ff,#0f0,#f0f,#f00,#00f"
};