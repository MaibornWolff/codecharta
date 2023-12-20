# Developer Quick Start Guide

---

CodeCharta consists of two separate parts:

-   The [analysis](https://maibornwolff.github.io/codecharta/docs/analysis/) which is a cli-tool that generates a `.cc.json file` file.
-   The [visualization](https://maibornwolff.github.io/codecharta/docs/visualization/) that consumes said file and visualises it in form of a tree map. The visualization has both a desktop client and a [web version](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json.gz&file=codecharta_analysis.cc.json.gz).

Both parts are in active development, meaning as a developer you can contribute to both.

# Requirements

To work on CodeCharta, please ensure your system includes:

-   Git
-   Java >= 11
-   Node >= 18

# Install guide

To start contributing to codecharta, first clone the [GitHub repository](https://github.com/MaibornWolff/codecharta) and navigate into it

```bash
# clone the repository
git clone git@github.com:MaibornWolff/codecharta.git
# naviagte into the created folder
cd codecharta
# install npm dependencies
npm i
```

CodeCharta consists of the two parts analysis and visualization which can be installed and used separately.
Meaning, it is not necessary to have the visualization installed when only working on the analysis part of codecharta and vice versa.
Therefore, this guide includes separate installation guides for both parts.

## Install Analysis

```bash
# change into analysis sub-folder
cd analysis
# build the program from source (result is bundled in .tar and .zip files)
./gradlew build
# installs the built distribution
./gradlew installDist
```

With this, the cli-tool is installed. When running `ccsh` however, we still get an error as the command is not accessible. There are three options how it can be used:
There are three ways in which the cli-tool can be used:

-   Navigate into the folder where the installed shell and batch files are created (`analysis/build/install/codecharta-analysis/bin`) and executing commands from there
-   Call the ccsh with the relative path to the current location. E.g. in the analysis folder with `./build/install/codecharta-analysis/bin/ccsh`
-   Add the installed shell or batch files to the path to make it globally accessible. This can be done by adding the shell or batch file to the path of your terminal.
    As this process is specific to each terminal, we cannot include instructions here, but searching for "{name-of-console} add to path" should result in fitting instructions.
    This solution is recommended, as it is the most effort in the short term but the most comfortable in the long run.

## Install Visualisation

As the visualisation has both a desktop client and a web-version, we provide instructions on how to install both.

### Web version

This option will be the more comfortable choice for development, as the program is started as localhost and changes are quickly visible.

```bash
# change into visualisation sub-folder
cd visualization
# install visualisation specific npm dependencies
npm i
# build and start the web-version as localhost
npm run dev
# this should open a browser window with the web version
```

### Desktop client

We also provide CodeCharta as a standalone desktop app with versions for windows, mac and linux. A local version for your system can be built using the following commands:

```bash
# change into visualisation sub-folder
cd visualization
# install visualisation specific npm dependencies
npm i
# build the standalone app from source
npm run build
# start the built standalone client
npm run start
```

You can also directly build a distributable package (.zip) of the standalone client for your system.
For more information, see the 'Package' section of the [visualisation readme](https://github.com/MaibornWolff/codecharta/tree/main/visualization#package).

# IntelliJ setup

We mainly use IntelliJ for our development. The project generally works right away, except for two issues that sometimes occur:

-   Sometimes when opening the main codecharta folder, the analysis part does not get detected as a module. To solve this, directly open the analysis folder.
-   When working on visualization, IntelliJ does not correctly detect our test-suite. To execute tests using the build in runners,
    it is necessary to adjust the Jest-Configuration:
    -   First select 'Edit...' from the 'More actions' menu next to the Runner icon
    -   Inside there, select 'Edit configuration templates...' at the bottom left
    -   Select 'Jest' and set 'jestUnit.config.json' as the configuration file as well as adding the Jest option '--env=jsdom'
    -   After clicking apply, IntelliJ should e able to execute all visualisation tests

# Testing

The analysis and visualisation parts are tested separately with different tools. \
For the analysis, we use gradle for testing, linting and formatting. More information is available [here](https://maibornwolff.github.io/codecharta/docs/new-to-code-analysis/#testing).\
For the visualisation, we utilize Jest and puppeteer for unit- and e2e-tests. To run all unit tests, execute `npm test`. More information about e2e-tests can be found [here](https://maibornwolff.github.io/codecharta/dev-guide/e2e-testing-with-puppeteer/).

When opening a pull requests, all tests are executed automatically using GitHub-actions and a branch can only be merged if all tests are successful. However, it is highly recommended to test changes before pushing them!

# Documentation structure

Our documentation is generally split between user docs and developer docs.
The user docs can be found in the [GitHub-pages](https://maibornwolff.github.io/codecharta/docs/quick-start-guide/),
while the developer docs can be found inside the [GitHub repository](https://github.com/MaibornWolff/codecharta) in several README files.
Each relevant part of the project that requires explanation includes a README file.
If this is not the case, feel free to open an issue, so it will be added.
Additionally, for the analysis, the ccsh-command, as well as every parser includes a `-h` flag to show further information about its usages.
For more information about the CodeChart Shell and individual parsers, click [here](https://maibornwolff.github.io/codecharta/docs/ccsh/).

# Contributing

If you are interested in contributing, please check out [CONTRIBUTING.md](https://github.com/MaibornWolff/codecharta/blob/main/CONTRIBUTING.md) before working on existing or creating new issues or pull requests.
If you want to know more about the codebase, useful starting points are:
[New to this Code?](https://maibornwolff.github.io/codecharta/docs/new-to-code/),
[New To Analysis?](https://maibornwolff.github.io/codecharta/docs/new-to-code-analysis/) and
[New to Visualization?](https://maibornwolff.github.io/codecharta/docs/new-to-code-visualization/).
