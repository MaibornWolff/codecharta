# Unified Parser

**Category**: Parser (takes in source code and outputs cc.json)

The Unified Parser is parser to generate code metrics from a source code file or a project folder without relying on tools other than CodeCharta. It generates either a cc.json or a csv file.

## Supported Languages

- Javascript
- Typescript
- Java
- Kotlin
- C#
- Python

## Supported Metrics

| Metric                    | Description                                                                                                              |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Complexity                | Complexity of a file based on the number of paths through the code (McCabe Complexity)                                   |
| Comment lines             | The number of comment lines found in a file                                                                              |
| Lines of code (LOC)       | Lines of code including empty lines and comments                                                                         |
| Real lines of code (RLOC) | Number of lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment |


## Usage and Parameters

| Parameter                                 | Description                                                                                   |
|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| `FOLDER or FILE`                          | The project folder or code file to parse                                                      |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders                               |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)              |
| `-h, --help`                              | displays this help and exits                                                                  |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                 |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                             |
| `--verbose`                               | displays messages about parsed and ignored files                                              |
| `--without-default-excludes`              | do not exclude build, target, dist and out folders as well as files/folders starting with '.' |

```
Usage: ccsh unifiedparser [-h] [-nc] [--verbose] [--without-default-excludes]
                          [-o=<outputFile>] [-e=<patternsToExclude>]...
                          [-fe=<fileExtensionsToAnalyse>]... FILE or FOLDER
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
ccsh unifiedparser src/test/resources -o foo.cc.json --without-default-excludes -e=something -e=/.*\.foo
```

If a project is piped into the UnifiedParser, the results and the piped project are merged.
The resulting project has the project name specified for the UnifiedParser.

## Extending the UnifiedParser

This Parser is built with extensibility in mind and can be extended in two ways:

### Adding a new language

Adding a new language to the parser is done by creating a new language specific 'collector', which inherits from the abstract class 'MetricCollector'. Such a collector requires two parameters. First a reference to the treesitter implementation for the language. For many language, this can be found [here](https://github.com/bonede/tree-sitter-ng) and can be added as a dependency via the 'libs.versions.toml'. Second, the collector requires language specific queries in form of a query provider.

As the treesitter grammars differ by language, these queries need to be adjusted for each language. Creating a new query provider is done by inheriting from the 'MetricQueries' interface and creating one query for each member. This interface has one member for each of the metrics currently supported by this parser. It is also possible to provide queries for only some of the metrics. Fot this, the 'getAvailableMetrics' function can be overwritten to only include the metric this language supports

By default, it is not necessary to implement any functionality in the language specific collectors. If however the calculation for one metric is different from the base implementation, the function to calculate that metric can be overwritten

Finally, to make the newly created collector accessible, add it to the 'AvailableCollectors' enum.

### Adding a new metric

To add a new metric, it is necessary to adjust the 'MetricQueries' interface by adding a new member representing the query that the inheriting classes need to implement. Further, the enum in the same file needs to be extended to include the new metric as well.

After this, for each language either a query for the new metric has to be implemented or the language has to be adjusted to set this metric as not supported by overwriting the 'getAvailableMetrics' function.

The 'MetricCollector' abstract class also has to be adjusted by adding a new function how the metric is calculated, as well as registering this new method in the 'metricToCalculation' map.

Finally, the 'AttributeDescriptors' file needs to be adjusted to include information about the new metric.
