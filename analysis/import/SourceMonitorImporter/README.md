# SourceMonitorImporter

Generates visualisation data from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) through SourceMonitor's CSV-Export.

## Usage

### CSV-Import

If you have analized your project with SourceMonitor and exported the metric data (for classes only) to a csv-file, you may call the command

> ccsh sourcemonitorimport \<path to sourcemonitor csv file>

which prints the visualisation data to stdout.

Currently, SourceMonitorImporter does not support metrics for methods in csv files from SourceMonitor.

### Wrapper Script sourcemonImport.bat

If SourceMonitor v3.5 is installed in 'C:\Program Files (x86)\SourceMonitor' you may use the wrapper script sourcemonImport.bat to generates and imports metrics from SourceMonitor in one step:

> sourcemonImport.bat \<project name> \<source code path> \<language>

If SourceMonitor is installed in a different directory the script must be changed accordingly.
