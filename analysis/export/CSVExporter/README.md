# CSVExporter (experimental)

Generates CSV file with header from visualization data

## Usage

### CSV Export

_Conventions for csv output:_

-   Every node with attributes contributes one line
-   Column named _path_ contains the hierarchical data of the node, separated via _/_
-   Column named _name_ contains the name of the node
-   Column named _type_ contains the type of the node
-   Columns named _Dir0_, _Dir1_, ... contain the splitted hierarchical data of the node for convenience
-   The other columns contain the atttributes of the nodes

### Example

> ccsh csvexport visual.cc.json

Further usage information may be retrieved through

> ccsh csvexport -h
