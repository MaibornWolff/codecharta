# CSVExporter (experimental)

Generates a CSV file from a cc.json File. The CSV file will have a header as described below.

## Usage

`ccsh csvexport <file>` Input file

`--depth-of-hierarchy=<maxHierarchy>` Optional: Defines how many layers of the project structure should be listed. DEFAULT: 10.

`--output-file=<output> , -o=<output>` Optional: Generates csv file instead of output in CLI.

`--help , -help` Gives list of flags.

### CSV Export Header

_Conventions for csv output:_

-   Every node with attributes contributes one line
-   Column named _path_ contains the hierarchical data of the node, separated via _/_
-   Column named _name_ contains the name of the node
-   Column named _type_ contains the type of the node
-   Columns named _Dir0_, _Dir1_, ... contain the splitted hierarchical data of the node for convenience
-   The other columns contain the atttributes of the nodes

### Example

With output in CLI:

`ccsh csvexport visual.cc.json`

The following generates result.csv as output, while truncating the file paths to length 2:

`ccsh csvexport visual.cc.json --depth-of-hierarchy=2 -o result.csv`

NOTE: The flag `--depth-of-hierarchy=2` truncates the following example row of a CSV file

> adt4j/src/main/java/com/github/sviperll/adt4j/Caching.java,Caching.java,File,13.0,1.0,2.0,2.0,8.0,2.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,adt4j,src,main,java,com,github,sviperll,adt4j,,

into simply

> adt4j/src/main/java/com/github/sviperll/adt4j/Caching.java,Caching.java,File,13.0,1.0,2.0,2.0,8.0,2.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,adt4j,src

Further information about other topics can be found by

`ccsh csvexport -h`
