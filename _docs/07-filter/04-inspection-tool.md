---
permalink: /docs/filter/inspection-tool
title: "Inspection Tool"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---
# Inspection

The Inspection Tool is used to inspect the structure of .cc.json files. It enables to:

- Print the hierarchy of the project: Prints the hierarchy in a human-readable format.

### Usage and Parameters

| Parameters                                   | Description                                                                          |
|----------------------------------------------|--------------------------------------------------------------------------------------|
| `FILE`                                       | file to inspect                                                                      |
| `-h, --help`                                 | Displays help and                                                                    |
| `-l, --levels, -d, --depth=<numberOfLevels>` | show first x layers of project hierarchy (if not specified, prints first two levels) |
```
Usage: ccsh inspect [-l=<numberOfLevels>] [FILE]
```

## Examples

```
ccsh inspect --levels=2 foo.cc.json
```


## Piped input

Instead of providing a cc.json file as input, a project can also be piped to the filter:

```
cat demo.cc.json | sh ccsh inspect
```
