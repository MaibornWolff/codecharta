---
title: "Inspection Tool"
description: "Print the folder structure of a cc.json map in the console with ccsh inspect, to check paths before you merge or modify a map."
---

The Inspection Tool (`ccsh inspect`) prints the folder structure of a cc.json map in the console, as a tree of node
names. Use it to check what a map contains and which paths to pass to [`ccsh modify`](/docs/filter/structure-modifier)
or to expect after a merge.

## Quick start

```bash
ccsh inspect project.cc.json.gz --levels=2
```

```text
root
- README.md
- src
- - a.ts
- - lib
```

Each `- ` marks one level below the root. The output shows node names only, no metrics.

## Options

| Option                              | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| `[FILE]`                            | input project file; reads piped input when omitted                  |
| `-l, -d, --depth, --levels=<level>` | number of levels below the root to print (default: 1)               |
| `-h, --help`                        | show the help and exit                                              |

```text
Usage: ccsh inspect [-h] [-l=<level>] [FILE]
```

## Piped input

Instead of a file, pipe a map into the tool:

```bash
cat project.cc.json | ccsh inspect
```

If a named file cannot be read, the tool exits with code 1.

## Related

- [Structure Modifier](/docs/filter/structure-modifier): change the structure you see here
- [Validation Tool](/docs/filter/validation-tool): check that a file is a valid cc.json file
