/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/

/**
* Class: OpenLayers.Control.SelectCluster
* The SelectCluster control selects vector features from a given 
* cluster layer on click or hover.
*
* Inherits from:
* - <OpenLayers.Control.SelectFeature>
*/

OpenLayers.Control.SelectCluster = OpenLayers.Class(OpenLayers.Control.SelectFeature, 
{
	/**
	* APIProperty: connect
	* {Boolean} Draw connection lines to the cluster. Default is false.
	*/
	connect: false,

	/**
	* APIProperty: animate
	* {Boolean} Play an animation. Default is false.
	*/
	animate:false,

	/**
	* APIProperty: animationDuration
	* {Integer} The number of steps to be passed to the OpenLayers.Tween.start() 
	* method when the clusters are animated.
	* Default is 40.	
	*/
	animationDuration: 40,

	/**
	* APIProperty: pointRadius
	* {Number} Radius of the points in the cluster. Default is 12.
	*/
	pointRadius: 12,

	/**
	* APIProperty: circleMaxObject
	* {Integer} Number of points to be drawn on a circle. Default is 10
	*/
	circleMaxObject: 10,

	/**
	* APIProperty: spiral
	* {Boolean} Allow to draw point on a spiral when more than circleMaxObject. Default is true
	*/
	spiral: true,

	/**
	* APIProperty: maxPoint
	* {Boolean} Number of points to be drawn on a spiral. Default is 60
	*/
	maxPoint: 60,

	/**
	* Property: animationTween
	* {OpenLayers.Tween} Tween for animation.
	*/
	animationTween: new OpenLayers.Tween(OpenLayers.Easing.Expo.easeOut),

	// Initialize the SelectCluster control
    initialize: function(layers, options) 
	{	if (!layers.length) layers = [layers];
		var smap = layers[0].styleMap;
		
		// Add a new layer to store selection
		this.selLayer = new OpenLayers.Layer.Vector("Selection",
				{	displayInLayerSwitcher: false,
					visibility:false,
					// Get the yOrdering for shadow on marker
					rendererOptions: layers[0].rendererOptions,
					styleMap: smap
				});
		// Add this layer to selection
		layers.push(this.selLayer);

		// No box selection
		if (options) options.box = false;
	
		OpenLayers.Control.SelectFeature.prototype.initialize.apply(this, [layers, options]);

	},

	/**
	* Method: setMap
	* Set the map property for the control.
	*
	* Parameters:
	* map - {<OpenLayers.Map>}
	*/
    setMap: function(map) 
	{   OpenLayers.Control.SelectFeature.prototype.setMap.apply(this, arguments);
		
		map.addLayer(this.selLayer);
		map.events.register('movestart', this, function(e) 
		{	//if(e.zoomChanged)
			{	this.unselectAll(); 
				this.selLayer.setVisibility(false);
			}
		});
		map.events.register('changelayer', this, function(e) 
		{	if (	e.property == "visibility" 
				&&	e.layer != this.selLayer 
				&&	OpenLayers.Util.indexOf(this.layers,e.layer) > -1 
				) 
				this.selLayer.setVisibility(false);
		});
    },

	/**
	* Method: select
	* If the feature is a cluster spread it out in selLayer.
	* Otherwise, do default action.
	*
	* Parameters:
	* feature - {<OpenLayers.Feature.Vector>}
	*/
    select: function(feature) 
	{	// Don't spread twice
		if (feature == this.lastCluster && this.selLayer.getVisibility()) return;
		var count=1;
		var layer = feature.layer;
		// Spread the cluster out
		if (feature.cluster) 
		{	this.lastCluster = feature;
			// Clear the Layer
			this.selLayer.removeAllFeatures();
			this.selLayer.setVisibility(true);
			if (layer && layer.countFeaturesInCluster) count = layer.countFeaturesInCluster(feature);
			else count = feature.cluster.attributes.count;
		}

		if (count>1)
		{	
			// Pixel size in map unit
			var pix = feature.layer.map.resolution;
			var cluster = new Array();
			if (layer && layer.getFeaturesInCluster)
			{	cluster = layer.getFeaturesInCluster(feature);
			}
			else cluster = feature.cluster;

			// Draw on a circle
			if (!this.spiral || cluster.length <= this.circleMaxObject)
			{	var r = pix * this.pointRadius * (0.5 + cluster.length / 4);
				var features = new Array();
				var links = new Array();
				var max = Math.min(cluster.length, this.circleMaxObject);
				// Features on a circle
				for (i=0; i<max; i++)
				{	// New feature
					var f = cluster[i].clone();
					var a = 2*Math.PI*i/max;
					if (max==2 || max == 4) a += Math.PI/4;
					if (this.animate)
					{	f.dataAnimate = 
							{	x0:feature.geometry.x, y0:feature.geometry.y,
								x1:feature.geometry.x+r*Math.sin(a), y1:feature.geometry.y+r*Math.cos(a) 
							}
					}
					else f.geometry = new OpenLayers.Geometry.Point (feature.geometry.x+r*Math.sin(a), feature.geometry.y+r*Math.cos(a));
					// Draw connection
					if (this.connect)
					{	var f2 = cluster[i].clone();
						f2.geometry = new OpenLayers.Geometry.LineString (
							[	f.geometry ,
								feature.geometry
							]);
						links.push(f2);
					}
					features.push(f);
				}
				if (this.connect) this.selLayer.addFeatures(links);
				this.selLayer.addFeatures(features);
			}
			// Draw on a spiral
			else
			{	// Angle de depart
				var a = 0;
				var r;
				var d = 2*this.pointRadius;
				var features = new Array();
				var links = new Array();
				var max = Math.min (this.maxPoint, cluster.length);
				// Feature on a spiral
				for (i=0; i<max; i++)
				{	// Nouveau rayon
					r = d/2 + d*a/(2*Math.PI);
					// Angle
					a = a + (d+0.1)/r;
					var dx = pix*r*Math.sin(a)
					var dy = pix*r*Math.cos(a)
					// New Feature
					var f = cluster[i].clone();
					if (this.animate)
					{	f.dataAnimate = 
							{	x0:feature.geometry.x, y0:feature.geometry.y,
								x1:feature.geometry.x+dx, y1:feature.geometry.y+dy 
							}
					}
					else f.geometry = new OpenLayers.Geometry.Point (feature.geometry.x+dx, feature.geometry.y+dy);
					features.push(f);
					// Draw connection
					if (this.connect)
					{	var f2 = cluster[i].clone();
						f2.geometry = new OpenLayers.Geometry.LineString (
							[	f.geometry ,
								feature.geometry
							]);
						links.push (f2);
					}
				}
				if (this.connect) this.selLayer.addFeatures(links);
				this.selLayer.addFeatures(features);
			}

			if (this.animate)
			{	// Animation
				var self = this;
				this.animationTween.start ( {pos:0.0}, {pos:1.0}, this.animationDuration, 
					{   callbacks: 
						{	eachStep: function (delta) { self.doAnimation(delta); },
							done: function (delta) { self.doAnimation(delta, true); }
						}
					}
				);
			}
		}
		else
		{	OpenLayers.Control.SelectFeature.prototype.select.apply(this, [feature]);
		}
	},

	/**
	* Method: doAnimation
	* Calculate animation on the features in the layer.
	*/
	doAnimation: function (delta, last)
	{	var pos = delta.pos;
		for (var i=0; i<this.selLayer.features.length; i++) 
		{	var f = this.selLayer.features[i];
			if (f.dataAnimate)
			{	f.geometry.x = f.dataAnimate.x0 + (f.dataAnimate.x1 - f.dataAnimate.x0) *pos;
				f.geometry.y = f.dataAnimate.y0 + (f.dataAnimate.y1 - f.dataAnimate.y0) *pos;
			}
			if (pos==1.0) f.geometry.calculateBounds();
		}
		this.selLayer.redraw();
	},

	/**
	* Method: clickoutFeature
	* Called on click outside a previously clicked (selected) feature.
	* Only responds if this.hover is false.
	*
	* Parameters:
	* feature - {<OpenLayers.Vector.Feature>}
	*/
	clickoutFeature: function(feature) 
	{	if(!this.hover && this.clickout) 
		{	this.selLayer.setVisibility(false);
			this.unselectAll();
		}
	},

	/**
	* Method: getSelection
	* Return the selected features.
	*
	* Parameters:
	* cluster - {Boolean} Get cluster features or original features (pay attention original features may have inconsistent layer). Default is false.
	*/
	getSelection: function(cluster)
	{	var i, j;
		var sel = new Array();
		for (i=0; i<this.layers.length; i++)
		{	var s = this.layers[i].selectedFeatures;
			for (j=0; j<s.length; j++)
			{	if (!cluster)
				{	if (!s[j].cluster) sel.push(s[j]);
					else if (s[j].cluster.length == 1) sel.push(s[j].cluster[0]);
				}
				else sel.push(s[j]);
			}
		}
		return sel;
	},

	CLASS_NAME: "OpenLayers.Layer.SelectCluster"
});
