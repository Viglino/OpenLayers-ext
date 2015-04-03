/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Patch OpenLayers.Handler.Feature.click to provide click on thin features.
	It tries to select the feature under the click within a pixel tolerance.
	/!\ Features that are not rendered (display=false) can even be selected...
	
	https://github.com/Viglino/OpenLayers-ext

**/

/** OpenLayers.Control.SelectFeature : add select tolerance (pixel)
	- modify OpenLayers.Handler.Feature.click  
	- add double-click callback on OpenLayers.Control.SelectFeature : onDClick(feature)

	Modified files:
	- OpenLayers/Handler/Feature.js 
		=> MOD function : OpenLayers.Handler.Feature.prototype.click
		=> MOD function : OpenLayers.Handler.Feature.prototype.dblclick
		=> ADD property : selectTolerance : distance in pixel to select a feature
		=> ADD property : dclickTolerance : distance in pixel when double-click on a feature
*/

/**
* Property: selectTolerance
* {Number} The distance in pixel to select a feature.
* Defaults to 3.
*/
OpenLayers.Handler.Feature.prototype.selectTolerance = 3;

/**
* Method: click
* Handle click. Call the "click" callback if click on a feature,
* or the "clickout" callback if click outside any feature.
*
* Parameters:
* evt - {Event}
*
* Returns:
* {Boolean}
*/
OpenLayers.Handler.Feature.prototype.click = function(evt)
{	// Find the nearest object when no feature found
	if (!this.hover && !this.feature && this.selectTolerance > 0 && this.control)
	{	// Look beneath
		if (this.up && this.down) 
		{	// for click/clickout, only trigger callback if tolerance is met
			var dpx = Math.sqrt(
				Math.pow(this.up.x - this.down.x, 2) +
				Math.pow(this.up.y - this.down.y, 2)
			);
			if(dpx > this.clickTolerance) return false;
		}
		var f, proj, fmin=false, projmin = { distance : Number.POSITIVE_INFINITY };
		var pt = this.map.getLonLatFromPixel(evt.xy).clone();
		var geo= new OpenLayers.Geometry.Point(pt.lon,pt.lat);
		var layers = this.layer instanceof OpenLayers.Layer.Vector.RootContainer ? this.layer.layers : [this.layer];
		for (var l=0; l<layers.length; l++) if (layers[l].visibility)
		{	for (var i=0; i<layers[l].features.length; i++)
			{	f = layers[l].features[i];
				if (!f._sketch && f.state !== OpenLayers.State.DELETE)
				{	proj = geo.distanceTo(f.geometry, { details:true } );
					if (proj.distance < projmin.distance) 
					{	projmin = proj;
						fmin = f;
					}
				}
			}
		}
		if (fmin)
		{	var pt2 = new OpenLayers.LonLat(projmin.x1, projmin.y1);
			pt2 = this.map.getPixelFromLonLat(pt2);
			if (pt2.distanceTo(evt.xy) < this.selectTolerance)
			{	this.lastFeature = this.feature = fmin;
				this.control.clickFeature(fmin);
				return true;
			}
		}
	}
	return this.handle(evt) ? !this.stopClick : true;
};

/**
* Property: dclickTolerance
* {Number} The distance in pixel when double-click on a feature.
* Defaults to 5.
*/
OpenLayers.Handler.Feature.prototype.dclickTolerance = 5;

/**
* Method: dblclick
* Handle dblclick. Call the "dblclick" callback if dblclick on a feature.
*
* Parameters:
* evt - {Event}
*
* Returns:
* {Boolean}
*/
OpenLayers.Handler.Feature.prototype.dblclick = function(evt) 
{	if (!this.handle(evt)) // return true;
	{	if (this.dclickTolerance <= 0 | !this.lastFeature) return true;
		// Distance to the last selection
		var pt = this.map.getLonLatFromPixel(evt.xy).clone();
		var geo= new OpenLayers.Geometry.Point(pt.lon,pt.lat);
		var d = geo.distanceTo (this.lastFeature.geometry, { details:true } );
		// Distance in pixel
		pt = new OpenLayers.LonLat (d.x1,d.y1);
		pt = this.map.getPixelFromLonLat(pt);
		// Distance out of range
		if (pt.distanceTo(evt.xy) > this.dclickTolerance) return true;
		else
		{	if (this.control)
			{	this.control.unselect(this.lastFeature);	// Make sure the feature is not selected
				this.control.select(this.lastFeature);
				this.feature = this.lastFeature;
				// Call the control onDClick callback
				if (this.control.onDClick) this.control.onDClick.call(this.control.scope, this.lastFeature);
			}
			return false;
		}
	}
	// Call the control onDClick callback
	if (this.control && this.control.onDClick) this.control.onDClick.call(this.control.scope, this.layer.getFeatureFromEvent(evt));
	return false;
};
