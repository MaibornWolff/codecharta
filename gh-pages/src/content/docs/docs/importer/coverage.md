---
title: "Coverage Importer"
description: "Import test coverage reports from LCOV, JaCoCo, Cobertura, Clover or PHPUnit into CodeCharta and see which files your tests miss."
---

The Coverage importer reads the coverage report your test tool already writes and turns it into a cc.json file with a
coverage metric on every file. Merge it with a map of your code and you see at a glance where large or complex files
lack tests.

## Quick start

```bash
ccsh coverageimport lcov.info --format=lcov -o coverage.cc.json
```

Leave out the report file and the importer searches the current directory for the format's default report file:

```bash
ccsh coverageimport --format=jacoco -o coverage.cc.json
```

## Options

| Option                               | Description                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `[pathToReportFile]`                 | the report file, or a folder to search for the format's default report file; the current directory when omitted |
| `-f, --format=<reportFormat>`        | required: the report format, one of `lcov`, `jacoco`, `cobertura`, `clover`, `phpunit`                            |
| `-o, --output-file=<outputFilePath>` | output file; prints to stdout when omitted                                                                        |
| `-nc, --not-compressed`              | write plain JSON instead of a gzip file                                                                           |
| `-klp, --keep-leading-paths`         | keep the full file paths, including the folders above the project root                                           |
| `-h, --help`                         | show the help and exit                                                                                            |

```text
Usage: ccsh coverageimport [-h] [-klp] [-nc] -f=<reportFormat>
                           [-o=<outputFilePath>] [pathToReportFile]
```

## Formats and metrics

Each format reports different kinds of coverage, so the metrics you get depend on the format. All of them are
percentages.

| Format    | `--format`  | Default report file      | Metrics                                                                                       |
| --------- | ----------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| LCOV      | `lcov`      | `lcov.info`              | `line_coverage`, `branch_coverage`, `statement_coverage`                                      |
| JaCoCo    | `jacoco`    | `jacoco.xml`             | `line_coverage`, `instruction_coverage`, `complexity_coverage`, `method_coverage`, `class_coverage` |
| Cobertura | `cobertura` | `coverage.cobertura.xml` | `line_coverage`, `branch_coverage`                                                            |
| Clover    | `clover`    | `clover.xml`             | `line_coverage`, `branch_coverage`, `method_coverage`                                         |
| PHPUnit   | `phpunit`   | `index.xml`              | `line_coverage`                                                                               |

| Metric                 | Description                               |
| ---------------------- | ----------------------------------------- |
| `line_coverage`        | share of lines covered by tests           |
| `branch_coverage`      | share of branches covered by tests        |
| `statement_coverage`   | share of statements covered by tests      |
| `instruction_coverage` | share of bytecode instructions covered    |
| `complexity_coverage`  | share of the cyclomatic complexity covered |
| `method_coverage`      | share of methods covered by tests         |
| `class_coverage`       | share of classes covered by tests         |

## File paths

Coverage reports often name files by their absolute path or with folders above your project. The importer drops the
single-child folders at the top, so the map starts where your files start. Pass `--keep-leading-paths` to keep the
full paths.

JaCoCo and Cobertura reports only know packages, not the full path of a file. Their maps can therefore start below
your project root. Merge them into a full map of your project with the leaf strategy, which places each file by its
name and the tail of its path:

```bash
ccsh unifiedparser . -o code.cc.json
ccsh coverageimport --format=jacoco -o coverage.cc.json
ccsh merge code.cc.json.gz coverage.cc.json.gz --leaf -o merged.cc.json
```

When the importer searches a folder for the default report file, it looks in all subfolders and stops with an error if
it finds none or more than one.

## Example

An LCOV entry for one file:

```text
SF:app/app.config.ts
DA:1,0
DA:2,0
LF:26
LH:0
BRF:0
BRH:0
end_of_record
```

The metrics it produces for `app.config.ts` (excerpt of the metrics lens):

```json
"attributes": {
  "fc1a3a3451fe7dad": { "line_coverage": 0.0, "branch_coverage": 100.0, "statement_coverage": 0.0 }
}
```

A project piped into `ccsh coverageimport` is merged with the coverage it reads.

## Related

- [Merge Filter](/docs/filter/merge-filter): combine coverage with a map of your code
- [Unified Parser](/docs/parser/unified): size and complexity metrics to put next to coverage
