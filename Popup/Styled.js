/** Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Dual-licensed under the BSD Licence (http://opensource.org/licenses/BSD-2-Clause)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-).
* Source code on Github : https://github.com/Viglino/OpenLayers-ext
*/
/*
 * @requires OpenLayers.Popup.Anchored
 */
 
/**
 * Class: OpenLayers.Popup.Styled
 * Popup styled by CSS : use margin options to position the popup and anchor
 *
 * Inherits from:
 * - <OpenLayers.Popup.Anchored>
 */

OpenLayers.Popup.Styled =
  OpenLayers.Class(OpenLayers.Popup.Anchored, {
    
    /** 
     * Property: displayClass 
     * {string}  This property is used for CSS related to the drawing of the
     * Control. 
     */
    displayClass: "Default",
    
    /** 
     * Property: nbDiv 
     * {int}  Number of div in the anchorDiv
     */
    nbDiv: 2,

    /** 
     * Property: center 
     * {bool}  The popup is centered on the point 
     */
    center: false,
    
    /** 
     * Constructor: OpenLayers.Popup.Styled
     * 
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat>}
     * contentSize - {<OpenLayers.Size>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose 
     *     a 'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>) 
     *     (Note that this is generally an <OpenLayers.Icon>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, closeBoxCallback) 
    {   OpenLayers.Popup.Anchored.prototype.initialize.apply(this, arguments);

        OpenLayers.Element.addClass(this.div, "CssPopup");
        this.div.style.overflow = 'visible';
    },

    /**
     * APIMethod: setBackgroundColor, setBorder, setOpacity : ne fait rien !
     */
    setBackgroundColor:function(color) {},
	setBorder:function() {},
	setOpacity:function(opacity) {},

    /** 
     * APIMethod: destroy
     */
    destroy: function() 
    {	//remove our blocks
        if (this.anchorDiv && this.anchorDiv.div) 
		{	this.div.removeChild(this.anchorDiv.div);
			this.anchorDiv.div = null;
        }
        this.anchorDiv = null;

        OpenLayers.Popup.Anchored.prototype.destroy.apply(this, arguments);
    },
    
	/**
     * Method: updateBlocks
     * Update the popup class
	 * if the anchorDiv block is not defined create it, 
     * or update its position
	*/
	updateBlocks:function ()
	{	// Update the popup classe
		OpenLayers.Element.removeClass(this.div, "CssPopup_tl");
		OpenLayers.Element.removeClass(this.div, "CssPopup_tr");
		OpenLayers.Element.removeClass(this.div, "CssPopup_bl");
		OpenLayers.Element.removeClass(this.div, "CssPopup_br");
		OpenLayers.Element.addClass(this.div, "CssPopup_"+this.relativePosition);

		// The anchorDiv block
		if (!this.anchorDiv)
		{	var block = this.anchorDiv = {};
            			
            block.div = OpenLayers.Util.createDiv(this.id+'_anchor', null, null, null, "absolute", null, "visible", null );
            block.div.className = "CssPopup_anchor CssPopup_anchor"+this.relativePosition;
            this.div.appendChild(block.div);

			for (var i=0; i<this.nbDiv; i++)
			{	var b = OpenLayers.Util.createDiv(this.id+'_anchor_'+i, null, null, null, "absolute", null, "hidden", null );
				b.className = "anchor_"+i;
				block.div.appendChild (b);
			}
		}
	},
	
	/** 
     * Method: updatePosition
     * if the popup has a lonlat and its map members set, 
     * then have it move itself to its proper position
     */
    updatePosition: function() 
	{	OpenLayers.Popup.Anchored.prototype.updatePosition.apply(this, arguments);

        this.updateBlocks();
    },

    /**
     * APIMethod: setSize
     * Overridden here, because we need to update the blocks whenever the size
     *     of the popup has changed.
     * 
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) 
    {   OpenLayers.Popup.Anchored.prototype.setSize.apply(this, arguments);

        this.updateBlocks();
    },

	/** 
	* Method: calculateNewPx
	* 
	* Parameters:
	* px - {<OpenLayers.Pixel>}
	* 
	* Returns:
	* {<OpenLayers.Pixel>} The the new px position of the popup on the screen
	*     relative to the passed-in px.
	*/
	calculateNewPx:function(px) 
	{	var newPx = px.offset(this.anchor.offset);
        
		//use contentSize if size is not already set
		var size = this.size || this.contentSize;

		var top = (this.relativePosition.charAt(0) == 't');
		newPx.y += (top) ? -size.h : this.anchor.size.h;
        
		if (this.center)
		{	newPx.x += -size.w/2;
		}
		else
		{	var left = (this.relativePosition.charAt(1) == 'l');
			newPx.x += (left) ? -size.w : this.anchor.size.w;
		}

		return newPx;   
	},

    CLASS_NAME: "OpenLayers.Popup.Styled"
});

/** Usefull shortcuts
*/
OpenLayers.Popup.Styled['Default'] = OpenLayers.Class(OpenLayers.Popup.Styled, { });
OpenLayers.Popup.Styled.Blue = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledBlue' });
OpenLayers.Popup.Styled.Black = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledBlack' });
OpenLayers.Popup.Styled.Tips = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledTips' });
OpenLayers.Popup.Styled.Think = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledThink' });
OpenLayers.Popup.Styled.Warning = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'popWarning' });

OpenLayers.Popup.Styled.Centered = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledCentered', center:true });
OpenLayers.Popup.Styled.BlueCenter = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledBlue styledCentered', center:true });
OpenLayers.Popup.Styled.BlackCenter = OpenLayers.Class(OpenLayers.Popup.Styled, { displayClass:'styledBlack styledCentered', center:true });
