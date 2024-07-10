---
permalink: /docs/installation/
title: "Installation"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

CodeCharta consists of the two parts analysis and visualization which can be installed and used separately. The analysis programm is the Codecharta shell (ccsh) CLI-tool which is used to generate metrics from code in form of cc.json files. The visualization program is used to display these generated cc.json files. Note that desktop visualization has the same features as the [web visualization]({{site.web_visualization_link}}), meaning if you are planing to just use the visualization, everything can be done in the web version. The desktop program is only for convenience.

We use npm to distribute both programs ([analysis](https://www.npmjs.com/package/codecharta-analysis) and [visualisation](https://www.npmjs.com/package/codecharta-visualization)) because it is very convenient and has a wide install base. Only the visualization uses node. The analysis is a command-line interface that requires a Java Virtual Machine (JVM).

If you are on Windows we recommend installing Git and use the bundled Git Bash to make the scripts easily transferable.

This guide describes how to install CodeCharta locally. CodeCharta can also be installed via docker, which is covered [here]({{site.baseurl}}{% link _docs/01-04-docker-containers.md %}).

# Prerequisites

Installation of CodeCharta requires your system to have:

- Java (>=11, <=21)
- [Node](https://nodejs.org/en/) (>=18)
- npm (comes with Node)

# Global Install with npm (recommended)

Both parts of CodeCharta are essentially separate pieces of software, so they are also installed separately.

## Analysis

To install the analysis part of CodeCharta, simple open a terminal and enter:

```bash
npm i -g codecharta-analysis
```

To test if your installation was successful, you can run the following commands:

```bash
# Open the help of the main codecharta shell
ccsh -h
# Open the help for a specific parser (each parser has its own help)
ccsh sourcecodeparser -h
```

## Visualization (Desktop Version)

To install the visualisation part of CodeCharta, simple open a terminal and enter:

```bash
npm i -g codecharta-visualization
```

After sucessful installation, the desktop visualisation can be started with:

```bash
# and start
codecharta-visualization
```

> Note that the visualization also has a web version with the same features, which can be viewed [here]({{site.web_visualization_link}}).

# Local Install with npm

This installation option might be a good idea if you don't want to install CodeCharta globally and just try it out in a temporary folder (`mkdir tmp; cd tmp`).

## Analysis

```bash
# Download CodeCharta Shell into the current directory
npm i codecharta-analysis

# Do either A or B

## A) Create an executable link to ccsh in your local directory
ln -s ./node_modules/codecharta-analysis/public/bin/ccsh ccsh
## A) Explore ccsh
./ccsh -h

## B) Navigate to the codecharta-analysis folder
cd node_modules/codecharta-analysis
## B) Navigate to the binaries
cd public/bin
## B) Explore ccsh with
./ccsh -h
## B) or use the ccsh.bat
```

## Desktop Visualization

```bash
# Download CodeCharta Visualization into the current directory
npm i codecharta-visualization

# Do either A or B

## A) Create an executable link to the visualization in your local directory
ln -s ./node_modules/codecharta-visualization/cli.js ccstudio
## A) Start visualization
./ccstudio

## B) Navigate to the codecharta-visualization folder
cd node_modules/codecharta-visualization
## B) Start visualization with
npm start
```

# Docker Hub

Both the analysis and the visualization are published as repositories on docker hub ([analysis](https://hub.docker.com/r/codecharta/codecharta-analysis) & [visualization](https://hub.docker.com/r/codecharta/codecharta-visualization)). For users familiar with docker, this is the easiest way to install CodeCharta. For more information about our containers, refer to [docker containers]({{site.baseurl}}{% link _docs/01-04-docker-containers.md %}).

# Download from Github Release

Download the [latest release](https://github.com/MaibornWolff/codecharta/releases) of CodeCharta (codecharta-analysis and codecharta-visualization) and unpack them to a folder of your choice. The visualization bundles an operating system (OS)-specific runtime. Since the analysis runs on the JVM it only has a single `.tar`, no matter what OS you use. With this method, no additional installation is necessary. Both the ccsh and the visualization can be executed directly.

## Analysis

```bash
# Navigate to the codecharta-analysis folder
cd codecharta-analysis/bin
# Explore ccsh with
./ccsh
# or use the ccsh.bat
```

## Desktop Visualization

```bash
# Navigate to the codecharta-visualization folder
cd codecharta-visualization
# Start visualization with the provided executable
```

### MacOS

> If you get an error on MacOS because of a missing license, try this [apple support article](https://support.apple.com/en-gb/guide/mac-help/mh40616/12.0/mac/12.0). <br>
> You may be required to give the application executable rights.

If you are using an M1 or similar (arm64) architectures you might need to do additional steps, because the OS might flag the executable as damaged, if it is downloaded and from an unverified developer.

This can be solved by removing the 'downloaded' attributes from the OS by executing:

```bash
xattr -cr codecharta-visualization.app/
```

After this, you should be able to execute the visualization.
