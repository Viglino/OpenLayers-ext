/** Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Dual-licensed under the BSD Licence (http://opensource.org/licenses/BSD-2-Clause)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-).
* Source code on Github : https://github.com/Viglino/OpenLayers-ext
*/
/**
 * Class: OpenLayers.Control.LayerMenu
 * The LayerMenu is a visible control composed of a set off button to switch baseLayer visibility.
 *	Overlays of the same group as the baseLayer are shown with the baseLayer
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.LayerMenu = OpenLayers.Class(OpenLayers.Control, 
{	alignRight: true,

	/**
     * APIMethod: destroy
     */
    destroy: function() 
	{   this.removeButtons();

        this.map.events.un({
            "changebaselayer": this.redraw,
			"addlayer": this.redraw,
			"buttonclick": this.onButtonClick,
            scope: this
        });

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * Method: setMap
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) 
	{   OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.on(
		{   "changebaselayer": this.redraw,
			"addlayer": this.redraw,
			"buttonclick": this.onButtonClick,
            scope: this
        });
    },

    /** 
     * Method: redraw
     * clear the div and start over.
     */
    redraw: function() 
	{   if (this.div != null) this.removeButtons();
        this.draw();
    },
    
    /**
    * Method: draw 
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} 
    */
    draw: function(px) 
	{	OpenLayers.Control.prototype.draw.apply(this, arguments);
		if (!this.map || !this.map.baseLayer) return this.div;
		px = new OpenLayers.Pixel(0,0);

		OpenLayers.Element.addClass(this.div, 'layers');
		if (this.alignRight) OpenLayers.Element.addClass(this.div, 'olAlignRight');
		else OpenLayers.Element.removeClass(this.div, 'olAlignRight');

        // place the controls
        this.buttons = [];
		
		this.menuBtn = this._addButton("olLayerMenuBtn","menu");

		var btn;
		for (var i=0; i<this.map.layers.length; i++) 
		{	var l = this.map.layers[i];
			if (l.isBaseLayer)
			{	btn = this._addButton(l.id, l.group || l.name);
			}
		}

		this.setLayer();

        return this.div;
    },

    /**
     * Method: _addButton
     * 
     * Parameters:
     * id - {String} 
     * xy - {<OpenLayers.Pixel>} 
     * sz - {<OpenLayers.Size>} 
     * text - {String} 
     * 
     * Returns:
     * {DOMElement} A Div (an alphaImageDiv, to be precise) that contains the
     *     image of the button, and has all the proper event handlers set.
     */
    _addButton:function(id,text) 
	{	var btn = OpenLayers.Util.createDiv(this.id+"_"+id,null,null,null,"static");
		btn.style.cursor = "pointer";
		//we want to add the outer div
		this.div.appendChild(btn);
		btn.layer = id;
		btn.className = "olButton "+id;
		if (text) btn.appendChild(document.createTextNode(text));
		this.buttons.push(btn);
		return btn;
	},

    /**
     * Method: removeButtons
     */
    removeButtons: function() 
	{   if (this.buttons) for(var i=this.buttons.length-1; i>=0; --i) 
		{   this.div.removeChild(this.buttons[i]);
			OpenLayers.Util.removeItem(this.buttons, this.buttons[i]);
        }
    },
    
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function(evt) 
	{	var btn = evt.buttonElement;
		if (btn.layer)
		{	var l = this.map.getLayersBy("id",btn.layer).pop();
			if (l) 
			{	if (l.isBaseLayer) 
				{	this.map.setBaseLayer(l);
					this.menuBtn.innerHTML = l.group || l.name;
				}
				this.setLayer();
			}
		}	
    },
    
    /*
    * Method: setLayer
    * Change the layer of the select to match the current layer.
    */
    setLayer:function() 
	{	for (var i=0; i<this.buttons.length; i++)
		{	var l = this.map.getLayersBy("id",this.buttons[i].layer).pop();
			if (l)
			{	if (l.getVisibility()) OpenLayers.Element.addClass(this.buttons[i], "select");
				else OpenLayers.Element.removeClass(this.buttons[i], "select");
			}
		}
		// Show overlays of the same group and hide others
		for (var i=0; i<this.map.layers.length; i++) 
		{	var l = this.map.layers[i];
			if (!l.isBaseLayer && l.group)
			{	if (l.group == this.map.baseLayer.group) l.setVisibility(true);
				else l.setVisibility(false);
			}
		}
    },    
    
    CLASS_NAME: "OpenLayers.Control.LayerMenu"
});