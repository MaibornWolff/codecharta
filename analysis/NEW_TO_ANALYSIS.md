# New to Analysis

The analysis is a CLI to import, export or filter from all kind of resources.

### Importing the Project

Don't import the whole codecharta project to IntelliJ when working on the analysis. Simply import the analysis folder for that. IntelliJ might not able to identify it as a Gradle project otherwise.
A simple way to only import the analysis is to clone the whole repository and then only open the analysis subdirectory as a project in IntelliJ.

## Architecture, Design and Technology

### Definitions

#### Importer

- Retrieves metrics from external sources, such as `SonarQube` and creates a `cc.json`.

#### Exporter

- Consumes a cc.json and creates another format, such as CSV

#### Filter

- Consumes a cc.json and creates another cc.json. A common use case is merging two cc.jsons

### Technologies

- Kotlin
- Gradle
- PicoCli
- JUnit
- Assertj
- MockK
- Gson
- Sonar-Plugins to create our own parsers

### Concepts

- Pipes and filters architecture
- Shared nothing importers

## Other

### Building

- `gradlew.bat build` or `./gradlew build`
- Navigate to `build/distributions` and unzip the zip-folder (or use the gradle task `gradlew.bat installDist` or `./gradlew installDist`)
- Navigate to the `build/distributions/codecharta-analysis/bin` and execute the ccsh. On Mac just execute this line from the analysis folder:
```bash
  sh ./build/install/codecharta-analysis/bin/ccsh
```

### Testing

- Run `gradlew.bat test` or `./gradlew test`
- Run `gradlew.bat integrationTest` or `./gradlew integrationTest`

The integration tests might fail on windows, because of a missing or unknown `sh` command.
To make it work, add the path to the Git `sh.exe` (which is normally placed here `C:\<path-to-git>\Git\bin`) to your PATH variable.

If the integration tests fail on macOS, it is likely because the `timeout` command is not installed. This is necessary for the integration test and can be installed e.g. with `brew install coreutils`.

**If you want to run the JUnit tests with the IntelliJ-Runner, make sure to go to `File -> Settings ->Build,Execution, Deployment -> Build Tools -> Gradle` and select `Run test using: IntelliJ IDEA`**

### Linting/Formatting

- `gradlew.bat ktLintCheck` or `./gradlew ktLintCheck` to check code style
- `gradlew.bat ktLintFormat` or `./gradlew ktLintFormat` to format code

### Known issues

**`DialogProviderTest > directoryNavigator should provide repeated auto-completion` is flaky.** It asserts
that the `dialogProvider` module contains exactly the directories `build/` and `src/`, so it depends on the
state of the working tree rather than on fixtures. It fails after a `clean` that has not been followed by a
compile, and on any checkout carrying an extra directory in that module. Re-run the module's tests; if it
keeps failing, check for stray directories in `dialogProvider/`.

**Declaration usage kinds are only reported for PHP.** `ccsh dependencyparser` writes a `usage` list on
every leaf edge — `inheritance`, `implementation`, `instantiation`, `argument`, `return_value`,
`constant_access` — but everything except PHP, which runs its own tree-sitter queries, reports only
`usage`. The information is *not* missing: `TreeSitterExcavationSite` already separates used types by the
position they appear in (`UsedTypeExtractor.extractInheritanceTypes`, `extractParameterTypes`,
`extractReturnTypes`, `extractObjectCreationTypes`, … for Java, Kotlin, C#, Rust, Delphi, JavaScript, and
the `cpp/extractors/usedtypes` split for C++). Its public `UsedType` is `(name, genericTypes,
namespacePrefix)`, so the distinction is flattened away at the API boundary. The fix is upstream and
small — carry the position each extractor already knows on `UsedType`; `TseMappings.toType()` here then
maps it straight onto `TypeOfUsage`. DependaCharta has the same gap for the same reason.

**Building on a mounted filesystem.** If the checkout lives on a filesystem that does not give the build a
coherent view of files it has just written — a VM or container mount (virtiofs, 9p), or a network share —
Gradle fails while snapshotting its own outputs (`Cannot access output property ... NoSuchFileException`
naming a class file, test result or report it just wrote), and Kotlin's incremental compilation corrupts
its caches (`Could not close incremental caches`, then phantom `Unresolved reference` errors on the next
build). Put the build directories on local disk, and set `kotlin.incremental=false` in your
`~/.gradle/gradle.properties`.

### Intellij Gradle Integration for Building and Testing

Multiple gradle tasks can be directly executed in the IntelliJ interface, this is especially useful when trying to build and test the project.
To do that open the gradle menu on the right side, and open the gradle tasks.
Under there you can find multiple useful tasks:

- `clean`: Deletes previous builds.
- `build`: Executes a formatting check, all unit tests and builds the project.
- `installDist`: Unpacks the zip file generated from the build, so that you get an executable file for manual testing. Inside the unpacked folder, you will find a bin director containing an executable `ccsh` file.
- `integrationTest`: Executes the integration tests specified in golden_test.sh

There are several more tasks defined, this is just an overview of the most commonly used tasks.
