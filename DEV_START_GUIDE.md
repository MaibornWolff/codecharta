# Developer Quick Start Guide

---

CodeCharta consists of two separate parts:

-   The [analysis](https://maibornwolff.github.io/codecharta/docs/analysis/) which is a cli-tool that generates a `.cc.json file` file.
-   The [visualization](https://maibornwolff.github.io/codecharta/docs/visualization/) that consumes said file and visualises it in form of a tree map. The visualization has both a desktop client and a [web version]({{site.web_visualization_link}}).

Both parts are in active development, meaning as a developer you can contribute to both.

# Requirements

To work on CodeCharta, please ensure your system includes:

-   Git
-   Java >= 11
-   Node >= 16

# Install guide

To start contributing to codecharta, first clone the [GitHub repository](https://github.com/MaibornWolff/codecharta) and navigate into it

```bash
# clone the repository
git clone https://github.com/MaibornWolff/codecharta.git
# naviagte into the created folder
cd codecharta
```

CodeCharta consists of the two parts analysis and visualization which can be installed and used separately.
Meaning, it is not necessary to have the visualization installed when only working on the analysis part of codecharta and vice versa.
Therefore, this guide includes separate installation guides for both parts.

## Install Analysis

```bash
# change into analysis sub-folder
cd analysis
# install npm dependencies
npm i
# build the program from source (bundled in .tar and .zip files)
./gradlew build
# installs the built distribution
./gradlew installDist
```

With this, the cli-tool is installed. When running `ccsh` however, we still get an error as the command is not accessible. There are three options how it can be used:
There are three ways in which the cli- tool can be used:

-   Navigate into the folder where the installed shell and batch files are created (`analysis/build/install/codecharta-analysis/bin`) and executing commands from there
-   Call the ccsh with the relative path to the current location. E.g. in the analysis folder with `./build/install/codecharta-analysis/bin/ccsh`
-   Add the installed shell or batch files to the path to make it globally accessible. This is done by `...` on windows and `...` on unix systems.
    This solution is the most effort in the short term but the most comfortable in the long run.

## Install Visualisation

[make part on how to build/start dev server meaning the web version] -> von visualisation readme klauen
[make part on how to build the visualisation desktop app] -> auch von vis. readme -> einfach verlinken oder explizit hier nochmal???

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
