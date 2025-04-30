# Raw Text Parser

**Category**: Parser (takes in source code and outputs cc.json)

This parser analyzes code, regardless of the programming language, to generate the metrics described below.

## Supported Languages

- any (only considers the raw text)

## Supported Metrics

- Indentation Level: The number of lines of code of a file, with a certain indentation level or higher.
- Lines of Code: The total number of lines in a file, including blank lines.

## Usage and Parameters

| Parameter                                 | Description                                                                                          |
|-------------------------------------------|------------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parseProject                                                                         |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders                                      |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders                                      |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)                     |
| `-h, --help`                              | displays this help and exits                                                                         |
| `-m, --metrics=metrics`                   | comma-separated list of metrics to be computed (all available metrics are computed if not specified) |
| `--max-indentation-level=<maxIndentLvl>`  | maximum Indentation Level (default 10)                                                               |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                        |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                                    |
| `--tab-width=<tabWidth>`                  | tab width used (estimated if not provided)                                                           |
| `--verbose`                               | verbose mode                                                                                         |
| `--without-default-excludes`              | include build, target, dist, resources and out folders as well as files/folders starting with '.'    |

```
Usage: ccsh rawtextparser [-h] [-nc] [--verbose] [--without-default-excludes]
                          [--max-indentation-level=<maxIndentLvl>]
                          [-o=<outputFile>] [--tab-width=<tabWidth>]
                          [-e=<exclude>]... [-fe=<fileExtensions>]...
                          [-m=metrics]... FILE or FOLDER
```

## Examples

The RawTextParser can analyze either a single file or a project folder; here are some sample commands:

```
ccsh rawtextparser foo/bar/project
```

```
ccsh rawtextparser foo.txt --max-indentation-level=6 tab-width=4 --metrics=IndentationLevel, LinesOfCode
```

```
ccsh rawtextparser foo -o out.cc.json --exclude=*.html --exclude=bar
```

If a project is piped into the RawTextParser, the results and the piped project are merged.
The resulting project has the project name specified for the RawTextParser.

