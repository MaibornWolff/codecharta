---
permalink: /docs/filter/merge-filter
title: "Merge Filter"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

**Category**: Filter (takes in multiple cc.json files and outputs single cc.json)

Reads the specified files and merges visualization data.

The first file with visualisation data is used as reference for the merging strategy and a base for the output. The visualisation data in the additional json files (given they have the same API version) are fitted into this reference structure according to a specific strategy. Currently, there are two main strategies:

- recursive (default): leave structure of additional files. This will also merge optional edges.
- leaf (beta): fit leaf nodes into reference structure according to their name (and tail of their path),
  either adding missing leaves (`--add-missing`) or ignoring them (default)

Both strategies will merge the unique list entries for `attributeTypes` and `blacklist`.

## Usage and Parameters

| Parameters                      | Description                                                          |
|---------------------------------|----------------------------------------------------------------------|
| `FILE`                          | files to merge                                                       |
| `-a, --add-missing`             | [Leaf Merging Strategy] enable adding missing nodes to reference     |
| `-h, --help`                    | displays help and exits                                              |
| `--ignore-case`                 | ignores case when checking node names                                |
| `--leaf`                        | use leaf merging strategy                                            |
| `-nc, --not-compressed`         | save uncompressed output File                                        |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout; ignored in [MIMO mode]))           |
| `--recursive`                   | use recursive merging strategy (default)                             |
| `--mimo`                        | merge multiple files with the same prefix into multiple output files |
| `-ld, --levenshtein-distance`   | [MIMO mode] levenshtein distance for name match suggestions          |
| `-f`                            | force merge non-overlapping modules at the top-level structure       |

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

```
ccsh merge myProjectFolder/ --mimo -ld 0 -f
```

## MIMO - Multiply Inputs Multiple Outputs

Matches multiple `cc.json` files based on their prefix (e.g. **myProject**.git.cc.json). Tries to match project names with typos and asks which to add to the output.
If you want to use this in a CI/CD pipeline environment you may find it useful to specify `-ld` and `-f` to not prompt any user input.
The output file name follows the following schema: `myProject.merge.cc.json`.

> IMPORTANT: Output is always the current working directory.