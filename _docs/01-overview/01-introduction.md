---
permalink: /docs/overview/introduction
title: "Introduction"
redirect_from:
  - /docs/
  - /overview/

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

CodeCharta is a **communication tool** that helps you understand and manage complex code bases.
It turns metrics and your code base into a **city-like map** and makes your code **tangible**! A map where you can move around and find hotspots where your team has always had problems.
So you can finally tackle the problems that have always been on your mind. But never talked about.

# Why did we develope CodeCharta?

CodeCharta was mainly developed by MaibornWolff to help us with our [Software Health Checks](https://www.maibornwolff.de/en/service/software-health-check/).
We needed something to help us find potential issues to discuss with customers or to show the management where their teams are struggling.
The latter has no connection or understanding of code at all, but CodeCharta makes it easy to understand and helps you map your
understanding of code onto a visual and understandable map.

# Different parts of CodeCharta

We split CodeCharta into two different parts. The CCSH(CodeCharta Shell) which is the base for extracting metrics and
our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity) which is there to visualize these metrics as a city like map.
From here you can move around, look at metrics and even 3D print them.

> Please note that CodeCharta runs only on your client. No metrics that you analyze or visualize will ever leave your computer unless you
> distribute it yourself.

# Getting started

## Try our Web Studio

You can use
our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity)
to move around and check out our example maps that are already in place.

## Installation

To install our [CodeCharta Shell]({{site.docs_overview}}/analysis), simply install it via npm:

### Requirements

- Node **>= 20**
- Java **>= 11**

```bash
# Install codecharta-analysis globally
$ npm i -g codecharta-analysis
# Check if installation was complete. Some terminals have to be restarted
$ ccsh -h
# done :)!
```

If you want to analyze your own project. [Getting Started]({{site.docs_overview}}/getting-started) is a great place to start.
