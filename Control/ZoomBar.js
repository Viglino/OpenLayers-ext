/** Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Dual-licensed under the BSD Licence (http://opensource.org/licenses/BSD-2-Clause)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-).
* Source code on Github : https://github.com/Viglino/OpenLayers-ext
*/
/**
 * Class: OpenLayers.Control.ZoomBar
 * The ZoomBar is a visible control composed of a set off button to switch zoom level.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ZoomBar = OpenLayers.Class(OpenLayers.Control, {

    /** 
     * APIProperty: alignRight
     */
    alignRight: false,

    /**
     * APIProperty: zoomInOut
     * {Boolean} Set this property to false not to display the zoomin and out icons. 
     */
    zoomInOut: false,

    /**
     * APIProperty: btSize
     * {w,h} Size of the buttons. 
	 * null width : proportional to the scale value 
     */
    btSize: { w:0, h:9 },

    /**
     * APIProperty: curve
     * Function to draw the button : linear, sinus, exp
     */
	curve:"exp",

    /**
     * Constructor: OpenLayers.Control.ZoomBar
     */ 

    /**
     * APIMethod: destroy
     */
    destroy: function() 
	{   this._removeZoomBar();

        this.map.events.un({
            "changebaselayer": this.redraw,
			"zoomend": this.moveZoomBar,
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
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.on(
		{   "changebaselayer": this.redraw,
			"zoomend": this.moveZoomBar,
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

		if (this.alignRight) OpenLayers.Element.addClass(this.div, 'olAlignRight');
		else OpenLayers.Element.removeClass(this.div, 'olAlignRight');

        // place the controls
        this.buttons = [];

		if (typeof this.btSize !== "object") this.btSize={};
        var sz = { w: this.btSize.w, h: this.btSize.h||9 };
		var zs = {w:11, h:18};
		var f;
		switch (this.curve)
		{	case "sinus":
				f = function(t) { return 2.0*t*Math.sin(1.57*(t)/19) +8; }
				break;
			case "exp":
				f = function(t) { return t*Math.exp(t/19) +8; }
				break;
			default:
				f = function(t) { return 2*t +8; }
				break;
		}
        
		var minZoom = this.map.getMinZoom();
		var zoomsToEnd = this.map.getNumZoomLevels();
		var offset = this.map.baseLayer.zoomOffset;
		
		var btn;
		if (this.zoomInOut) 
		{	this._addButton("zoombarin", px, {w: sz.w||Math.max(f(zoomsToEnd+offset-1), zs.w), h: zs.h}, "+");
			px = px.add(0, zs.h);
		}

		for (var i=zoomsToEnd-1; i>=minZoom; i--)
		{	btn = this._addButton("zoom"+(i+offset), px.add(0,(sz.h+2)*(zoomsToEnd-i-1)+2), {w: sz.w||f(i+offset), h: sz.h});
			OpenLayers.Element.addClass(btn, 'zoomlevel');
		}

		if (this.zoomInOut) 
			this._addButton("zoombarout", px.add(0,(sz.h+2)*(zoomsToEnd-minZoom)+2), {w: sz.w||Math.max(f(minZoom+offset), zs.w), h: zs.h}, "-");
        
		this.moveZoomBar();
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
    _addButton:function(id, xy, sz, text) 
	{	var btn = OpenLayers.Util.createDiv(this.id+"_"+id, xy, sz);
		btn.style.cursor = "pointer";
		//we want to add the outer div
		this.div.appendChild(btn);
		btn.action = id;
		btn.className = "olButton "+id;
		//we want to remember/reference the outer div
		if (text) btn.appendChild(document.createTextNode(text));
		this.buttons.push(btn);
		return btn;
	},

	/**
     * Method: _removeButton
     * 
     * Parameters:
     * btn - {Object}
     */
    _removeButton: function(btn) 
	{   this.div.removeChild(btn);
        OpenLayers.Util.removeItem(this.buttons, btn);
    },
    
    /**
     * Method: removeButtons
     */
    removeButtons: function() 
	{   if (this.buttons) for(var i=this.buttons.length-1; i>=0; --i) 
		{   this._removeButton(this.buttons[i]);
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
		if (btn.action)
		{	var zaction = btn.action.match(/^zoom(\d+)/);
			if (zaction && zaction.length>1)
			{	var zoom = Number(zaction[1])-this.map.baseLayer.zoomOffset;
				this.map.zoomTo(zoom);
			}
			else switch (btn.action) 
			{	case "zoombarin": 
					this.map.zoomIn(); 
					break;
				case "zoombarout": 
					this.map.zoomOut(); 
					break;
			}
		}
    },
    
    /*
    * Method: moveZoomBar
    * Change the location of the select to match the current zoom level.
    */
    moveZoomBar:function() 
	{	var zaction = "zoom"+(this.map.getZoom()+this.map.baseLayer.zoomOffset);
		for (var i=0; i<this.buttons.length; i++) 
		{	if (this.buttons[i].action == zaction) OpenLayers.Element.addClass(this.buttons[i], 'select');
			else OpenLayers.Element.removeClass(this.buttons[i], 'select');
		}
        
    },    
    
    CLASS_NAME: "OpenLayers.Control.ZoomBar"
});