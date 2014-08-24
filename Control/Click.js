/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Class: OpenLayers.Control.Click
*	A simple click control to handle click on the map
* 
*	Inherits from:
*		- <OpenLayers.Control>
*/
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, 
{	defaultHandlerOptions: 
	{	'single': true,
		'double': false,
		'pixelTolerance': 0,
		'stopSingle': false,
		'stopDouble': false
	},

	/**
     * Constructor: OpenLayers.Control.Click
     * Create a new control for click on the map.
     *
     * Parameters:
     * options - {Object} 
     *	{	onclick - function (LonLat, Event) : Callback
     *	}
     */
	initialize: function(options) 
	{	this.handlerOptions = OpenLayers.Util.extend( {}, this.defaultHandlerOptions);
		OpenLayers.Control.prototype.initialize.apply( this, arguments ); 
		this.handler = new OpenLayers.Handler.Click( this, 
			{	'click': this.trigger
			}, this.handlerOptions
		);
	}, 

	/**
     * Method: trigger
     */
    trigger: function(e)
	{	if (this.handler.checkModifiers(e))
		{	var lonlat = map.getLonLatFromPixel(e.xy);
			if (this.onclick) this.onclick(lonlat, e);
		}
	},
	
	CLASS_NAME: "OpenLayers.Control.Click"
});