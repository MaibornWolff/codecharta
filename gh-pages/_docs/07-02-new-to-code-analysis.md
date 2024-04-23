---
permalink: /docs/new-to-code-analysis/
title: "New to Analysis?"
---

# Analysis

The analysis is a CLI to import, export or filter from all kind of resources.

### Importing the Project

Don't import the whole codecharta project to IntelliJ when working on the analysis. Simply import the analysis folder for that. IntelliJ might not able to identify it as a Gradle project otherwise.
A simple way to only import the analysis is to clone the whole repository and then only open the analysis subdirectory as a project in IntelliJ.

## Architecture, Design and Technology

### Definitions

#### Importer

-   Retrieves metrics from external sources, such as `SonarQube` and creates a `cc.json`.

#### Exporter

-   Consumes a cc.json and creates another format, such as CSV

#### Filter

-   Consumes a cc.json and creates another cc.json. A common use case is merging two cc.jsons

### Technologies

-   [Kotlin]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_2_pick_analysis_language.md %})
-   Gradle
-   [PicoCli]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_5_pick_analysis_cli_library.md %})
-   JUnit
-   Assertj
-   MockK
-   Gson
-   Sonar-Plugins to create our own parsers

### Concepts

-   [Pipes and filters architecture]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_4_decide_analysis_architecture.md %})
-   Shared nothing importers.

## Other

### Building

-   `gradlew.bat build` or `./gradlew build`
-   Navigate to `build/distributions` and unzip the zip-folder (or use the gradle task `installDist`)
-   Navigate to the `build/distributions/codecharta-analysis-VERSION/bin` and execute the ccsh

### Testing

-   Run `gradlew.bat test` or `./gradlew test`
-   Run `gradlew.bat integrationTest` or `./gradlew integrationTest`

The integration tests might fail on windows, because of a missing or unknown `sh` command.
To make it work, add the path to the Git `sh.exe` (which is normally placed here `C:\<path-to-git>\Git\bin`) to your PATH variable.

**If you want to run the JUnit tests with the IntelliJ-Runner, make sure to go to `File -> Settings ->Build,Execution, Deployment -> Build Tools -> Gradle` and select `Run test using: IntelliJ IDEA`**

### Linting/Formatting

-   `gradlew.bat ktLintCheck` or `./gradlew ktLintCheck` to check code style
-   `gradlew.bat ktLintFormat` or `./gradlew ktLintFormat` to format code

### Intellij Gradle Integration for Building and Testing

Multiple gradle tasks can be directly executed in the IntelliJ interface, this is especially useful when trying to build and test the project.
To do that open the gradle menu on the right side, and open the gradle tasks.
Under there you can find multiple useful tasks:

-   `clean`: Deletes previous builds.
-   `build`: Executes a formatting check, all unit tests and builds the project.
-   `installDist`: Unpacks the zip file generated from the build, so that you get an executable file for manual testing. Inside the unpacked folder, you will find a bin director containing an executable `ccsh` file.
-   `integrationTest`: Executes the integration tests specified in golden_test.sh

There are several more tasks defined, this is just an overview of the most commonly used tasks.
