# CodeCharta analysis

[![Build Status](https://secure.travis-ci.org/)](https://travis-ci.org/)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## CodeCharta analysis tools

CodeCharta analysis tools generally follow the pipes and filters architecture principle.

### Importer

Components that import data from an external source, e.g. SonarQube, and generate visualisation data.

| Source                    | Project                                                   |
| ------------------------- | --------------------------------------------------------- |
| CodeMaat CSV              | [CodeMaatImporter](import/CodeMaatImporter/README.md)     |
| Crococosmo                | [CrococosmoImporter](import/CrococosmoImporter/README.md) |
| generic CSV               | [CSVImporter](import/CSVImporter/README.md)               |
| Jasome                    | [JasomeImporter](import/JasomeImporter/README.md)         |
| SCITools' Understand CSV  | [UnderstandImporter](import/UnderstandImporter/README.md) |
| SCM log                   | [SCMLogParser](import/SCMLogParser/README.md)             |
| SCM log v2 (experimental) | [SCMLogParserV2](import/SCMLogParserV2/README.md)         |
| SonarQube                 | [SonarImporter](import/SonarImporter/README.md)           |
| Source Code               | [SourceCodeParser](import/SourceCodeParser/README.md)     |
| SourceMonitor CSV         | [SourceMonitorImporter](import/CSVImporter/README.md)     |
| Source Code / Text        | [RawTextParser](parser/RawTextParser/README.md)           |
| Tokei                     | [TokeiImporter](import/TokeiImporter/README.md)           |

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

## Installation via npm

This installs all binaries to run the analysis. Java 11 is recommended, while Java 8 is still supported.

`npm install -g codecharta-analysis`

To run it you can call `ccsh`

## Installation

-   Download / build package
-   Unzip / untar package in desired destination folder (named CC_INSTALL_DIR)
-   In bash:
    > ./bin/ccsh -h
-   Activate Bash (TAB) Autocompletion for ccsh command:
    > source <(./bin/ccsh generate-completion)
    -   Enter `ccsh` and press `TAB` to see available commands
    -   Enter `ccsh <ANY-COMMAND> -` and press `TAB` to see available parameters

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
