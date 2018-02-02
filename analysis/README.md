# CodeCharta analysis

[![Build Status](https://secure.travis-ci.org/)](https://travis-ci.org/)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## CodeCharta analysis tools

CodeCharta analysis tools generally follow the pipes and filters architecture principle.

### Importer

Components that import data from an external source, e.g. SonarQube, and generate visualisation data.

| Source        | Project                                                 |
| ---           | ---                                                     |
| generic CSV   | [CSVImporter](import/CSVImporter/README.md)             |
| SCM log       | [SCMLogParser](import/SCMLogParser/README.md)            |
| SonarQube     | [SonarImporter](import/SonarImporter/README.md)         |
| SourceMonitor | [SourceMonitorImporter](import/SourceMonitorImporter/README.md) |

### Filter

Components that take visualisation data and modifies them.

| Name                                        | Description                 |
| ---                                         | ---                         |
| [MergeFilter](filter/MergeFilter/README.md) | merges multiple json files  |

### Additional Tools

| Name                                             | Description                  |
| ---                                              | ---                          |
| [ValidationTool](tools/ValidationTool/README.md) | validates a given json file |

## Requirements

- Bash or similar
- JRE 8 (Oracle Java or OpenJDK)

## Installation via npm

This installs all binaries to run the analysis. Java 8 is required.

`npm install -g codecharta-analysis`

To run it you can call `ccsh`  

## Installation

- Download / build package
- Unzip / untar package in desired destination folder (named CC_INSTALL_DIR)
- In bash:
> ./bin/ccsh -h

## Build

Via gradle:

> ./gradlew :distTar

## Test

- Unit tests:

> ./gradlew :test

- Integration tests:

> ./gradlew integrationTest
