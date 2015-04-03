/* Copyright (c) 2015 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Overwrite the SVG setStyle function with Font Awesome symbols
*	- http://fortawesome.github.io/Font-Awesome/
*	- http://ionicons.com/
*	- http://glyphicons.com/ - http://getbootstrap.com/components/
*
*	Add new fa style options to the Openlayers.Style

faLabel: {String} a fontawesome valid icon name, fa-map-marker for example
faFont : {String} Font family, default use the faLabel prefix to auto detect the font family
faColor: {String} Hex fill color.  Default is the strokeColor of the style
faSColor: {String} Hex stroke color. Default is no stroke
faSize: {Number} Size of the symbol in % of the symbol size (0 to 1). default is 0.6
faXOffset: {Number} Pixel offset along the positive x axis for displacing the fa icon.
faYOffset: {Number} Pixel offset along the positive y axis for displacing the fa icon.

gradient: {String} A linear gradient : L-color1-color2 ie. "L-yellow-red" or "L-#ff0-f00".

*	Use a range number to stack icons ie. faLabel_1, faLabel_2, etc.

*	Extra standard values :

graphicName : {String} Named graphic to use when rendering back symbol. Must be one of : fa-none,fa-circle,fa-square,fa-blazon,fa-shield,fa-bookmark,fa-tag,fa-marker,fa-pin,fa-bubble
symbolXOffset: {Number} Pixel offset along the positive x axis for displacing the symbol.
symbolYOffset: {Number} Pixel offset along the positive x axis for displacing the symbol.

*/
(function(){

var saved = OpenLayers.Renderer.SVG.prototype.setStyle;
var suffix = new RegExp (OpenLayers.Renderer.Elements.prototype.BACKGROUND_ID_SUFFIX+"$");
var jsonparse = new OpenLayers.Format.JSON();

OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options)
{	if (node._geometryClass == "OpenLayers.Geometry.Point" && !suffix.test(node.id))
	{	// Get fa nodes
		var fanodes = [];
		var fastyle = [];
		for (var k = 0; ; k++) 
		{	var fak = (k!=0 ? "_"+k : "");
			if (!style['faLabel'+fak]) break;
			if (style['faLabel'+fak]=="none") continue;
			var ff, icon;
			switch ( style['faLabel'+fak].substring(0,2) )
			{	case 'fa':
					ff = "FontAwesome";
					icon = OpenLayers.Renderer.fontawesomeicons[style['faLabel'+fak]];
					break;
				case 'io':
					ff = "Ionicons";
					icon = OpenLayers.Renderer.ionicons[style['faLabel'+fak]];
					break;
				case 'gi':
					ff = "Glyphicons Regular";
					icon = OpenLayers.Renderer.glyphicons[style['faLabel'+fak]];
					break;
				case 'bs':
					ff = "Glyphicons Halflings";
					icon = OpenLayers.Renderer.bootstrapicons[style['faLabel'+fak]];
					break;
				default:
					icon = style['faLabel'+fak];
					break;
			}
			//if (!icon) continue;

			// Font symbol
			var fa = this.nodeFactory(null, "text");
			var sc = 100;//+style.strokeWidth;
			var s = style['faSize'+fak] ? sc*style['faSize'+fak] : 60;

			fa.setAttributeNS(null, "fill", style['faColor'+fak] || style.strokeColor);
			fa.textContent = icon;
			fa.setAttributeNS(null, "x", (style['faXOffset'+fak] || style['faXOffset'+fak]===0) ? sc*style['faXOffset'+fak] : 50);
			fa.setAttributeNS(null, "y", (style['faYOffset'+fak] || style['faYOffset'+fak]===0) ? sc*style['faYOffset'+fak] : 50+s*0.35);
			if (style.rotation) fa.setAttributeNS(null, "transform", "rotate(" +style.rotation+" 50 50)");

			fa.setAttributeNS(null, "stroke", style['faSColor'+fak] || "none");
			
			fa.setAttributeNS(null, "font-family", style['faFont'+fak] || ff);//^ion/.test(style['faLabel'+fak]) ? "Ionicons" || /^gi/.test(style['faLabel'+fak]) ? "Ionicons" : "FontAwesome");
			fa.setAttributeNS(null, "text-anchor", "middle");
			fa.setAttributeNS(null, "font-size", s);

			fanodes.push(fa);
		}

		if (fanodes.length)
		{	if (!/^fa-/.test(style.graphicName)) style.graphicName="fa-none";
			// Remove existant
			while (node.firstChild) node.removeChild(node.firstChild);
			// New symbol
			saved.apply(this,arguments);
			// Circle and none style
			if (node.firstChild)
			{	if (style.graphicName == "fa-none") node.removeChild(node.firstChild);
				else if (style.graphicName == "fa-circle")
				{	node.removeChild(node.firstChild);
					var c = this.nodeFactory(null, "circle");
					c.setAttributeNS(null, "r", 50);
					c.setAttributeNS(null, "cx", 50);
					c.setAttributeNS(null, "cy", 50);
					node.appendChild(c);
				}
			}
			// Gradient color
			if (node.firstChild && style.gradient)
			{	var defs = this.createDefs();
				var existing = false;
				var d = defs.childNodes;
				var id = style.gradient;
				var g = style.gradient.split("-");
				for (var i=0; i<d.length; i++) 
				{	if (d[i].id == id) 
					{	existing = true;
						break;
					}
				}
				// Create gradient if not exist
				if (!existing)
				{	var grad = this.nodeFactory(null, "linearGradient");
					grad.setAttribute("id",id);
					grad.setAttribute("x1","0%");
					grad.setAttribute("x2","100%");
					grad.setAttribute("y1","0%");
					grad.setAttribute("y2","100%");
					var stop = this.nodeFactory(null, "stop");
					stop.setAttribute("offset","0%");
					stop.setAttribute("style","stop-color:"+g[1]+"; stop-opacity:1;");
					grad.appendChild(stop);
					var stop = this.nodeFactory(null, "stop");
					stop.setAttribute("offset","100%");
					stop.setAttribute("style","stop-color:"+g[2]+"; stop-opacity:1;");
					grad.appendChild(stop);
					defs.appendChild(grad);
				}
				node.firstChild.style.fill="url(#"+id+")";
			}
		
			// Add fontawesome nodes
			for (var k=0; k<fanodes.length; k++) node.appendChild(fanodes[k]);

			// Center / bottom
			if (style.symbolXOffset) node.setAttributeNS (null, "x", Number(node.getAttributeNS(null,"x"))+style.symbolXOffset);
			if (style.symbolYOffset) node.setAttributeNS (null, "y", Number(node.getAttributeNS(null,"y"))+style.symbolYOffset);
		}
		else saved.apply(this,arguments);
	}
	else saved.apply(this,arguments);
	return node;
};

OpenLayers.Renderer.symbol["fa-none"] = [0,0,100,100];
OpenLayers.Renderer.symbol["fa-circle"]  = [0,0,100,100];
OpenLayers.Renderer.symbol["fa-square"] = [0,0,0,100,100,100,100,0,0,0];
OpenLayers.Renderer.symbol["fa-triangle"] = [0,0,50,120,100,0,0,0];
OpenLayers.Renderer.symbol["fa-diamond"] = [25,0,0,25,0,40, 50,130, 100,40,100,25,75,0,25,0];
OpenLayers.Renderer.symbol["fa-hexagon"] = [50,0,5,20,5,80,50,100,95,80,95,20,50,0];
OpenLayers.Renderer.symbol["fa-blazon"] = [5,0,0,5,0,95,5,100, 30,100,50,120,70,100, 95,100,100,95,100,5,95,0,5,0];
OpenLayers.Renderer.symbol["fa-shield"] = [5,0,0,5,0,90,5,95, 50,115, 95,95,100,90,100,5,95,0,5,0];
OpenLayers.Renderer.symbol["fa-bookmark"] = [0,0,0,120, 50,100, 100,120,100,0,0,0];
OpenLayers.Renderer.symbol["fa-tag"] = [100,50,100,55,97,67,61,143,58,147,53,150,50,150,47,150,42,147,39,143,3,67,0,55,0,50,1,40,4,31,8,22,15,15,22,8,31,4,40,1,50,0,60,1,69,4,78,8,85,15,92,22,96,31,99,40];
OpenLayers.Renderer.symbol["fa-marker"] = [99,49,98,54,98,59,96,64,95,69,93,73,90,77,87,81,49,125,11,81,8,77,6,73,4,69,2,64,1,59,0,54,0,49,0,44,1,39,2,35,4,30,6,26,8,22,11,18,14,14,18,11,22,8,26,6,30,4,35,2,39,1,44,0,49,0,54,0,59,1,64,2,69,4,73,6,77,8,81,11,84,14,87,18,90,22,93,26,95,30,96,35,98,39,98,44];
OpenLayers.Renderer.symbol["fa-pin"] = [99,59,91,78,78,91,60,99,50,99,50,165,50,99,40,99,21,91,8,78,0,60,0,40,8,21,21,8,39,0,59,0,78,8,91,21,99,40,99,59];
OpenLayers.Renderer.symbol["fa-bubble"] = [99,50,99,55,98,59,97,64,95,69,93,73,91,77,88,81,85,85,81,88,77,91,73,93,69,95,64,97,50,132,35,97,30,95,26,93,22,91,18,88,14,85,11,81,8,77,6,73,4,69,2,64,1,59,0,55,0,50,0,44,1,40,2,35,4,30,6,26,8,22,11,18,14,14,18,11,22,8,26,6,30,4,35,2,40,1,44,0,50,0,55,0,59,1,64,2,69,4,73,6,77,8,81,11,85,14,88,18,91,22,93,26,95,30,97,35,98,40,99,44];
OpenLayers.Renderer.symbol["fa-gear"] = [8,22,22,8,33,16,39,14,41,0,59,0,61,14,67,16,78,8,91,22,83,33,86,39,100,41,100,59,86,61,83,67,92,78,78,92,67,83,61,86,59,100,41,100,39,86,33,83,22,92,8,78,17,67,14,61,0,59,0,40,14,38,17,32];
OpenLayers.Renderer.symbol["fa-coma"] = [38,1,29,5,21,9,14,16,8,23,4,31,1,41,0,50,1,61,4,70,9,79,15,86,22,92,31,97,31,97,46,102,46,102,46,102,58,110,58,110,58,110,61,117,61,117,61,117,61,125,61,125,61,125,58,137,58,137,58,137,50,151,62,144,72,135,80,124,87,111,92,97,96,82,100,61,101,50,100,40,97,31,92,22,86,15,78,9,70,4,60,1,50,0,38,1];

/* Transform Symbol to 100x100 shape * /
var pin = OpenLayers.Renderer.symbol["fa-pin"];
var minx = pin[0];
var miny = pin[1];
var maxx = pin[0];
var maxy = pin[1];
for (var i=0; i<pin.length; i+=2)
{	if (minx>pin[i]) minx = pin[i];
	if (miny>pin[i+1]) miny = pin[i+1];
	if (maxx<pin[i]) maxx = pin[i];
	if (maxy<pin[i+1]) maxy = pin[i+1];
}
//console.log (maxx+" "+minx+" - "+maxy+" "+miny);
var sc = 151.0/Math.max(maxx-minx,maxy-miny);
for (var i=0; i<pin.length; i+=2)
{	pin[i] = Math.round((pin[i]-minx)*sc);
	pin[i+1] = Math.round((pin[i+1]-miny)*sc);
}
/**/

})();