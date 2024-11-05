---
permalink: /docs/overview/visualization
title: "Visualization"
excerpt: "Walk around your code!"

toc: true
toc_sticky: true
toc_label: "Jump to Section"

gallery:
  - url: "/assets/images/docs/visualization/visualization.png"
    image_path: "/assets/images/docs/visualization/visualization.png"
    title: "Visualization"
---

The goal of the CodeCharta visualization is to make code quality more accessible and tangible to everyone. We use the _city metaphor_ and represent each file in your source code with a _building_. This allows user to grasp complex metrics, even without knowing what they are in detail. This also provides a big picture view of code to **experienced professionals** and allows them free exploration of the code files and their metrics.

This is what you will find, once you [open the web visualization]({{site.web_visualization_link}}):

{% include gallery %}

The main focus is the city-style map. Each building in it has the attributes **size**, **height** and **color**, which are selectable via drop down menus and can each represent a different metric. This way the visualization allows users to contrast multiple metrics at the same time. The default settings for these metrics looks like this:

- size ![]({{site.baseurl}}/assets/images/vendor/fontawesome/arrows-alt-solid.svg){: width="20px"} = _rloc (real lines of code)_
- height ![]({{site.baseurl}}/assets/images/vendor/fontawesome/arrows-alt-v-solid.svg){: width="10px"} = _complexity (cyclomatic complexity)_
- color ![]({{site.baseurl}}/assets/images/vendor/fontawesome/paint-brush-solid.svg){: width="20px"} = _complexity (cyclomatic complexity)_

> Note that the available metrics are tied to the cc.json used to load the map. Depending on which parser of our [CCSH (CodeCharta Shell)]({{site.baseurl}}{% link _docs/overview/analysis.md %}) was used to generate the map, different metrics might be available.
> For more information on what these names mean and which parsers produce which metrics, view the [list of available tools]({{site.baseurl}}{% link _docs/overview/analysis.md %}#available-tools) in analysis.
