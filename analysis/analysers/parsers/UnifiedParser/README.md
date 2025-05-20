# Unified Parser

**Category**: Parser (takes in source code and outputs cc.json)

The Unified Parser is parser to generate code metrics from a source code file or a project folder without relying on tools other than CodeCharta. It generates either a cc.json or a csv file.

## Supported Languages

- Typescript

## Supported Metrics

- Complexity

## Usage and Parameters

| Parameter                                 | Description                                                                                   |
|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| `FOLDER or FILE`                          | The project folder or code file to parse                                                      |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders                               |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)              |
| `-h, --help`                              | displays this help and exits                                                                  |
| `-m, --metrics=<metrics>`                 | comma-separated list of metrics to compute (default: compute all available metrics)           |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                 |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                             |
| `--verbose`                               | displays messages about parsed and ignored files                                              |
| `--without-default-excludes`              | do not exclude build, target, dist and out folders as well as files/folders starting with '.' |

```
Usage: ccsh unifiedparser [-h] [-nc] [--verbose] [--without-default-excludes]
                          [-o=<outputFile>] [-e=<exclude>]...
                          [-fe=<fileExtensions>]... FILE or FOLDER
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

