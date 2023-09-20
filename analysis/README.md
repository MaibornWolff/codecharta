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
-   JRE 11+

# Installation

You can start with **Codecharta Analysis** on multiple ways:

-   Installation as a [npm package](#installation-via-npm) (Recommended)
-   Use our [Docker Image](#installation-via-docker) to run the analysis in a container
-   Use [docker-compose](https://maibornwolff.github.io/codecharta/docs/docker-containers/) to run the analysis in a complete environment with other needed tools like Sonar and a running CodeCharta Visualization instance to view your city map.
-   Download the SourceCode and [build it yourself](#manual-installation)

## Installation via npm

This installs all binaries to run the analysis. Java 11 is recommended, while Java 8 is still supported.

`npm install -g codecharta-analysis`

To run it you can call `ccsh`

## Installation via Docker

You can use Codecharta analysis in multiple ways. This section will deal with how to use the analysis as a standalone container. For information on how to use with docker compose, please check out our [docker compose documentation](https://maibornwolff.github.io/codecharta/docs/docker-containers/).
We assume that you already installed docker, if not, you have to do that before!

To containerize the analysis, please follow the below listed steps.

-   Navigate into the directory you want to analyse with CodeCharta. There are multiple ways to use the docker image:
    1. Start the docker container and a bash shell in it with `docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis bash`. This runs the image, names the container `codecharta-analysis`, mounts the current directory and sets it as the working directory of your container. You can now use the codecharta shell or any other of the tools installed in the container via the command line.
    2. Start the docker container and directly use some command (like the ccsh): `docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis ccsh`. This starts the Ccsh without any commands, which will open an interactive codecharta shell that will guide you through the parsing/analyzing process. The working directory of your Terminal will be used as the working directory of the container.
    3. Start the docker container and directly use a specific parser: `docker run --name codecharta-analysis -it -v $(pwd):$(pwd) -w $(pwd) codecharta/codecharta-analysis ccsh rawtextparser .`. This starts the RawTextParser in the current working directory in a container.
-   After executing the run command once, you can repeat the same docker configuration with `docker start codecharta-analysis` or you have to change the name or delete the old container if you want to `docker run` a different configuration.
-   After analysing, you can copy any results with `docker cp codecharta-analysis:/your/path/fileName.cc.json fileName.cc.json` to your current working directory (replace `/your/path/` with correct path in container). If this does not work, make sure you assigned the name `codecharta-analysis` to your container, if not use the correct name or container id.

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
