---
permalink: /docs/quick-start-guide/
title: "Quick-Start Guide"
excerpt: "How to quickly install and setup CodeCharta."

toc: true
toc_label: "Jump to Section"
---

CodeCharta consists of two separate parts: [analysis]({% link _docs/05-01-analysis.md %}) that generates a `.cc.json` file and [visualization]({% link _docs/06-01-visualization.md %}) that consumes said file.

> Please note that CodeCharta only runs on your client. No `.cc.json` that you analyze or visualize will ever leave your computer unless you distribute it yourself.

You can [try the web visualization]({{site.web_visualization_link}}) immediately and explore CodeCharta Code in CodeCharta. No downloads necessary, though we do provide a [desktop client]({% link _docs/01-03-installation.md %}) for your convenience. The visualization interface is explained [here]({% link _docs/06-01-visualization.md %}) and if you want to explore another code base than the default one, you can use one of the files from the [showcase]({% link _pages/showcase.md %}).

However, if you want to **generate your own** `.cc.json`, you should read this guide first.

## Prerequisites

Please make sure that you have:

- Java installed
- [Node](https://nodejs.org/en/) and npm installed
- CodeCharta installed

There are several ways to [install CodeCharta]({% link _docs/01-03-installation.md %}). For this tutorial we'll assume you installed it globally via npm:

```bash
npm i -g codecharta-analysis
npm i -g codecharta-visualization
```

## 5 min Java Metrics Quickstart

You are free to use your own java code base if you want. In this example we'll assume you picked the [Junit4 code base](https://github.com/junit-team/junit4) because it's fast to analyze.

```bash
# Download code base of your choice
git clone https://github.com/junit-team/junit4
# parse sources
ccsh sourcecodeparser junit4 -p junit4 -o junit4.source.cc.json
# done :)
```

The generated file can be opened in the web or the desktop client:

```bash
# start visualization and open the generated file
# might require sudo, depending on where you install global npm modules
codecharta-visualization
```

## 5 min Sonar Metrics Quickstart

For this example we'll assume you have a [Sonar](https://www.sonarqube.org/) installation running.

```bash

```

The generated file can be opened in the web or the desktop client:

```bash
# start visualization and open the generated file
# might require sudo, depending on where you install global npm modules
codecharta-visualization
```

## 5 min Custom Metrics Quickstart

Csv importer

## 5 min Generic Metrics Quickstart

Please make sure you have [Tokei](https://github.com/XAMPPRocky/tokei#installation) installed.

```bash
# Download code base of your choice
git clone https://github.com/apache/httpd.git
# Parse code with tokei
cd httpd; tokei -o json . > ../httpd.tokei.json; cd ..
# Parse sources
ccsh tokeiimporter httpd.tokei.json -p httpd -o httpd.tokei.cc.json
# Done :)
```

The generated file can be opened in the web or the desktop client:

```bash
# start visualization and open the generated file
# might require sudo, depending on where you install global npm modules
codecharta-visualization
```

## 5+2 min Combine Metrics Quickstart

Please make sure you have [Git](https://git-scm.com/downloads) installed and that you have completed one of the previous quickstarts. Otherwise you won't have a `.cc.json` to combine with git metrics.

```bash
# Generate <project>.git.log
cd junit4; git log --numstat --raw --topo-order > ../junit4.git.log; cd ..
# Parse git.log
ccsh scmlogparser junit4.git.log -p junit4 -o junit4.git.cc.json --input-format GIT_LOG_NUMSTAT_RAW
```

Now you have two files that need to be merged: `<project>.source.cc.json` and `<project>.git.cc.json`. Before you merge them you should compare their structure with `ccsh modify`. A simple structural comparison is to check that the source.cc.json has a folder src directly under root and the git.cc.json has the same folder also under root. It's ok if the structure does not match exactly because `ccsh merge` will create the union of both files.

```bash
# Print the first level of the <project>.source.cc.json
ccsh modify junit4.source.cc.json -p 1
# Print the first level of the <project>.git.cc.json
ccsh modify junit4.git.cc.json -p 1
# Use --moveFrom and --moveTo or --setRoot to correct wrong structure
```

After making sure the structure matches you can merge the files.

```bash
ccsh merge junit4.source.cc.json junit4.git.cc.json -o junit4.cc.json
```

## CodeCharta in a Tweet Quickstart

`ccsh merge` is a powerful tool to merge multiple `.cc.json` files. Sometimes though you do not need the intermediate `.cc.json` files though and just want a combined file as fast as possible. For this purpose the most popular `ccsh` importers allow piping the `.cc.json` contents (see [importers documentation]({% link _docs/05-03-importers.md %})). This allows us to generate a combine `.cc.json` in less than 280 characters :)

```bash
npm i -g codecharta-analysis
cd junit4; git log --numstat --raw --topo-order > ../junit4.git.log; cd ..
ccsh sourcecodeparser junit4 -p junit4 \
  | ccsh scmlogparser junit4.git.log -p junit4 --input-format GIT_LOG_NUMSTAT_RAW \
  > junit4.cc.json
```

## Next Steps

CodeCharta is not limited to the importers mentioned here. The [analysis docs]({% link _docs/05-01-analysis.md %}) show the way. They are also worth checking out if you need some custom metrics. Furthermore you should read the [visualization docs]({% link _docs/06-01-visualization.md %}) to find out more about the available features.
