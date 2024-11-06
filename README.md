<style>
  .center {
    display:flex;
    justify-content:center;
    flex-direction: column;
    align-items: center;
    text-align:center;
    margin-bottom:10px;
  }
  .row-with-gaps {
    display:flex;
    gap: 5px;
  }
</style>

<div class="center" style="">
  <a href="https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true">
    <img src="https://raw.githubusercontent.com/maibornwolff/codecharta/main/logo/codecharta_logo.svg" alt="CodeCharta logo" width="200"/>
  </a>

  <p>
    Latest Release
    <br>
    Analysis <a href="https://github.com/MaibornWolff/codecharta/releases/tag/ana-1.128.0">1.128.0</a> | Visualization <a href="https://github.com/MaibornWolff/codecharta/releases/tag/vis-1.130.0">1.130.0</a>

[comment]: ##################################################################################
[comment]: <Ensure that the words 'latest release' are above the line with the links>
[comment]: ##################################################################################

  </p>

  <div class="row-with-gaps">
    <a href="https://github.com/MaibornWolff/codecharta/actions/workflows/release-analysis.yml">
      <img src="https://github.com/MaibornWolff/codecharta/actions/workflows/release-analysis.yml/badge.svg" alt="Release Analysis">
    </a>
    <a href="https://github.com/MaibornWolff/codecharta/actions/workflows/release-visualization.yml">
      <img src="https://github.com/MaibornWolff/codecharta/actions/workflows/release-visualization.yml/badge.svg" alt="Release Visualization">
    </a>
    <a href="https://sonarcloud.io/dashboard?id=maibornwolff-gmbh_codecharta_analysis">
      <img src="https://sonarcloud.io/api/project_badges/measure?project=maibornwolff-gmbh_codecharta_analysis&metric=alert_status" alt="Quality Gate Analysis"></a>
    <a href="https://sonarcloud.io/dashboard?id=maibornwolff-gmbh_codecharta_visualization">
      <img src="https://sonarcloud.io/api/project_badges/measure?project=maibornwolff-gmbh_codecharta_visualization&metric=alert_status" alt="Quality Gate Visualization">
    </a>
  </div>

  <div class="row-with-gaps">
    <a href="https://maibornwolff.github.io/codecharta/">Documentation</a> •
    <a href="#features">Features</a> •
    <a href="https://maibornwolff.github.io/codecharta/docs/quick-start-guide/">Quickstart</a> •
    <a href="#get-involved">Get Involved</a> •
    <a href="#links">Links</a>
  </div>
</div>

![Screenshot of visualization](screenshot.png)

## What is CodeCharta

Having trouble communicating the problems in your code base? Look no further, CodeCharta is able to visualise or even print your code base in 3D! While showing you lots of different metrics to help you decide what to tackle next. Without sharing your code! CodeCharta is an open source project mainly developed by [MaibornWolff](https://www.maibornwolff.de/en). You can find everything you need in our [Documentation](https://maibornwolff.github.io/codecharta/).

## Features

### [Analysis](https://maibornwolff.github.io/codecharta/docs/analysis/) with [CCSH(CodeCharta Shell)](https://maibornwolff.github.io/codecharta/docs/ccsh/)

Our analysis generates the data needed for our visualisation.
Various imports ready to import metrics from:

- [Sonar](https://maibornwolff.github.io/codecharta/docs/sonar-importer)
- [Tokei](https://maibornwolff.github.io/codecharta/docs/tokei-importer)
- [Code Maat](https://maibornwolff.github.io/codecharta/docs/codemaatimporter)
- [Source Monitor](https://maibornwolff.github.io/codecharta/docs/sourcemonitorimporter)
- [CSV](https://maibornwolff.github.io/codecharta/docs/csv-importer)

If you want to parse the data yourself, we have you covered with our 4 parsers:

- [Git Log](https://maibornwolff.github.io/codecharta/docs/git-log-parser)
- [SVN Log](https://maibornwolff.github.io/codecharta/docs/svn-log-parser)
- [Source Code](https://maibornwolff.github.io/codecharta/docs/source-code-parser)
- [Raw Text](https://maibornwolff.github.io/codecharta/docs/raw-text-parser)

Merge the different results of our parsers and importers together into one map!

Last but not least, our [CCSH(CodeCharta Shell)](https://maibornwolff.github.io/codecharta/docs/ccsh/) has all this functionality built in!

### [Visualisation](https://maibornwolff.github.io/codecharta/docs/visualization/)

- **Visualise metrics** imported and parsed by our analaysis as a **city-like map**
- Move freely around your code base
- **Files** are displayed as **buildings**, with **colors**, **area size**, and **height** representing **customizable metrics**.
- See **dependencies** with our **edge metrics**!
- Download your map as a 3D model to **print your code base**
- View at the delta between two maps! Allows you to **compare different points in time**!
- **Safe your settings** and **views** for later!

## Getting started

You can find our prefered way to get start under [Documentation - Quick Start Guide](https://maibornwolff.github.io/codecharta/docs/quick-start-guide/). But if you want to get started quickly, here are some ideas

### [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity)

Before you dive into CodeCharta, you can try out our [Web Studio](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz&currentFilesAreSampleFiles=true&area=rloc&height=sonar_complexity&color=sonar_complexity), which already includes two sample maps.

### [CCSH(CodeCharta Shell)](https://maibornwolff.github.io/codecharta/docs/ccsh/)

Try out our [CCSH(CodeCharta Shell)](https://maibornwolff.github.io/codecharta/docs/ccsh/)! To use CodeCharta you need the following installed on your system:

- Node **>= 20**
- Java **>= 11, <= 21**

```bash
# Install codecharta-analysis globally
$ npm i -g codecharta-analysis
# Clone the junit4 repository
$ git clone https://github.com/junit-team/junit4
# Parse sources with CodeCharta Shell
$ ccsh sourcecodeparser junit4 -p junit4 -o junit4.source.cc.json
# Now you can upload `junit4.source.cc.json` to CodeCharta Visualization
```

## Get Involved

Do you have a **bug**, **feature request**, or question? Please open a [a new issue](https://github.com/MaibornWolff/codecharta/issues/new). Feedback is always welcome.

Want **more information**? Check out our [documentation](https://maibornwolff.github.io/codecharta/) and [news](https://maibornwolff.github.io/codecharta/news/).

## Links

- [Documentation](https://maibornwolff.github.io/codecharta/)
- [Quickstart Guide](https://maibornwolff.github.io/codecharta/docs/quick-start-guide/)
- [Releases](https://github.com/MaibornWolff/codecharta/releases)
- [Coverage](https://maibornwolff.github.io/codecharta/visualization/coverage/lcov-report/)
- [Analysis - Changelog](analysis/CHANGELOG.md) | [Visualization - Changelog](visualization/CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE.md)

## License

MIT

---

Made with ❤ by [MaibornWolff](https://www.maibornwolff.de/en) &nbsp;&middot;&nbsp; GitHub [@MaibornWolff](https://github.com/maibornwolff)
