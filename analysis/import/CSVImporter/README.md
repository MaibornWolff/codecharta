# CSVImporter

Generates visualisation data from CSV data with header, e.g. from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

## Usage

### CSV Import

_Conventions for csv input:_

-   There must be a header.
-   The column with header "path", or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information the corresponding node.
-   Columns with empty or duplicate header will be ignored.

# SourceMonitorImporter

Generates visualisation data from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) through its CSV export functionality.

## Metrics

| Metric                            | Description                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `loc`                             | Lines of code including empty lines and comments                                                                                  |
| `rloc`                            | Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment |
| `classes`                         | Number of classes                                                                                                                 |
| `functions_per_class`             | Number of functions per class                                                                                                     |
| `average_statements_per_function` | Average number of statements per method                                                                                           |
| `max_function_mcc`                | Maximum cyclic complexity based on paths through a function by McCabe                                                             |
| `max_block_depth`                 | Maximum nested block depth found                                                                                                  |
| `average_block_depth`             | Average nested block depth found                                                                                                  |
| `average_function_mcc`            | Average cyclic complexity of functions                                                                                            |
| `sm_percent_branch_statements`    | Percentage of branch statements                                                                                                   |
| `sm_method_call_statements`       | Number of method call statements                                                                                                  |
| `sm_percent_lines_with_comments`  | Percentage of code lines that contain comments                                                                                    |

## Usage

### CSV Import for SourceMonitor

If you have analized your projectBuilder with SourceMonitor and exported the metric data (for classes only) to a csv-file, you may call the command

> ccsh sourcemonitorimport \<path to sourcemonitor csv file>

which prints the visualisation data to stdout.

Currently, SourceMonitorImporter does not support metrics for methods in csv files from SourceMonitor.

### Wrapper Script sourcemonImport.bat

If SourceMonitor v3.5 is installed in 'C:\Program Files (x86)\SourceMonitor' you may use the wrapper script sourcemonImport.bat to generate and import metrics from SourceMonitor in one step:

> sourcemonImport.bat \<projectBuilder name> \<source code path> \<language>

If SourceMonitor is installed in a different directory the script must be changed accordingly.

### General CSV Import

You may use the CSVImporter to import general CSV files.
