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

## Usage and Parameters

| Parameter                                 | Description                                                                                                                                       |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `FOLDER or FILE`                          | The project folder or code file to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument     |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders                                                                                   |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)                                                                  |
| `-h, --help`                              | displays this help and exits                                                                                                                      |
| `-ibf, --include-build-folders`           | include build folders (out, build, dist and target) and common resource folders (e.g. resources, node_modules or files/folders starting with '.') |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                                                                     |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                                                                                 |
| `--verbose`                               | displays messages about parsed and ignored files                                                                                                  |

```
Usage: ccsh unifiedparser [-h] [-ibf] [-nc] [--verbose] [-o=<outputFile>]
                          [-e=<patternsToExclude>]...
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

If a project is piped into the UnifiedParser, the results and the piped project are merged.
The resulting project has the project name specified for the UnifiedParser.
```
cat pipeInput.cc.json | ccsh unifiedparser src/test/resources - -o merged.cc.json
```

## Known issues

- In ruby the 'lambda' keyword is not counted correctly for complexity and number of functions
