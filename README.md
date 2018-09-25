# CodeCharta 
[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=master)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

* [What is CodeCharta?](#what-is-codecharta)
* [Download](#download)
* [Feature request / Bug / Feedback](#feature-request--bug--feedback)
* [Further Information](#further-information)
* [Tool Information](#tool-information)

## What is CodeCharta?

CodeCharta is a beautiful tool for visualizing code as cities. It visualizes multiple code metrics using 3D tree maps and consists of two parts:

* [analysis](/analysis/README.md): Command-Line-Tool for generating visualization data. It includes some pre-defined importers for e.g. SonarQube, SourceMonitor, SCM log information, generic csv data, as well as a command to validate and merge multiple data files.
* [visualization](/visualization/README.md): GUI for visualizing code metrics given in json files, specified by [cc.json](/visualization/app/codeCharta/core/data/schema.json) using [json-schema v4](https://tools.ietf.org/html/draft-zyp-json-schema-04). 

![Screenshot of visualization](screenshot.png)

## Download

You can get the [latest version](https://github.com/MaibornWolff/codecharta/releases) of the analyzer and visualization or try the [online demo](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json) of the visualization.

### Install application for desktop usage with npm

* install visualization with `npm install codecharta-visualization -g`
* install analysis with `npm install codecharta-analysis -g`
* run visualization with `codecharta-visualization`
* run analysis with `ccsh`

### Install CodeCharta from GitHub

* Download the [latest release](https://github.com/MaibornWolff/codecharta/releases/latest) of CodeCharta (codecharta-analysis and codecharta-visualization)
* you should now have the analysis and visualization package 
* unpack both packages
* enter the codecharta-analysis/bin directory with your favorite console `./ccsh -h`

## Feature request / Bug / Feedback

Have a bug, a feature request or any question? Please [open a new issue](https://github.com/MaibornWolff/codecharta/issues/new). Feedback is always welcome.

## Further Information

* [Quickstart Guide](https://maibornwolff.github.io/codecharta/)
* [Coverage](https://maibornwolff.github.io/codecharta/visualization/coverage/lcov-report/)
* [Sonarqube Visualization](https://sonarcloud.io/dashboard?id=de.maibornwolff.codecharta%3Avisualization)
* [Sonarqube Analysis](https://sonarcloud.io/dashboard?id=de.maibornwolff.codecharta%3Aanalysis)
* [Wiki, including usage examples](https://github.com/MaibornWolff/codecharta/wiki)

## Tool Information

* [Releases](https://github.com/MaibornWolff/codecharta/releases)
* [Changelog](CHANGELOG.md)
* [Contributing](CONTRIBUTING.md)
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [License](LICENSE.md)
