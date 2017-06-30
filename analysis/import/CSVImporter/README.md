# SourceMonitorImporter

Generates visualisation data from CSV data with header, e.g. from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

## Usage

### CSV Import

_Conventions for csv input:_
- There must be a header.
- The column with header "path", or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information the corresponding node.
- Columns with empty or duplicate header will be ignored.
