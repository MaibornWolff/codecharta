---
permalink: /docs/merge-filter
title: "Merge Filter"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

**Category**: Filter (takes in multiple cc.json files and outputs single cc.json)

Reads the specified files and merges visualisation data.

The first file with visualisation data is used as reference for the merging strategy and a base for the output. The visualisation data in the additional json files (given they have the same API version) are fitted into this reference structure according to a specific strategy. Currently, there are two main strategies:

- recursive (default): leave structure of additional files. This will also merge optional edges.
- leaf (beta): fit leaf nodes into reference structure according to their name (and tail of their path),
  either adding missing leaves (`--add-missing`) or ignoring them (default)

Both strategies will merge the unique list entries for `attributeTypes` and `blacklist`.

## Usage and Parameters

| Parameters                      | Description                              |
| ------------------------------- | ---------------------------------------- |
| `FILE`                          | files to merge                           |
| `-a, --add-missing`             | enable adding missing nodes to reference |
| `-h, --help`                    | displays help and exits                  |
| `--ignore-case`                 | ignores case when checking node names    |
| `--leaf`                        | use leaf merging strategy                |
| `-nc, --not-compressed`         | save uncompressed output File            |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)        |
| `--recursive`                   | use recursive merging strategy (default) |

```
Usage: ccsh merge [-ah] [--ignore-case] [--leaf] [-nc] [--recursive]
                  [-o=<outputFile>] FILE or FOLDER...
```

## Examples

```
ccsh merge file1.cc.json ../foo/file2.cc.json -o=test.cc.json
```

```
ccsh merge file1.cc.json ../foo/file2.cc.json -o=test.cc.json --leaf --add-missing
```

```
ccsh merge file1.cc.json ../foo/ -o=test.cc.json
```

This last example inputs the folder foo, which will result in all project files in that folder being merged with the reference file (file1.cc.json).
