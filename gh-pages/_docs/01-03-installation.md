---
permalink: /docs/installation/
title: "Installation"

toc: true
toc_label: "Jump to Section"
---

CodeCharta consists of the two parts analysis and visualization which can be installed and used separately. The analysis programm we can install is the Codecharta shell (ccsh). The visualization program is the desktop version of the [the web visualization]({{site.web_visualization_link}}).

We use npm to distribute [both](https://www.npmjs.com/package/codecharta-analysis) [programs](https://www.npmjs.com/package/codecharta-visualization) because it is very convenient and has a wide install base. Only the visualization uses node. The analysis is a command-line interface that requires a Java Virtual Machine (JVM). Please make sure that you have [Node](https://nodejs.org/en/) and npm installed as well as Java.

If you are on Windows we recommend installing Git and use the bundled Git Bash to make the scripts easily transferable.

# Global Install with npm (recommended)

## Analysis

```bash
# Install
npm i -g codecharta-analysis
# Explore ccsh
ccsh -h
# then explore a specific importer
ccsh sourcecodeparser -h
```

## Desktop Visualization

```bash
# Install
npm i -g codecharta-visualization
# and start
codecharta-visualization
```

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

# Docker Hub Install

The visualization is [published to Docker Hub](https://hub.docker.com/r/maibornwolff/codecharta-visualization).

## Visualization

```bash
# run visualization with
docker run -p 80:8080 maibornwolff/codecharta-visualization
```

# Github Release

Download the [latest release](https://github.com/MaibornWolff/codecharta/releases) of CodeCharta (codecharta-analysis and codecharta-visualization) and unpack them to a folder of your choice. The visualization bundles an operation system (OS)-specific runtime. Since the analysis runs on the JVM it only has a single `.tar`, no matter what OS you use.

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
