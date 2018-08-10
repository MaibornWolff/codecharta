# MergeFilter

Reads the specified files, merges visualisation data and prints to stdout.

## Usage

 > `ccsh merge <reference json file> <json files>`

The first file with visualisation data is used as reference for the merging strategy. 
In case of different ProjectNames the first ProjectName is used. The visualisation data in the additional
json files, given they have the same API version, are fitted into this reference structure according to a
specific strategy. Currently there are two main strategies:
- recursive (`--recursive`) (default): leave structure of additional files. This will also merge optional dependencies.
- leaf (`--leaf`) (beta):  fit leaf nodes into reference structure according to their name (and tail of their path), 
either adding missing leaves (`--add-missing`) or ignoring them (default)

When invoked with `-h` or `--help` MergeFilter prints its usage:

 ### Example
 
 > `ccsh merge ..\..\src\test\resources\SourceMonitorImporter.json ..\..\src\test\resources\SourceMonitorImporter2.json > test.json`
