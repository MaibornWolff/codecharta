---
title: "DependaCharta Importer"
description: "The deprecated DependaCharta importer turns a .dc.json file into file-level dependency edges. Use the Dependency Parser instead."
---

:::caution[Deprecated]
Use the [Dependency Parser](/docs/parser/dependency) (`ccsh dependencyparser`) instead. It runs DependaCharta's
analysis on your source code itself and keeps the declaration kinds, levels, cycles and upward dependencies this
importer flattens away. `ccsh dependachartaimport` still works, warns on every run and will be removed.
:::

The DependaCharta importer reads a DependaCharta `.dc.json` file and sums its class- and function-level dependencies
into edges between files.

## Quick start

```bash
ccsh dependachartaimport project.dc.json -o dependencies.cc.json
```

## Options

| Option                           | Description                                |
| -------------------------------- | ------------------------------------------ |
| `FILE`                           | the DependaCharta `.dc.json` file          |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file    |
| `-h, --help`                     | show the help and exit                     |

```text
Usage: ccsh dependachartaimport [-h] [-nc] [-o=<outputFile>] FILE
```

## Metrics

| Metric                  | Kind | Description                                             |
| ----------------------- | ---- | ------------------------------------------------------- |
| `dependencies`          | edge | number of code-level dependencies between two files     |
| `outgoing_dependencies` | file | number of code-level dependencies to other files        |
| `incoming_dependencies` | file | number of code-level dependencies from other files      |

## Related

- [Dependency Parser](/docs/parser/dependency): the replacement for this importer
