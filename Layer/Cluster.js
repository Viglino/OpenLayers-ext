/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware), 
* feel free to use and abuse it in your projects (the code, not the beer ;-). 
*/

/**
* Class: OpenLayers.Layer.Cluster
* OpenLayers.Layer.Cluster is a OpenLayers.Layer.Vector with cluster stragegy and styling
*
* Inherits from:
* - <OpenLayers.Layer.Vector>
*/
OpenLayers.Layer.Cluster = OpenLayers.Class(OpenLayers.Layer.Vector, 
{
		
	/**
	* APIProperty: startegyParam 
	* Properties for OpenLayers.Strategy.Cluster 
	* and OpenLayers.Strategy.AnimatedCluster if included
	*/
	startegyParam:
	{	/**
		* APIProperty: distance
		* {Integer} Pixel distance between features that should be considered a
		* single cluster. Default is 45 pixels.
		*/
		distance: 45,
		
		/**
		* APIProperty: animationMethod for animated cluster if included
		* https://github.com/acanimal/AnimatedCluster
		*/
		animationMethod: OpenLayers.Easing.Expo.easeOut,
		
		/**
		* APIProperty: animationDuration for animated cluster if included
		* https://github.com/acanimal/AnimatedCluster
		*/
		animationDuration: 30
	},

    /**
	* Constructor: OpenLayers.Layer.Cluster
	* Create a new cluster layer
	*
	* Parameters:
	* name - {String} A name for the layer
	* options - {Object} Optional object with non-default properties to set on
	* the layer. Use options.startegyParam to setup cluster strategy properties.
	*
	* Returns:
	* {<OpenLayers.Layer.Vector>} A new vector layer
	*/
	initialize: function(name, options) 
	{   if (!options) options={};
		var self = this;
		// 
		var smap = options.styleMap;
		if (!smap) 
		{	options.styleMap = smap = new OpenLayers.StyleMap (OpenLayers.Util.extend({},OpenLayers.Feature.Vector.style));
		}
		if (!smap.styles["default"].context) smap.styles["default"].context={};
		// Overload a style
		function overrideStyle (s,f)
		{	var f0, v0;
			// is a value
			v0 = smap.styles["default"].defaultStyle[s];
			// is a function
			if (v0 && v0.match) f0 = v0.match(/^\$\{(.*)\}$/);
			if (f0) f0 = smap.styles["default"].context[f0[1]];
			// Override
			smap.styles["default"].defaultStyle[s] = "${"+s+"}";
			smap.styles["default"].context[s] = function(feature)
				{	if (feature.cluster && self.countFeaturesInCluster(feature)>1) return f(feature);
					else return f0 ? f0(feature) : v0 ? v0 : "";
				};
			smap.styles["default"].propertyStyles[s] = true;
		}
		// Overload pointRadius
		var pointRadius = smap.styles["default"].defaultStyle.pointRadius || 3;
		var minRadius = smap.styles["default"].defaultStyle.minRadius || 6;
		var maxRadius = smap.styles["default"].defaultStyle.maxRadius || 30;
		var facRadius = smap.styles["default"].defaultStyle.facRadius || 1;
//		overrideStyle ("pointRadius", function(feature) { return Math.min(minRadius + (feature.attributes.count-1)*facRadius,maxRadius);});
		overrideStyle ("pointRadius", function(feature) { return Math.min(minRadius + (self.countFeaturesInCluster(feature)-1)*facRadius,maxRadius);});
		// Overload strokeWidth
		overrideStyle ("strokeWidth", function(feature) { return 10; });
		// Overload strokeOpacity
		overrideStyle ("strokeOpacity", function(feature) { return 0.5; });
		// Overload strokeColor
		var fillColor = smap.styles["default"].defaultStyle.fillColor;
		var fillColorFunction = null;
		if (fillColor && fillColor.match) 
		{	fillColorFunction = fillColor.match(/^\$\{(.*)\}$/);
			if (fillColorFunction) fillColorFunction = smap.styles["default"].context[fillColorFunction[1]];
		}
		overrideStyle ("strokeColor", function(feature) 
		{	return fillColorFunction ? fillColorFunction(feature) : fillColor; 
		});
		// Overload fillOpacity
		overrideStyle ("fillOpacity", function(feature) { return 1; });
		// Overload externalGraphic
		overrideStyle ("externalGraphic", function(feature) { return ""; });
		// Overload externalGraphic
		overrideStyle ("backgroundGraphic", function(feature) { return ""; });
		// Overload label
		overrideStyle ("label", function(feature) { return self.countFeaturesInCluster(feature); });


		var strategy;
		if (OpenLayers.Strategy.AnimatedCluster) strategy = OpenLayers.Strategy.AnimatedCluster
		else strategy = OpenLayers.Strategy.Cluster;
		var strategy_clusters = new strategy ({
				distance: this.startegyParam.distance,
				animationMethod: this.startegyParam.animationMethod,
				animationDuration: this.startegyParam.animationDuration
			});
		this.strategy_clusters = strategy_clusters;

		if (options.strategies) options.strategies.push(strategy_clusters);
		else options.strategies = [strategy_clusters];

		OpenLayers.Layer.Vector.prototype.initialize.apply(this, [name, options]);
	},
	
	/** Add new feature : the standard method remove existing features
	*/
	addFeatures: function (features)
	{	if (!this.strategy_clusters.clustering)
		{	var f = this.strategy_clusters.features;
			if (f) features = features.concat(f);
		}
		OpenLayers.Layer.Vector.prototype.addFeatures.apply(this, [features]);
	},

	/** Refresh the layer : re-calculate the clusters
	*/
	refresh: function()
	{	//this.strategy_clusters.clusters=null;
		this.strategy_clusters.resolution = 0;
		this.strategy_clusters.cluster();
	},

	/** Compact features at the same coords in a cluster to minimze number of features
	*/
	compact: function()
	{	if (this.isCompact) return;
		var features = this.strategy_clusters.features;
		var clusters = [];
		var clustered;
		// Cluster features at the same coord
		for (var i=0; i<features.length; i++)
		{	feature = features[i];
			if(feature.geometry) 
			{	clustered = false;
				for(var j=clusters.length-1; j>=0; --j) 
				{	cluster = clusters[j];
					if(feature.geometry.getBounds().getCenterLonLat().equals(cluster.geometry.getBounds().getCenterLonLat())) 
					{	cluster.cluster.push(feature);
						cluster.attributes.count += 1;
						clustered = true;
						break;
					}
				}
				if (!clustered) 
				{	var center = feature.geometry.getBounds().getCenterLonLat();
					var cluster = new OpenLayers.Feature.Vector(
						new OpenLayers.Geometry.Point(center.lon, center.lat),
						{count: 1}
					);
					cluster.cluster = [feature];
					clusters.push(cluster);
				}
			}
		}
		features = new Array();
		var l = clusters.length;
		for (var i=0; i<l; i++)
		{	if (clusters[i].cluster && clusters[i].attributes.count==1) features.push(clusters[i].cluster[0]);
			else features.push(clusters[i]);
		}
		// Add the new features
		OpenLayers.Layer.Vector.prototype.addFeatures.apply(this, [features]);
		this.isCompact = true;
		this.refresh();
	},

	/** Count number of feature in a cluster
	*/
	countFeaturesInCluster: function(feature)
	{	if (feature.layer != this) return 1;
		if (feature.cluster)
		{	// Normal cluster
			if (!this.isCompact) return feature.attributes.count;
			var c = 0;
			// Compact Cluster > count cluster of cluster
			for (var i=0; i<feature.cluster.length; i++)
			{	c += feature.cluster[i].cluster ? feature.cluster[i].attributes.count : 1;
			}
			return c;
		}
		// No cluster
		else return 1;
	},

	/** Get the features in a cluster
	*/
	getFeaturesInCluster: function(feature)
	{	if (feature.layer != this) return [feature];
		if (feature.cluster)
		{	// Normal cluster
			if (!this.isCompact) return feature.cluster;
			var f=new Array();
			// Compact Cluster > count cluster of cluster
			for (var i=0; i<feature.cluster.length; i++)
			{	if (feature.cluster[i].cluster) 
				{	for (k=0; k<feature.cluster[i].cluster.length; k++) 
						f.push( feature.cluster[i].cluster[k] )
				}
				else f.push( feature.cluster[i] );
			}
			return f;
		}
		// No cluster
		else return [feature];
	},

	/** Cluster layer */
	CLASS_NAME: "OpenLayers.Layer.Cluster"
});