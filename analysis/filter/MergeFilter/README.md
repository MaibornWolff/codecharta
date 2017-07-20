# MergeFilter

Reads the specified files, merges visualisation data and prints to stdout.

## Usage

 > `ccsh merge <json file> <json file>`

Given the specified json files with visualisation data, that has the same API version and the same project name.

 ### Example
 
 > `ccsh merge ..\..\src\test\resources\SourceMonitorImporter.json ..\..\src\test\resources\SourceMonitorImporter2.json > test.json`
