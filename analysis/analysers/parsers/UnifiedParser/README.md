# Unified Parser

**Category**: Parser (takes in source code and outputs cc.json)

The Unified Parser is parser to generate code metrics from a source code file or a project folder without relying on tools other than CodeCharta. It generates either a cc.json or a csv file.

## Supported Languages

| Language   | Supported file extensions              |
|------------|----------------------------------------|
| Javascript | .js, .cjs, .mjs                        |
| Typescript | .ts, .cts, .mts                        |
| Java       | .java                                  |
| Kotlin     | .kt                                    |
| C#         | .cs                                    |
| C++        | .cpp, .cc, .cxx, .c++, .hh, .hpp, .hxx |
| C          | .c, .h                                 |
| Python     | .py                                    |
| Go         | .go                                    |
| PHP        | .php                                   |
| Ruby       | .rb                                    |
| Swift      | .swift                                 |
| Bash       | .sh                                    |

## Supported Metrics

| Metric                    | Description                                                                                                                                                                                                                |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Complexity                | Complexity of the file based on the number of paths through the code. Also includes complexity introduced by definition of functions, classes, etc. (Represents the 'cognitive load' necessary to overlook the whole file) |
| Logic Complexity          | Complexity of the file based on number of paths through the code, similar to cyclomatic complexity (only counts complexity in code, not complexity introduced by definition of functions, classes, etc.)                   |
| Comment lines             | The number of comment lines found in a file                                                                                                                                                                                |
| Number of functions       | The number of functions and methods in a file                                                                                                                                                                              |
| Lines of code (LOC)       | Lines of code including empty lines and comments                                                                                                                                                                           |
| Real lines of code (RLOC) | Number of lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment                                                                                                   |
| Long Method               | Code smell showing the number of functions with more than 10 real lines of code (rloc)                                                                                                                                     |
| Long Parameter List       | Code smell showing the number of functions with more than 4 parameters                                                                                                                                                     |
| Excessive Comments        | Code smell showing whether a file has more than 10 comment lines                                                                                                                                                           |
| Comment Ratio             | The ratio of comment lines to real lines of code (rloc)                                                                                                                                                                    |
| Message Chains            | Code smell showing occurrences of method call chains with 4 or more consecutive calls suggesting tight coupling                                                                                                            |

Some metrics are calculated on a per-function basis rather than per-file. Each of these metrics has max, min, mean and median values for each file.

| Metric per function     | Description                                          |
|-------------------------|------------------------------------------------------|
| Parameters per function | The number of parameters for each function           |
| Complexity per function | The complexity inside the body of a function         |
| RLOC per function       | The real lines of code inside the body of a function |

## Usage and Parameters

| Parameter                                 | Description                                                                                                                                       |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `FOLDER or FILE`                          | The project folder or code file to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument     |
| `-bf, --base-file=<baseFile>`             | base cc.json file with checksums to skip unchanged files during analysis                                                                          |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion (uses regex-based exclusion of common build folders)                                            |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders (applied in addition to .gitignore patterns)                                      |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)                                                                  |
| `-h, --help`                              | displays this help and exits                                                                                                                      |
| `-ibf, --include-build-folders`           | include build folders (out, build, dist and target) and common resource folders (e.g. resources, node_modules or files/folders starting with '.') |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                                                                     |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                                                                                 |
| `--verbose`                               | displays messages about parsed and ignored files                                                                                                  |

```
Usage: ccsh unifiedparser [-h] [--bypass-gitignore] [-ibf] [-nc] [--verbose]
                          [-bf=<baseFile>] [-o=<outputFile>]
                          [-e=<specifiedExcludePatterns>]...
                          [-fe=<fileExtensionsToAnalyse>]... FILE or FOLDER...
```

## Examples

The Unified Parser can analyze either a single file or a project folder; here are some sample commands:

```
ccsh unifiedparser src/test/resources -o foo.cc.json
```

```
ccsh unifiedparser src/test/resources/foo.ts -o foo.cc.json
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json -nc --verbose
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json --include-build-folders -e=something -e=/.*\.foo
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json --bypass-gitignore
```

If a project is piped into the UnifiedParser, the results and the piped project are merged.
The resulting project has the project name specified for the UnifiedParser.
```
cat pipeInput.cc.json | ccsh unifiedparser src/test/resources - -o merged.cc.json
```

## Known issues

- In ruby the 'lambda' keyword is not counted correctly for complexity and number of functions

## Extending the UnifiedParser

This Parser is built with extensibility in mind and can be extended in two ways:

### Adding a new language

Adding a new language to the parser is done by creating a new language-specific 'collector', which inherits from the abstract class 'MetricCollector'. Such a collector requires two parameters: First, a reference to the tree-sitter implementation for the language. Second, the collector requires language-specific node types in form of a node type provider.

As the tree-sitter grammars differ by language, these node types need to be adjusted for each language. The node type provider inherits from the 'MetricNodeTypes' interface and defines which tree-sitter node types correspond to each metric (e.g., which nodes represent functions, loops, comments). Research the language's `node-types.json` from the tree-sitter grammar to identify correct node type names.

By default, it is not necessary to implement further logic in the language-specific collectors. However, if the calculation for one metric differs from the base implementation (most often when specific tree-sitter nodes would be wrongfully counted), it is possible to adjust the base implementation using code injection.

#### 1. Add tree-sitter dependency
- Add version and library entries in `analysis/gradle/libs.versions.toml`
- Add dependency to `analysis/analysers/parsers/UnifiedParser/build.gradle.kts`
- Tree-sitter implementations: [tree-sitter-ng](https://github.com/bonede/tree-sitter-ng)

#### 2. Add FileExtension enum entry
Add entry in `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt` (sorted alphabetically)

#### 3. Create NodeTypes class
Create `YourLanguageNodeTypes.kt` in `metricnodetypes/` implementing `MetricNodeTypes`. Define tree-sitter node types for each metric. Research the language's `node-types.json` to identify correct node type names.

#### 4. Create Collector class
Create `YourLanguageCollector.kt` in `metriccollectors/`:
```kotlin
class YourLanguageCollector : MetricCollector(
    treeSitterLanguage = TreeSitterYourLanguage(),
    nodeTypeProvider = YourLanguageNodeTypes()
)
```

#### 5. Register in AvailableCollectors
Add entry to `AvailableCollectors.kt` (alphabetically)

#### 6. Add tests
Create `YourLanguageCollectorTest.kt` with comprehensive tests following Arrange-Act-Assert pattern. Test language-specific constructs and all metrics.

It is recommended to test both generic functionality as well as special cases of the language.

#### 7. Update documentation
Add language to "Supported Languages" table in this README

#### 8. Run tests
```bash
./gradlew :analysers:parsers:UnifiedParser:test
```

### Adding a new metric

Adding a new metric is done by creating a new metric specific 'calculator', which should inherit from either the 'MetricPerFileCalc' interface if the metric is calculated per file or from 'MetricPerFunctionCalc' if it is calculated per function. Calculation of metrics happens individually for each iterated treesitter-node.

After the calculation logic is implemented, adjust the 'AvailableFileMetrics' or 'AvailableFunctionMetrics' enum in the 'MetricNodeTypes' file to add the new metric and the 'MetricsToCalculatorsMap' to connect the new metric with its calculation logic.

Finally, the 'AttributeDescriptors' file needs to be adjusted to include information about the new metric and tests should be run to check if any resource files need to be updated to include the new metric.
