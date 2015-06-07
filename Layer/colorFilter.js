/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/

(function(){

/**
* Method: setColorFilter
* Sets the colorFilter for the tile image
*
* Parameters:
* filter - {String} as : matrix:values | grayscale | invert | blackandwhite:saturation | hueRotate:value | luminanceToAlpha
*        - or false to deactivate filter
*			
*/
OpenLayers.Layer.prototype.setColorFilter = function(filter)
{	if (!this.colorFilter) return;
	if (!filter) filter='normal';
	filter = filter.split(":");
	switch (filter[0])
	{	case "normal":
		{	this.options.colorFilter = { type:'saturate', values:1 };
			break;
		}
		case "grayscale":
		{	this.options.colorFilter = { type:'saturate', values:0 };
			break;
		}
		case "invert":
		{	this.options.colorFilter = { type:'matrix', values:'-1 0 0 0 1    0 -1 0 0 1    0 0 -1 0 1    0 0 0 1 0' };
			break;
		}
		case "blackandwhite":
		{	var sat = '-' + (filter[1] || '1.5');
			this.options.colorFilter = { type:'matrix', values:'1 1 1 '+sat+' 0    1 1 1 '+sat+' 0    1 1 1 '+sat+' 0    0 0 0 1 0' };
			break;
		}
		case "transparentBlack":
		{	var opt = (filter[1] || "").split(' ');
			var sat = opt[0] || '1';
			var th = '-' + (opt[1] || '1.5');
			this.options.colorFilter = { type:'matrix', values:'1 1 1 '+th+' 0    1 1 1 '+th+' 0    1 1 1 '+th+' 0    0 0 0 +'+sat+' 0' };
			break;
		}
		default:
		{	this.options.colorFilter = { type:filter[0], values:filter[1] || '0' };
			break;
		}
	}

	if (this.map)
	{	// Layer colorFilter def
		var svgfilter = document.getElementById (this.id+"_colorFilter");
		// Create new 
		if (!svgfilter)
		{	var svgdefs;
			// Add svgdefs in the map
			var defs = document.getElementById (this.map.id+"_svgdefs");
			if (!defs)
			{	// Create defs
				defs = document.createElementNS('http://www.w3.org/2000/svg','svg');
				defs.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
				defs.setAttribute('id',this.map.id+"_svgdefs");

				svgdefs = document.createElementNS('http://www.w3.org/2000/svg','defs');
				defs.appendChild(svgdefs);
				// Add it in the map div // document.body.appendChild (defs);
				this.map.viewPortDiv.appendChild (defs);
			}
			else svgdefs = defs.firstChild;

			var svgfilter = document.createElementNS('http://www.w3.org/2000/svg','filter');
			svgfilter.setAttribute('id', this.id+"_colorFilter");
			svgdefs.appendChild(svgfilter);

			// Add a color filter
			var color = document.createElementNS('http://www.w3.org/2000/svg','feColorMatrix');
			color.setAttribute('type', this.options.colorFilter.type); // 'saturate'
			color.setAttribute('values', this.options.colorFilter.values || '0'); //'0');
			svgfilter.appendChild(color);
			this.colorFilter = color;
		}
		else
		{	this.colorFilter.setAttribute('type', this.options.colorFilter.type); // 'saturate'
			this.colorFilter.setAttribute('values', this.options.colorFilter.values || '0'); //'0');
		}
	}

	this.initProperties();
	this.removeBackBuffer();

};

/** Overwrite OpenLayers.Layer.prototype.setMap to add colorFilter in the layer
*/
var setMap = OpenLayers.Layer.prototype.setMap;
OpenLayers.Layer.prototype.setMap = function ()
{	var r = setMap.apply(this,arguments);
	if (this.options.colorFilter) this.setColorFilter(this.options.colorFilter.type+":"+this.options.colorFilter.values);
	return r;
};

/** Overwrite OpenLayers.Layer.prototype.initialize with colorFilter options
*/
var initialize = OpenLayers.Layer.prototype.initialize;
OpenLayers.Layer.prototype.initialize = function (name, options)
{	var r = initialize.apply(this,arguments);
	if (options.colorFilter) this.setColorFilter(options.colorFilter);
	return r;
}


/**
* Method: getImage
* Returns or creates and returns the SVG tile.
*/
var getImage = OpenLayers.Tile.Image.prototype.getImage;

OpenLayers.Tile.Image.prototype.getImage = function() 
{	// Default behavior
	if (!this.layer.options.colorFilter) return getImage.apply(this,arguments);

	// Do color filter
    if (!this.imgDiv) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		svg.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
	
		//svg.setAttribute('height', 256);
		//svg.setAttribute('width', 256);
		svg.setAttribute('height', "100%");
		svg.setAttribute('width', "100%");

		// Add the image to the svg
		var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
		svgimg.setAttribute('filter','url("#'+this.layer.id+'_colorFilter")');

		svgimg.setAttribute('x','0');
		svgimg.setAttribute('y','0');
		svgimg.setAttribute('height','100%');
		svgimg.setAttribute('width','100%');
		svgimg.setAttribute('preserveAspectRatio','none');
		// svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href',"");

		svg.appendChild(svgimg);

		this.img = new Image();
		//this.img.src="";

		this.imgDiv = document.createElement('div');
		this.imgDiv.setAttribute('height', this.size.h);
		this.imgDiv.setAttribute('width', this.size.w);
        this.imgDiv.appendChild(svg); // OpenLayers.Tile.Image.IMAGE.cloneNode(false);
		this.imgDiv.className = "olTileImage";

        var style = this.imgDiv.style;
        if (this.frame) {
            var left = 0, top = 0;
            if (this.layer.gutter) {
                left = this.layer.gutter / this.layer.tileSize.w * 100;
                top = this.layer.gutter / this.layer.tileSize.h * 100;
            }
            style.left = -left + "%";
            style.top = -top + "%";
            style.width = (2 * left + 100) + "%";
            style.height = (2 * top + 100) + "%";
        }
        style.visibility = "hidden";
        style.opacity = 0;
        if (this.layer.opacity < 1) {
            style.filter = 'alpha(opacity=' +
                            (this.layer.opacity * 100) +
                            ')';
        }
        style.position = "absolute";
        if (this.layerAlphaHack) {
            // move the image out of sight
            style.paddingTop = style.height;
            style.height = "0";
            style.width = "100%";
        }
        if (this.frame) {
            this.frame.appendChild(this.imgDiv);
        }
    }
	if (!this.img) this.img = new Image();

    return this.img;
};


/**
* Method: setImgSrc
* Sets the source for the tile image
*
* Parameters:
* url - {String} or undefined to hide the image
*/
var setImgSrc = OpenLayers.Tile.Image.prototype.setImgSrc;

OpenLayers.Tile.Image.prototype.setImgSrc = function(url) 
{   // Default behavior
	if (!this.layer.options.colorFilter) return setImgSrc.apply(this,arguments);

	// Do color filter
    var img = this.imgDiv;
    if (url) {
        img.style.visibility = 'hidden';
        img.style.opacity = 0;
		var svgimg = img.firstChild.firstChild;
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href',url);
		img.src = this.img.src = url;
    } else {
        // Remove reference to the image, and leave it to the browser's
        // caching and garbage collection.
        this.stopLoading();
        this.imgDiv = null;
		this.img = new Image();
		img.src="";
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    }
};


/**
* Method: getTile
* Get the tile's markup.
*
* Returns:
* {DOMElement} The tile's markup
*/
var getTile = OpenLayers.Tile.Image.prototype.getTile;

OpenLayers.Tile.Image.prototype.getTile = function() 
{	// Default behavior
	if (!this.layer.options.colorFilter) return getTile.apply(this,arguments);

	// Do color filter
    if (this.frame) return this.frame;
	else
	{	this.getImage();
		return this.imgDiv;
	}
};

})();