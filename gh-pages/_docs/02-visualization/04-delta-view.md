---
permalink: /docs/visualization/delta-view
title: "Delta View"
excerpt: ""

gallery-import:
  - url: "/assets/images/docs/visualization/import-button.png"
    image_path: "/assets/images/docs/visualization/import-button.png"
    title: "Button to import multiple maps"
gallery-switch:
  - url: "/assets/images/docs/visualization/delta-switch.png"
    image_path: "/assets/images/docs/visualization/delta-switch.png"
    title: "Button to switch between views"
gallery-select-delta-maps:
  - url: "/assets/images/docs/visualization/select-delta-maps.png"
    image_path: "/assets/images/docs/visualization/select-delta-maps.png"
    title: "Select two maps for delta view"
gallery-compare:
  - url: "/assets/images/docs/visualization/delta-map.png"
    image_path: "/assets/images/docs/visualization/delta-map.png"
    title: "Map aggregated with two different maps"
---
Ever wanted to compare two different points in time in your project? Delta View lets you do just that!

# Create two different maps
Create two different mapsPermalink
The easiest way to use our delta view is to use git and create two maps with different commits or branches.
First, create two different maps for your project using our [CCSH]({{site.docs_overview}}/analysis).

# Import two maps
Next, import two different maps
{% include gallery id="gallery-import" %}

# Open Delta View
Now click on the delta view icon in the top left corner of the screen and select the two maps you want to compare.
{% include gallery id="gallery-switch" %}
{% include gallery id="gallery-select-delta-maps" %}

# Compare
With both maps now visible, you can see what has changed over time.
In the default configuration, red means it has been removed and green means it has been added.
Take a look at our [User Controls]({{site.docs_visualization}}/user-controls) to see what you can do with our metrics.
{% include gallery id="gallery-compare" %}
