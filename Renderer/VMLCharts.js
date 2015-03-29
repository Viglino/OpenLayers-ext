/* Copyright (c) 2015 by Jean-Marc.Viglino[at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/**
 * @requires OpenLayers/Renderer/VML.js
 */
/**
 * Class: OpenLayers.Renderer.VMLCharts
 * 
 * Inherits:
 *  - <OpenLayers.Renderer.VML>
 
 chart			{String} A list of values separated by a coma
 pointRadius	{Number} Pixel radius of the chart. Default is 10.
 chartType		{String} The type of chart: pie/bar, default: pie
 chartColor		{String} A list of colors separated by a coma, default: OpenLayers.Renderer.colors.classic
 chartBarWidth	{Number} Width of the bars, percentage of the pointRadius, default: 0.15
 chartBackcolor	{String} The color of the back outline. Display a 3D chart.
 chartSuffix	{String} Suffix to add to the label value
 fontSize		{Number} If set draw label on the chart. (not implemented)
 
 */
 
OpenLayers.Renderer.VMLCharts = OpenLayers.Class(OpenLayers.Renderer.VML,
{
	/** 
     * Method: setStyle
     * Use to set all the style attributes to a VML node.
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
	setStyle : function(node, style, options, geometry)
	{	if (!style.chart) 
		{	return OpenLayers.Renderer.VML.prototype.setStyle.apply(this,arguments);
		}
		
		var color = (style.chartColor || OpenLayers.Renderer.colors.classic).split(",");
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
		var nodes = node.getElementsByTagName("rect"); 
		for (var i=nodes.length-1; i>=0; i--) node.removeChild(nodes[i]);
		nodes = node.getElementsByTagName("shape"); 
		for (var i=nodes.length-1; i>=0; i--) node.removeChild(nodes[i]);
		
		// Draw charts
		switch (style.chartType)
		{	// Bars
			case "bar":
			{	// Resolution 
				var res = 2*style.pointRadius;
				
				OpenLayers.Renderer.VML.prototype.setStyle.apply(this,arguments);
				node.style.top = Number(node.style.top.replace("px","")) + style.pointRadius +"px";
				node.coordsize= res+" , "+res;
				//node.coordorigin="0, 0";
				
				var l = chart.length;
				var bs = (style.chartBarWidth || 0.15) * res;//2.5*res / (style.chartBarWidth || 10);
				var sc = res / max ;
				var txtnodes = [];
					
				for (var i=0; i<chart.length; i++) if (chart[i])
				{	var c = this.createNode('olv:rect', node.id + "_R"+i);
					var x = res/2+bs*i-bs/2*l;
					c.style.left = x+"px";
					c.style.top = "0px";
					c.style.width = bs+"px";
					c.style.height = (sc*chart[i])+"px";
					c._featureId = node._featureId;
					c._geometryClass = node._geometryClass;
					
					c.fillcolor = color[i%nc];
					c.strokecolor = style.strokeColor;
					c.strokeweight = style.strokeWidth+"px";
					node.appendChild(c);
				}
				//this.drawCircle(node, geometry, style.pointRadius);
				break;
			}
			// Pies
			case "pie":
			default:
			{	// Resolution 
				var res = 2*style.pointRadius;
				
				OpenLayers.Renderer.VML.prototype.setStyle.apply(this,arguments);
				node.coordsize= res+" , "+res;
				//node.coordorigin="0, 0";
				
				var l = chart.length;
				var txtnodes = [];
				
				var sa=0, a=0; r=res/2;
				for (var i=0; i<chart.length; i++) if (chart[i])
				{	//var c = this.createNode('olv:shape', node.id + "_P"+i);
					a = Math.round(360 * chart[i]/chartCount * 65535);

					var path = "M " + r + " " + r +		// Move to (cx,cy)
						" AE " + r + " " + r + " " +	// Arc with center at (cx,cy)
						r + " " + r + " " +				// Horiz and vertical radius
						sa + " " + a +					// Start angle and total angle
						" X E";							// Close path to center and end
					sa += a;
					
					var c = this.createNode('olv:shape', node.id + "_R"+i);
					c.path = path;
					c.style.left = 0;
					c.style.top = 0;
					c.style.width = 2*style.pointRadius+"px";
					c.style.height = 2*style.pointRadius+"px";
					c.style.position = "absolute";
					//c.style.flip = "y";
					c._featureId = node._featureId;
					c._geometryClass = node._geometryClass;
					
					c.fillcolor = color[i%nc];
					c.strokecolor = style.strokeColor;
					c.strokeweight = style.strokeWidth+"px";
					node.appendChild(c);
				}
				// node.style.border = "1px solid #0f0";
				break;
			}		
		}
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
	{	//if (style.chart) return "olv:shape";
		if (geometry.CLASS_NAME=="OpenLayers.Geometry.Point" && style.chart) return "olv:group";
		return OpenLayers.Renderer.VML.prototype.getNodeType.apply(this,arguments);
	},

	CLASS_NAME: "OpenLayers.Renderer.VMLCharts"

});
