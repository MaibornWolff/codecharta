---
permalink: /docs/structure-modifier
title: "Structure Modifier"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

**Category**: Filter (takes in cc.json and outputs cc.json)

The Structure Modifier is used to modify the structure of .cc.json files. It enables to:

- Remove nodes from a project: The resulting project will not include these nodes and their children.
- Declare a node as root: This means that the chosen node will become the root node of the resulting sub-project.
- Move nodes within the project: All children of the source node will be transferred to the destination node.
- Rename the mcc metric to complexity or sonar_complexity (revert the previous renaming to mcc).
- Print the hierarchy of the project: Prints the hierarchy into the console in a human-readable format.

The edges and blacklist entries associated with moved/removed nodes will be altered as well, while all attribute types will be copied.

> Do not specify multiple actions in one command, as only one action will be performed

### Usage and Parameters

| Parameters                         | Description                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `FILE`                             | files to merge                                                                                                                   |
| `-f, --move-from=<moveFrom>`       | move nodes in project folder ... (use paired with the `--move-to` parameter)                                                     |
| `-h, --help`                       | displays help and exits                                                                                                          |
| `-o, --outputFile=<outputFile>`    | output File (or empty for stdout)                                                                                                |
| `-p, --print-levels=<printLevels>` | show first x layers of project hierarchy                                                                                         |
| `-r, --remove=<remove>`            | comma-separated list of nodes to be removed (when using powershell, the list either can't contain spaces or has to be in quotes) |
| `--rename-mcc[=<renameMcc>]`       | renames the mcc metric to complexity. Optionally specify 'sonar' for the metric to be renamed to sonar_complexity                |
| `-s, --set-root=<setRoot>`         | path within project to be extracted as the new root                                                                              |
| `-t, --move-to=<moveTo>`           | ... move nodes to destination folder (use paired with `--move-from` parameter)                                                   |

```
Usage: ccsh modify [-h] [--rename-mcc[=<renameMcc>]] [-f=<moveFrom>]
                   [-o=<outputFile>] [-p=<printLevels>] [-s=<setRoot>]
                   [-t=<moveTo>] [-r=<remove>]... [FILE]

```

## Examples

```
ccsh modify foo.cc.json -p=2
```

```
ccsh modify foo.cc.json --remove=/root/foo --remove=/root/bar/
```

```
ccsh modify foo.cc.json --move-from=/root/foo --move-to=/root/bar -output-file=project.cc.json
```

```
ccsh modify foo.cc.json --set-root=/root/foo/
```

## Piped input

Instead of providing a cc.json file as input, a project can also be piped to the filter:

```
cat demo.cc.json | sh ccsh modify -p=2
```
