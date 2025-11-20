---
permalink: /docs/overview/getting-started
title: "Getting started"
excerpt: "Let's get started!"
redirect_from:
  - /docs/overview/getting-started/

toc: true
toc_sticky: true
toc_label: "Jump to Section"

gallery:
  - url: "/assets/images/docs/overview/import.png"
    image_path: "/assets/images/docs/overview/import.png"
    title: "Web Studio"
---

# [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true)

Before you start doing anything, you should have a look at our [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true) you can try everything out yourself. You could also have a look at our [User Controls]({{site.docs_visualization}}/user-controls) to help you navigate.

You can also run the Web Studio offline by running:

```bash
docker run -p 9000:80 codecharta/codecharta-visualization
```
This will automatically pull the docker container and start the Web Studio under `localhost:9000`

For more details about our docker images, see [Docker Containers]({{site.docs_overview/dockerized}}).

# CCSH (CodeCharta Shell)

After trying out the WebStudio, you may be wondering how to get your own project metrics into CodeCharta. You can either download and install our pre-build [CCSH (CodeCharta Shell)]({{site.docs_analysis}}/codecharta-shell) or use our provided docker container. Both can be used to generate the metrics that can later be imported into our [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true).

## Docker

Using the CodeCharta Shell docker container, a simple analysis can be analysis can be executed in one command:
```bash
docker run -v .:/mnt/src codecharta/codecharta-analysis bash -c 'git config --global --add safe.directory /mnt/src; cd /mnt/src/; simplecc.sh create tutorial'
```
Simply run this command in the directory you want to analyze. It will automatically pull the docker container and start the `simplecc.sh` script, which uses a combination of different analyzers to generate a well-rounded code map.

For more details about our docker images, see [Docker Containers]({{site.docs_overview/dockerized}})

## Installation

We are using npm to install our CCSH (CodeCharta Shell) and you also need the following requirements:

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

Now you need to decide where you want to get your metrics from. Every parser and importer has their own metrics that can be exported.
Checkout [Analysis]({{site.docs_overview}}/analysis) to see an overview.

In this example we will use our [Unified Parser]({{site.docs_parser}}/unified) as it works on nearly every format.

```bash
# -o output file
# <path> enter a path to your project or a file you want to analyze
$ ccsh unifiedparser -o=tutorial <path/to/your/project>
# done :)!
```

This generates a **tutorial.cc.json.gz**, which can be imported in our [Web Studio](https://codecharta.com/visualization/app/index.html?file=codecharta_visualization.cc.json.gz&file=codecharta_analysis.cc.json.gz&area=rloc&height=sonar_complexity&color=sonar_complexity&edge=avgCommits&currentFilesAreSampleFiles=true).

Just click on the top left on import and open your **tutorial.cc.json.gz**. You are now able to explore your code base to your hearts content.
{% include gallery %}
