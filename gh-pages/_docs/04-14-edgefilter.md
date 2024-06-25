---
permalink: /docs/edge-filter
title: "Edge Filter"
---

**Category**: Filter (takes in cc.json and outputs cc.json)

Generates visualization data from a cc.json file with edges data. For every node its edge-attributes get aggregated and inserted as node-attribute. After using this command the file can also be visualized inside the visualization, because the `edgefilter` creates nodes, if they did not exist before.

## Usage and Parameters

| Parameters                         | Description                       |
| ---------------------------------- | --------------------------------- |
| `FILE`                             | files to filter                   |
| `-h, --help`                       | displays help and exits           |
| `-o, --outputFile=<outputFile>`    | output File (or empty for stdout) |
| `--path-seperator=<pathSeperator>` | path seperator (default= '/')     |

```
Usage: ccsh edgefilter [-h] [-o=<outputFile>]
                       [--path-separator=<pathSeparator>] FILE
```

## Example

```
ccsh edgefilter edges.cc.json -o visual_edges.cc.json
```
