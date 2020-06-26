---
permalink: /docs/raw-text-parser
title: "Raw Text Parser"
---

This parser analyzes code regardless of the programming language used to generate the metrics described below.

## Metrics

- Indentation Level: The number of lines of code of a file, with a certain indentation level or higher.

## Usage and Parameters

| Parameter                              | description                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `FILE or FOLDER`                       | file/project to parse                                                                              |
| `--maxIndentationLevel=<maxIndentLvl>` | maximum Indentation Level (default 10)                                                             |
| `--tabWidth=<tabWidth>`                | tab width used (estimated if not provided)                                                         |
| `--withoutDefaultExcludes`             | includes build, target, dist, resources and out folders as well as files/folders starting with '.' |
| `-e, --exclude=<exclude>`              | exclude file/folders according to regex pattern                                                    |
| `-h, --help`                           | displays help                                                                                      |
| `-m, --metrics[=<metrics>...]`         | metrics to be computed (select all if not specified)                                               |
| `-o, --outputFile=<outputFile>`        | output File (or empty for stdout)                                                                  |
| `-c`                                   | compresses outputfile to .gz                                                                       |
| `-p, --projectName=<projectName>`      | project name                                                                                       |
| `-v, --verbose`                        | verbose mode                                                                                       |

```
Usage: rawtextparser [-chv] [--withoutDefaultExcludes]
                     [--maxIndentationLevel=<maxIndentLvl>]
                     [--tabWidth=<tabWith>] [-o=<outputFile>] [-c]
                     [-p=<projectName>] [-e=<exclude>]... [-m
                     [=<metrics>...]]... FILE or FOLDER
```

generates cc.json from projects or source code files

## Examples

The RawTextParser can analyze either a single file or a project folder; here are some sample commands:

```
ccsh rawtextparser foo/bar/project
```

```
ccsh rawtextparser foo.txt --maxIndentationLevel=6 tabWidth=4 --metrics=IndentationLevel
```

```
ccsh rawtextparser foo -o out.cc.json --exclude=*.html --exclude=bar
```

If a project is piped into the [SourceCodeParser]({{site.baseurl}}{% link _docs/04-02-sourcecodeparser.md %}) , the results and the piped project are merged.
The resulting project has the project name specified for the SourceCodeParser.
