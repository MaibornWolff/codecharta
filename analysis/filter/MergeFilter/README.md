# MergeFilter

Reads the specified files, merges visualisation data and prints to stdout.

## Usage

 > `ccsh merge <reference json file> <json files>`
 or
 > `ccsh merge <folder> `

The first file with visualisation data is used as reference for the merging strategy. 
In case of different ProjectNames the first ProjectName is used. The visualisation data in the additional
json files, given they have the same API version, are fitted into this reference structure according to a
specific strategy. Currently there are two main strategies:
- recursive (`--recursive`) (default): leave structure of additional files. This will also merge optional edges.
- leaf (`--leaf`) (beta):  fit leaf nodes into reference structure according to their name (and tail of their path), 
either adding missing leaves (`--add-missing`) or ignoring them (default)

If files with different project names shoud be merged, a new project name must be specified with -p.

Both strategies will merge the unique list entries for `attributeTypes` and `blacklist`. When invoked with `-h` or `--help` MergeFilter prints its usage.

 ### Examples
 
 > `ccsh merge file1.cc.json ../foo/file2.cc.json -o=test.cc.json`

 > `ccsh merge file1.cc.json ../foo/file2.cc.json -o=test.cc.json --leaf --add-missing`

 > `ccsh merge file1.cc.json ../foo/ -o=test.cc.json -p=NewProjectName` (Merges all project files in foo with the reference file)
