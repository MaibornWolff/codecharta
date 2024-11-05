---
permalink: /docs/overview/first-steps
title: "First Steps"
excerpt: "Let's get started!"

toc: true
toc_sticky: true
toc_label: "Jump to Section"

gallery:
  - url: "/assets/images/docs/overview/import.png"
    image_path: "/assets/images/docs/overview/import.png"
    title: "Web Studio"
---

# [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity)

Before you start doing anything, you should have a look at our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity) you can try everything out yourself. You could also have a look at our [User Controls]() to help you navigate.

# CCSH

After trying out the WebStudio, you may be wondering how to get your own project metrics into CodeCharta. You need to download our pre-build [CCSH (CodeCharta Shell)]({{site.baseurl}}{% link _docs/analysis/ccsh.md %}), which will generate the metrics that can later be imported into our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity).

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

Now you would need to decide where you want to get your metrics from. Every parser and importer has their own metrics that can be exported. Checkout [Analysis]({{site.baseurl}}{% link _docs/overview/analysis.md %}) to see an overview.

In this example we will use our [Raw Text Parser]({{site.baseurl}}{% link _docs/parser/raw-text.md%}) as it works on nearly every format.

```bash
# -o output file
# <path> enter a path to your project or a file you want to analyze
$ ccsh rawtextparser -o=tutorial <path/to/your/project>
# done :)!
```

This generates a tutorial.cc.json.gz, which can be imported in our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity).

Just click on the top left on import and open your tutorial.cc.json.gz. You are now able to explore your code base to your hearts content.
{% include gallery %}
