# CodeCharta analysis

[![Quality Gate Status For Analysis](https://sonarcloud.io/api/project_badges/measure?project=maibornwolff-gmbh_codecharta_analysis&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=maibornwolff-gmbh_codecharta_analysis)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## CodeCharta analysis tools

CodeCharta analysis tools generally follow the pipes and filters architecture principle.

### Importer

Components that import data from an external source, e.g. SonarQube, and generate visualisation data.

| Source             | Project                                               |
| ------------------ | ----------------------------------------------------- |
| CodeMaat CSV       | [CodeMaatImporter](import/CodeMaatImporter/README.md) |
| generic CSV        | [CSVImporter](import/CSVImporter/README.md)           |
| SVN log            | [SVNLogParser](import/SVNLogParser/README.md)         |
| Git log            | [GitLogParser](import/GitLogParser/README.md)         |
| SonarQube          | [SonarImporter](import/SonarImporter/README.md)       |
| Source Code        | [SourceCodeParser](import/SourceCodeParser/README.md) |
| SourceMonitor CSV  | [SourceMonitorImporter](import/CSVImporter/README.md) |
| Source Code / Text | [RawTextParser](parser/RawTextParser/README.md)       |
| Tokei              | [TokeiImporter](import/TokeiImporter/README.md)       |

### Filter

Components that take visualisation data and modifies them.

| Name                                                    | Description                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [MergeFilter](filter/MergeFilter/README.md)             | merges multiple json files                                                                         |
| [EdgeFilter](filter/EdgeFilter/README.md)               | aggregates edge-attributes of each appropriate node and inserts them into the nodes attribute-list |
| [StructureModifier](filter/StructureModifier/README.md) | modifies the structure of .cc.json files                                                           |

### Exporter

Components that export data from visualisation data to other formats.

| Target             | Project                                     |
| ------------------ | ------------------------------------------- |
| CSV (experimental) | [CSVExporter](export/CSVExporter/README.md) |

### Additional Tools

| Name                                             | Description                 |
| ------------------------------------------------ | --------------------------- |
| [ValidationTool](tools/ValidationTool/README.md) | validates a given json file |

## Requirements

-   Bash or similar
-   JRE 8-11 (Oracle Java or OpenJDK)

# Installation

You can start with **Codecharta Analysis** on multiple ways:

-   Installation as a [npm package](#installation-via-npm) (Recommended)
-   Use our [Docker Image](#installation-via-docker) to run the analysis in a container
-   Use [docker-compose]({{site.baseurl}}{% link _docs/01-04-docker-containers.md %}) to run this with all other containers
-   Download the SourceCode and [build it yourself](#manual-installation)

## Installation via npm

This installs all binaries to run the analysis. Java 11 is recommended, while Java 8 is still supported.

`npm install -g codecharta-analysis`

To run it you can call `ccsh`

## Installation via Docker

You can use this via docker compose or as a standalone container. This section will deal with how to use the analysis as a standalone container. For information on how to use this with docker compose, please check out [Docker Getting Started]({{site.baseurl}}{% link _docs/01-04-docker-containers.md %})
We assume that you already installed docker, if not, you have to do that before!

To containerize the analysis, please follow the below listed steps.

-   Navigate into the directory you want to analyse with CodeCharta. There are multiple ways to use the docker image:
    1. Start the docker container and a bash shell in it with `docker run -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis bash` (for that to work you have to make sure bash is added to your PATH). This runs the image and mounts the current directory and sets it as the working directory in the image. You can now use the CodeCharta shell or any other of the installed tools via the command line.
    2. Start the docker container and directly use some command (like the ccsh): `docker run -it -v $(pwd):$(pwd) -w $(pwd) codecharta-analysis ccsh`. This starts the Ccsh without any commands, which will open the parser suggestions.
    3. Start the docker container and directly use a specific parser: `docker run -it -v $(pwd):$(pwd) -w $(pwd) codecharta-analysis ccsh rawtextparser .`. This starts the RawTextParser in the current working directory in a container.
-   After analysing, you can copy any results with `docker cp codecharta-analysis:/root/fileName.cc.json fileName.cc.json` to your current working directory (replace `/root/` with correct path if file is not in root in container)

## Manual Installation

-   Download / build package
-   Unzip / untar package in desired destination folder (named CC_INSTALL_DIR)
-   In bash:
    > ./bin/ccsh -h
-   Activate Bash (TAB) Autocompletion for ccsh command:
    > source <(./bin/ccsh generate-completion)
    -   Enter `ccsh` and press `TAB` to see available commands
    -   Enter `ccsh <ANY-COMMAND> -` and press `TAB` to see available parameters

# Other

## Build

Via gradle:

> ./gradlew distTar

## Test

-   Unit tests:

> ./gradlew test

-   Integration tests:

> ./gradlew integrationTest

## Code Style

In order to keep the code style consistent, an XML-file containing the settings used for this project can be found in `intellij-resources`.

Please import these settings in `File > Settings > Editor > Code Style`, and make sure you have ticked the box to reformat code before committing.

## License

Some parts of CodeCharta use the [SonarJava library](https://github.com/SonarSource/sonar-java/), which is licensed under the GNU Lesser General Public Library, version 3.
