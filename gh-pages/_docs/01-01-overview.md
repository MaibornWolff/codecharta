---
permalink: /docs/overview/
title: "User Documentation"
excerpt: "Overview of all sections of user docs."

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

Welcome to the user documentation of CodeCharta!

This page will give you an overview over all major aspects of the programs documentation.
As CodeCharta essentially consists of two projects (analysis and visualisation), parts of the documentation are also split between them.

> _Note: This documentation explains how to **use** CodeCharta. If you want to **develop** on it, our developer documentation can be found in our [GitHub repository](https://github.com/MaibornWolff/codecharta)._

# How to use CodeCharta

If you are completely new to CodeCharta, please read the [Quick-Start Guide]({{site.baseurl}}{% link _docs/01-02-quick-start-guide.md %}),
which explains the basics of it.

If you want to install CodeCharta, you will find a guide on how it can be installed locally [here]({{site.baseurl}}{% link _docs/01-03-installation.md %}).
We also provide docker containers for both parts of CodeCharta. Documentation for these containers can be found
[here]({{site.baseurl}}{% link _docs/01-04-docker-containers.md %}).

# Analysis-specific docs

Generally, the analysis part of CodeCharta is used to generate metrics from code. For more information refer to the [analysis page]({{site.baseurl}}{% link _docs/02-01-analysis.md %}). If you want to learn how to use the CLI-tool of the analysis, check out the [CodeCharta Shell page]({{site.baseurl}}{% link _docs/02-03-ccsh.md %}). The CodeCharta Shell consists of a variety of different tools, which each have their own page in "analysis tools". We also go into detail about our views on metrics [here]({{site.baseurl}}{% link _docs/02-02-metrics.md %}) and how you can use custom metrics in CodeCharta [here]({{site.baseurl}}{% link _docs/02-04-custom-metrics.md %}).

# Visualization-specific docs

The visualization part of CodeCharta displays code files as buildings of a city where their area, height and color represent different metrics. To quickly try it out, you can view the [web visualization]({{site.web_visualization_link}}). You can learn more about the visualization [here]({{site.baseurl}}{% link _docs/04-01-visualization.md %}) or view the controls [here]({{site.baseurl}}{% link _docs/04-02-user-controls.md %}). The visualization also includes three features that can make it easier to analyze code. These are [custom views]({{site.baseurl}}{% link _docs/04-03-custom-view.md %}), which serve as presets for display configurations, the [suspicious metrics]({{site.baseurl}}{% link _docs/04-04-suspicious-metrics.md %}), which highlight higher than usual metrics and the [risk profile]({{site.baseurl}}{% link _docs/04-05-risk-profile.md %}), which gives a quick overview of the codes' complexity.

# How-Tos

We provide several how to articles, that describe how to perform different tasks in CodeCharta.

For example, [this article]({{site.baseurl}}{% link _posts/how-to/2022-08-12-detailed-instruction-how-to-use-sonarqube.md %}) describes how to set up SonarQube and use our
sonar-importer to visualize the generate metrics.

Click [here]({{site.baseurl}}{% link _pages/category-archive.md %}#how-to) to see all available How-To articles.

# Changelog

Changelogs are kept separate for the Analysis and the Visualisation.

A list of analysis changelogs can be found [here]({{site.baseurl}}{% link _pages/category-archive.md %}#release-analysis)\
A list of visualisation changelogs can be found [here]({{site.baseurl}}{% link _pages/category-archive.md %}#release-visualization)\
A combined list of all changelogs sorted by date can be found [here]({{site.baseurl}}{% link _pages/category-archive.md %}#release)

# About

[Price]({{site.baseurl}}{% link _docs/05-04-price.md %})\
[Feedback]({{site.baseurl}}{% link _docs/05-03-feedback.md %})\
[License]({{site.baseurl}}{% link _docs/05-01-license.md %})
