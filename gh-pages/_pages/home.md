---
layout: splash
permalink: /
header:
  overlay_image: /assets/images/CC-Home.png
  actions:
    - label: "<i class='fas fa-fw fa-link'></i> Explore Web Studio"
      url: "https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json"
    - label: "<i class='fas fa-fw fa-link'></i> Quick Start"
      url: "/docs/quick-start-guide/"
excerpt: >
  Combine and communicate code metrics. <br />
  <small><a href="https://github.com/MaibornWolff/codecharta/releases/latest">Latest releases</a></small>
feature_row:
  - title: "Combine any Metric"
    excerpt: "Combine metrics from Sonar, Git, your source code and many more."
    url: "/docs/analysis/"
    btn_class: "btn--primary"
    btn_label: "Learn more"
  - title: "Add your own Metrics"
    excerpt: "Metrics in Csv format can even be added without writing code."
    url: "/docs/custom-metrics/"
    btn_class: "btn--primary"
    btn_label: "Learn more"
  - title: "Big Picture"
    excerpt: "Understand the big picture, then zoom in into hotspots."
    url: "/docs/visualization/"
    btn_class: "btn--primary"
    btn_label: "Learn more"
---

**How do you communicate software quality?** CodeCharta is a tool collection that allows you to import and **combine** metrics from various sources like SonarQube, Svn, Git or directly from your source code. It's not tied to a specific programming language and there are several [importers]({{site.baseurl}}{% link _docs/05-03-ccsh.md %}) already provided that you can use to gain metrics. CodeCharta also provides a tool to [visualize]({{site.baseurl}}{% link _docs/06-01-visualization.md %}) these metrics and make the quality of your code base **tangible**, which you in turn can use to gain insights and **communicate with your stakeholders**.

## CodeCharta Design Goals

{% include feature_row %}
