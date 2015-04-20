OpenLayers-ext
==============

Extension for the OpenLayers library

**OpenLayers.Control.FullPage :**
The FullPageButton control is a very simple push-button. When clicked, it adds a olFullPageMap style to the map to display the map at fixed position and fill the browser window.

**OpenLayers.Control.ZoomBar :**
The ZoomBar is a visible control composed of a set off button to switch zoom level.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.controls.html)

**OpenLayers.Popup.Styled :**
Popup styled by a CSS. [View an example](http://viglino.github.io/OpenLayers-ext/examples/map.popup.html)

![OpenLayers.Popup.Styled](http://viglino.github.io/OpenLayers-ext/img/popup.jpg)

**Cluster**

![Clusters](http://viglino.github.io/OpenLayers-ext/img/cluster.jpg)

OpenLayers.Control.SelectCluster: A select control to select features.
When selected, the clusters animate and spread dynamicaly to show the clustered features. 
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.cluster.html)

**Statistical maps**

![Charts map](http://viglino.github.io/OpenLayers-ext/img/charts.jpg)

OpenLayers.Renderer.SVGCharts: Implements a SVG based renderer to display charts (pies or bars) on a map.
OpenLayers.Renderer.VMLCharts: Implements a VML based renderer to display charts (pies or bars) on a map.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.charts.html)

**Font Awesome**

![Font Awesome map](http://viglino.github.io/OpenLayers-ext/img/awesome.jpg)

Overwrite the SVG renderer to draw Font Awesome symbols on a vector layer.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.awesome.html)

**Line Symbol renderer**

![LineSymbol map](http://viglino.github.io/OpenLayers-ext/img/linesymbol.jpg)

Overwrite the SVG renderer to to draw symbols (arrow, circle, barbs) along LineString objets in a vector layer.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.symbol.lines.html)

**Text Path renderer**

![TextPath map](http://viglino.github.io/OpenLayers-ext/img/textpath.jpg)

Overwrite the SVG renderer to display texts along LineString objets in a vector layer.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.textpath.html)

**Bounce animation on markers**

![Boncing markers](http://viglino.github.io/OpenLayers-ext/img/bounce.jpg)

Add animations method on point features (OpenLayers.Feature.Vector.prototype.bounce).
The animation methods is designed to be used with externalGraphic (and backgroundGraphic). It will modify the graphicOffset of the marker.
[View an example](http://viglino.github.io/OpenLayers-ext/examples/map.boncing.marker.html)
