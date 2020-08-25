---
permalink: /docs/source-code-parser
title: "Source Code Parser"
---

The Source-Code-Parser is parser to generate code metrics from a source code file or a project folder. It generates either a cc.json or a csv file.

## Supported languages

- Java

## Supported Metrics

- rloc: Real lines of code
- classes
- functions
- statements
- comment_lines
- mcc: McCabe Complexity / Cyclomatic complexity
- cognitive_complexity
- commented_out_code_blocks
- max_nesting_level
- code_smell
- security_hotspot
- vulnerability
- bug
- sonar_issue_other

## Parameter and Usage

| Parameter                       | description                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `FILE or FOLDER`                | file/project to parse                                                                  |
| `--default-excludes`            | exclude build, target, dist and out folders as well as files/folders starting with '.' |
| `-e, --exclude=<exclude>`       | exclude file/folders according to regex pattern                                        |
| `-f, --format=<outputFormat>`   | the format to output                                                                   |
| `-h, --help`                    | displays help                                                                          |
| `-i, --no-issues`               | do not search for sonar issues                                                         |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)                                                      |
| `-c`                            | compresses outputfile to gzip format, if format of File is JSON                        |
| `-v, --verbose`                 | display info messages from sonar plugin                                                |

### Usage

```
sourcecodeparser [-chiv] [--default-excludes] [-f=<outputFormat>]
                 [-o=<outputFile>] [-e=<exclude>]... FOLDER or FILE
```

## Run

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
./ccsh sourcecodeparser src/test/resources -o foo.cc.json --default-excludes -e=something -e=/.*\.foo -f=table
```

or

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json -f=table -i
```

If a project is piped into the SourceCodeParser, the results and the piped project are merged.
The resulting project has the project name specified for the SourceCodeParser.

## Sonar Plugins

In order to generate the code metrics, the SourceCodeParser uses Sonar plugins. New languages can be added to the Source code parser by writing a class that extends SonarAnalyzer and incorporate the respective Sonar Plugin.

## License

This program uses the [SonarJava library](https://github.com/SonarSource/sonar-java/), which is licensed under the GNU Lesser General Public Library, version 3.
