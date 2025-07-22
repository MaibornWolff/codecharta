---
permalink: /docs/parser/unified
title: "Unified Parser"
redirect_from:
  - /parser/

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

**Category**: Parser (takes in source code and outputs cc.json)

The Unified Parser is parser to generate code metrics from a source code file or a project folder without relying on tools other than CodeCharta. It generates either a cc.json or a csv file.

## Supported Languages

- Javascript
- Typescript
- Java
- Kotlin
- C#
- C++
- C
- Python
- Go

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
