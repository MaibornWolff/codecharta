<h1 align="center">
  <br>
  <a href="https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz"><img src="https://raw.githubusercontent.com/maibornwolff/codecharta/main/logo/codecharta_logo.svg" alt="CodeCharta" width="200"/></a>
  <br>
  CodeCharta
  <br>
</h1>

<h4 align="center">a tool to help you visualize and understand code in 3D.</h4>

<p align="center">
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
</p>

<p align="center">
Latest Release: <br>
 Analysis <a href="https://github.com/MaibornWolff/codecharta/releases/tag/ana-1.127.0">1.127.0</a> | Visualization <a href="https://github.com/MaibornWolff/codecharta/releases/tag/vis-1.128.0">1.128.0</a>

[comment]: ##################################################################################
[comment]: <Ensure that the words 'latest release' are above the line with the links>
[comment]: ##################################################################################

</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#feedback">Feedback</a> •
  <a href="#further-information">Further Info</a> •
  <a href="#about-codecharta">About</a>
</p>

![Screenshot of visualization](screenshot.png)

## Key Features

- [CodeCharta Visualization](https://maibornwolff.github.io/codecharta/docs/visualization/):

  - CC visualizes code bases as 3D cities, so that you can understand it - view the [Web Demo](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz).
  - It uses code metrics from `.cc.json` files.
  - The imported files are validated using JSON Schema as defined in [generatedSchema.json](/visualization/app/codeCharta/util/generatedSchema.json).
  - You can change the way the file is displayed and save and later load it as a [Custom View](https://maibornwolff.github.io/codecharta/docs/custom-view/).

- [CodeCharta Analysis](https://maibornwolff.github.io/codecharta/docs/analysis/):
  - CC Analysis is used to calculate or to import metrics from third party tools for a code base.
  - It generates `.cc.json` files for CC Visualization through a Command-Line-Tool.
  - It includes some pre-defined importers for e.g. [SonarQube](https://maibornwolff.github.io/codecharta/docs/sonar-importer), [SourceMonitor](https://maibornwolff.github.io/codecharta/docs/sourcemonitorimporter), [Git](https://maibornwolff.github.io/codecharta/docs/git-log-parser), generic [CSV](https://maibornwolff.github.io/codecharta/docs/csv-importer) data
  - It also includes commands to [validate]() and [merge]() multiple `.cc.json` files.

## Requirements

For using CodeCharta the following needs to be installed on your system:

- Node >= 20
- Java >= 11, <= 21

## How To Use

### How to use **Visualization**?

- **Online:** You can try the [web visualization](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json&file=codecharta_analysis.cc.json) without any installation and explore the CodeCharta code (shown by default).
- **Local:** See [here](visualization/README.md).

### How to use **Analysis**?

- Analysis is split into different parsers that generate `.cc.json` files. To run these parsers you need the [CodeCharta Shell](https://maibornwolff.github.io/codecharta/docs/ccsh/).

In this example we will generate a `.cc.json` from [JUnit4](https://github.com/junit-team/junit4) using the [Source Code Parser](https://maibornwolff.github.io/codecharta/docs/source-code-parser) (that parses java projects).

```bash
# Install codecharta-analysis globally
$ npm i -g codecharta-analysis
# Clone the junit4 repository
$ git clone https://github.com/junit-team/junit4
# Parse sources with CodeCharta Shell
$ ccsh sourcecodeparser junit4 -p junit4 -o junit4.source.cc.json
# Now you can upload `junit4.source.cc.json` to CodeCharta Visualization
```

> **Note**
> If you want to be guided through selecting the arguments. Just execute `ccsh` and you can run the parsers **interactively** with dialogs.

## Feedback

Have a **bug**, a **feature** request or any question? Please open [a new issue](https://github.com/MaibornWolff/codecharta/issues/new). Feedback is always welcome.

Want to have even **more information**? Please check our [documentation](https://maibornwolff.github.io/codecharta/) and [news](https://maibornwolff.github.io/codecharta/news/).

## Further Information

- [Docs](https://maibornwolff.github.io/codecharta/)
- [Quickstart Guide](https://maibornwolff.github.io/codecharta/docs/quick-start-guide/)
- [Coverage](https://maibornwolff.github.io/codecharta/visualization/coverage/lcov-report/)
- [Sonarqube Visualization](https://sonarcloud.io/project/overview?id=maibornwolff-gmbh_codecharta_visualization)
- [Sonarqube Analysis](https://sonarcloud.io/project/overview?id=maibornwolff-gmbh_codecharta_analysis)

## About CodeCharta

- [Releases](https://github.com/MaibornWolff/codecharta/releases)
- [Analysis - Changelog](analysis/CHANGELOG.md) | [Visualization - Changelog](visualization/CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE.md)

## License

MIT

---

> [maibornwolff.de](https://www.maibornwolff.de) &nbsp;&middot;&nbsp;
> GitHub [@MaibornWolff](https://github.com/maibornwolff)
