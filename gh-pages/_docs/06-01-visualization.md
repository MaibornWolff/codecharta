---
permalink: /docs/visualization/
title: "Visualization"

gallery:
  - url: "/assets/images/docs/visualization/visualization.drawio.png"
    image_path: "/assets/images/docs/visualization/visualization.drawio.png"
    title: "Visualization"
---

The goal of the CodeCharta visualization is to provide a big picture view of code to **experienced professionals** and then allow them free exploration of the code files and their metrics. We use the _city metaphor_ and represent each file in your source code with a _building_.

We won't sugar coat it, the visualization can look a bit daunting at first. This is what you will find, once you [open the web visualization]({{site.web_visualization_link}}):

{% include gallery %}

In the center is the map. Each building in it has the attributes **size**, **height** and **color**. Each of these attributes can represent a different metric. This way the visualization allows you to contrast multiple metrics at the same time. A typical metric example is:

- size ![]({{site.baseurl}}/assets/images/vendor/fontawesome/arrows-alt-solid-white.svg){: width="20px"}=_rloc (real lines of code)_
- height ![]({{site.baseurl}}/assets/images/vendor/fontawesome/arrows-alt-v-solid-white.svg){: width="10px"}=_mcc (McCabe complexity)_
- color ![]({{site.baseurl}}/assets/images/vendor/fontawesome/paint-brush-solid-white.svg){: width="20px"}=_sonar_cognitive_complexity_

> If you want more information what these names mean you can look at the [metrics section]({{site.baseurl}}{% link _docs/05-02-metrics.md %}).
>
> Please also be aware that the metrics in the dropdown are tied to the metric sources and the [ccsh tool]({{site.baseurl}}{% link _docs/05-03-ccsh.md %}) you used to generate said map.

You can change the representation in the _metrics bar_ and explore your code from different perspectives. For example, try setting the metrics mentioned above and then hovering your mouse over the most complex file in the code: the biggest, tallest, reddest building. You can see its file path and metrics in the top of the screen. This building might need improving.

Then change the color to _line_coverage_. Depending on what map you use, the buildings might look a bit red. That means they have a coverage close to 100%. You should open the color metric details and invert the color, so 100% line coverage is mapped to green again. While you are changing the details you might also decide to make the positive buildings use the white color instead of green, to reduce the visual noise and be able to focus on the buildings that need improving. Now think about the most complex building you found earlier, is it still red because it also has a low code coverage? If it is that gives you another indication that it needs improvement.

If it's green then you could change the color metric to _number_of_authors_ (if that metric is available in your map). A building that is complex, has low code coverage and only one author can be very problematic, because that code is only known by one person. On the other hand a building that has many authors can be problematic because it is now a coordination bottleneck: apparently everyone needs to modify that file.

This is just one example how you can explore your source code. Once you get a feel for the metrics, you might decide to combine different metrics. We usually leave the size metric locked to the _real lines of code_ metric though. That ensures the buildings are always in the same place, even when you change height and color.

Depending on the importers you used to generate your map you might also be able to view the edges between buildings. Edges show connections between your files and can take many forms. For example the metric _pairingRate_ tells you that when file A is committed, file B is also in that same commit. Now there is an edge between building A and building B, an unidirectional relationship. But file B might also show up in commits that don't include file A. No edge between building B and building A then.

You can see the building with most edges because purple edges leave and cyan edges enter. When you hover over a building with edges you can see exactly where they lead or are coming from. Edges that stretch over the whole map might indicate a problem because buildings that are connected should usually be put in the same package in your source code.

[Read on]({{site.baseurl}}{% link _docs/06-02-user-controls.md %}) to see an overview of the user controls available.

> Icons by [fontawesome](https://fontawesome.com/icons?d=gallery&q=arrows)
