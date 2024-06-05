# Source Code Parser

A parser to generate code metrics from a source code file or a project folder. It generates either a cc.json or a csv
file.

## Supported languages

- Java

## Supported Metrics

- rloc: Real lines of code
- classes
- functions
- statements
- comment_lines
- complexity (Cyclomatic complexity)
- cognitive_complexity
- commented_out_code_blocks
- max_nesting_level
- code_smell
- security_hotspot
- vulnerability
- bug
- sonar_issue_other

## Usage and Parameters

| Parameter                        | description                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FOLDER or FILE`                 | project folder or code file                                                                                                                          |
| `--default-excludes`             | exclude build, target, dist and out folders as well as files/folders starting with '.'                                                               |
| `-e, --exclude=<exclude>`        | comma-separated list of regex patterns to exclude files/folders (when using powershell, the list either can't contain spaces or has to be in quotes) |
| `-f, --format=<outputFormat>`    | the format to output (either json or csv)                                                                                                            |
| `-h, --help`                     | displays this help and exits                                                                                                                         |
| `-nc, --not-compressed`          | save uncompressed output File                                                                                                                        |
| `-ni, --no-issues`               | do not search for sonar issues                                                                                                                       |
| `-o, --output-file=<outputFile>` | output File (or empty for stdout)                                                                                                                    |
| `--verbose`                      | display info messages from sonar plugins                                                                                                             |

```
Usage: ccsh sourcecodeparser [-h] [--default-excludes] [-nc] [-ni] [--verbose]
                             [-f=<outputFormat>] [-o=<outputFile>]
                             [-e=<exclude>]... FOLDER or FILE
```

## Examples

The SourceCodeParser can analyze either a single file or a project folder; here are some sample commands:

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json
```

or

```
./ccsh sourcecodeparser src/test/resources/foo.java -o foo.cc.json
```

or

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json --default-excludes -e=something -e=/.*\.foo -f=csv
```

or

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json -f=csv -i
```

If a project is piped into the SourceCodeParser, the results and the piped project are merged.
The resulting project has the project name specified for the SourceCodeParser.

## Sonar Plugins

In order to generate the code metrics, the SourceCodeParser uses Sonar plugins. New languages can be added to the Source
code parser by writing a class that extends SonarAnalyzer and incorporate the respective Sonar Plugin.

## License

This program uses the [SonarJava library](https://github.com/SonarSource/sonar-java/), which is licensed under the GNU
Lesser General Public Library, version 3.
