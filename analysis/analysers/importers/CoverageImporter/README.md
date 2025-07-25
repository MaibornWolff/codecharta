# Coverage Importer

**Category**: Importer (takes in a coverage report generated by any coverage tool - see supported formats below)

The CoverageImporter generates visualisation data from a coverage report generated by any coverage tool. The coverage report must be in one of the supported formats (see below). The CoverageImporter generates node attributes for each file in the coverage report.

## Supported Metrics

| Metric                  | Description                                                  |
|-------------------------|--------------------------------------------------------------|
| `line_coverage`         | The percentage of lines covered by tests in the file.        |
| `branch_coverage`       | The percentage of branches covered by tests in the file.     |
| `statement_coverage`    | The percentage of statements covered by tests in the file.   |
| `instruction_coverage`  | The percentage of instructions covered by tests in the file. |
| `complexity_coverage`   | The percentage of complexity covered by tests.               |
| `method_coverage`       | The percentage of methods covered by tests in the file.      |
| `class_coverage`        | The percentage of classes covered by tests.                  |

## Supported Coverage Report Formats

| Format    | Command     | Default Report File    |
|-----------|-------------|------------------------|
| LCOV      | `lcov`      | lcov.info              |
| JaCoCo    | `jacoco`    | jacoco.xml             |
| Cobertura | `cobertura` | coverage.cobertura.xml |
| PHPUnit   | `phpunit`   | index.xml              |
| Clover    | `clover`    | clover.xml             |

## Usage and Parameters

| Parameters                           | Description                                                                                                                              |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `<pathToReportFile>`                 | path to the coverage report file (when specifying a folder, the importer searches for a file matching the default file name - see above) |
| `-f, --format`                       | specify the format of the coverage report (see above)                                                                                    |
| `-h, --help`                         | displays help and exits                                                                                                                  |
| `-nc, --not-compressed`              | save uncompressed output File                                                                                                            |
| `-o, --output-file=<outputFilePath>` | output File (or empty for stdout)                                                                                                        |
| `-klp, --keep-leading-paths`         | Keep full file paths, including segments before the project root directory                                                               |

```
Usage: ccsh coverageimport <pathToReportFile> [--format] [-h] [-nc] [-klp] [-o=<outputFile>]...
```

## Example

### Lcov / TypeScript

1. Create a coverage report with your coverage tool, e.g. with Jest
2. Import the coverage report with the CoverageImporter

```bash
  ccsh coverageimport lcov.info --format=lcov -o typescript_coverage.cc.json
```

## Example File Content

### JavaScript / TypeScript

Example Input file: `lcov.info`
```
TN:
SF:app/app.config.ts
FN:55,(anonymous_0)
FN:55,(anonymous_1)
FNF:2
FNH:0
FNDA:0,(anonymous_0)
FNDA:0,(anonymous_1)
DA:1,0
DA:2,0
DA:3,0
DA:4,0
DA:5,0
DA:6,0
DA:7,0
DA:8,0
DA:9,0
DA:10,0
DA:11,0
DA:12,0
DA:13,0
DA:14,0
DA:15,0
DA:16,0
DA:17,0
DA:18,0
DA:19,0
DA:20,0
DA:21,0
DA:22,0
DA:23,0
DA:24,0
DA:26,0
DA:55,0
LF:26
LH:0
BRF:0
BRH:0
end_of_record
```

Example Output file: `typescript_coverage.cc.json`
```
{
  "projectName": "typescript_coverage",
  "apiVersion": "1.2",
  "nodes": [
    {
      "name": "app/app.config.ts",
      "type": "File",
      "attributes": {
        "line_coverage": 0,
        "branch_coverage": 0,
        "statement_coverage": 0
      }
    }
  ],
  "edges": []
}
```

## Extending the Coverage Importer

The coverage importer has different implementations (or strategies) based on the format of the coverage report.

To add support for a new report format, it is necessary to create a new class which implements the 'ImporterStrategy' interface. This new strategy handles extracting the relevant information from the coverage report and inserting them into the projectBuilder, which will generate the final output (this does not need to be implemented). If the report is in xml format, the ImporterStrategy interface provides some functionality to find the relevant elements in the report based on their xml-tag. After this implementation is done, add the new strategy to the 'SupportedFormats' enum, so that it will be available for execution. It is recommended to also add some dummy reports of the new format as testing resource together with tests, to ensure the format is correctly handled.
