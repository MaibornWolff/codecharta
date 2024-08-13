# CSVImporter

Generates visualisation data from CSV data with header, e.g.
from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

## Usage

### CSV Import

_Conventions for csv input:_

- There must be a header.
- The column with header "path", or if not present the first column with non-empty header, will be interpreted as file
  location and used as hierarchical information the corresponding node.
- Columns with empty or duplicate header will be ignored.

# SourceMonitorImporter

Generates visualisation data from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) through its CSV export
functionality.

## Metrics

| Metric                            | Description                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `loc`                             | Total count of lines in the source code, including lines with whitespace, comments, and actual code.          |
| `rloc`                            | Count of lines that contain actual code, excluding lines that are only whitespace, comments, or tabulations.  |
| `classes`                         | The total number of distinct classes defined within the source code.                                          |
| `functions_per_class`             | Average number of functions (or methods) defined within each class.                                           |
| `average_statements_per_function` | The mean number of statements within each function across the entire codebase.                                |
| `max_function_mcc`                | The highest McCabe's cyclomatic complexity found in any single function.                                      |
| `max_block_depth`                 | The greatest level of nesting of control structures (like loops or conditionals) within any part of the code. |
| `average_block_depth`             | The average depth of nested control structures across the entire codebase.                                    |
| `average_function_mcc`            | The mean McCabe's cyclomatic complexity across all functions.                                                 |
| `sm_percent_branch_statements`    | The percentage of all statements that are branch statements (e.g., if, else, switch, case).                   |
| `sm_method_call_statements`       | The count of statements in the code that are method or function calls.                                        |
| `sm_percent_lines_with_comments`  | The percentage of the total lines of code that contain comments.                                              |

## Usage

### CSV Import for SourceMonitor

If you have analized your projectBuilder with SourceMonitor and exported the metric data (for classes only) to a
csv-file, you may call the command

> ccsh sourcemonitorimport \<path to sourcemonitor csv file>

which prints the visualisation data to stdout.

Currently, SourceMonitorImporter does not support metrics for methods in csv files from SourceMonitor.

### Wrapper Script sourcemonImport.bat

If SourceMonitor v3.5 is installed in 'C:\Program Files (x86)\SourceMonitor' you may use the wrapper script
sourcemonImport.bat to generate and import metrics from SourceMonitor in one step:

> sourcemonImport.bat \<projectBuilder name> \<source code path> \<language>

If SourceMonitor is installed in a different directory the script must be changed accordingly.

### General CSV Import

You may use the CSVImporter to import general CSV files.
