/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/
/** Class: OpenLayers.Control.FullPageButton
*	The FullPageButton control is a very simple push-button, used by <OpenLayers.Control.FullPage>.
*	When clicked, adds a olFullPageMap style to the map ie. position:static + top,left,bottom,right:0 in css.
* 
*	Inherits from:
*		- <OpenLayers.Control.Button>
*/
OpenLayers.Control.FullPageButton = OpenLayers.Class(OpenLayers.Control.Button, 
{   /**
     * Method: trigger
     */
    trigger: function(){
        if (this.map) 
		{	if (OpenLayers.Element.hasClass(this.map.div, 'olFullPageMap'))
			{	OpenLayers.Element.removeClass(this.map.div, "olFullPageMap");
			}
			else 
			{	OpenLayers.Element.addClass(this.map.div, "olFullPageMap");
			}
			this.map.render(this.map.div);
        }
    },

    CLASS_NAME: "OpenLayers.Control.FullPageButton"
});

/** Class: OpenLayers.Control.FullPage
*	The FullPage control is a panel vith a FullPageButton.
*	When clicked, add a olFullPageMap style to the map ie. position:static + top,left,bottom,right:0 in css.
* 
*	Inherits from:
*		- <OpenLayers.Control.Panel>
*/
OpenLayers.Control.FullPage = OpenLayers.Class(OpenLayers.Control.Panel, 
{	initialize: function(options) 
	{   OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([ new OpenLayers.Control.FullPageButton() ]);
    },

    CLASS_NAME: "OpenLayers.Control.FullPage"
});