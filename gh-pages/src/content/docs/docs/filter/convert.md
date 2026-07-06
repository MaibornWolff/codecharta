---
title: "Convert"
---

## Convert

`ccsh` now reads and writes the **cc.json 2.0** `{ meta, files, lenses }` format. The Convert tool is the on-ramp for older files: it upgrades a legacy 1.x `.cc.json` file to the 2.0 format.

You need it whenever you have a `.cc.json` produced by an older CodeCharta version (or downloaded from an earlier showcase) and want to use it with the current shell. Every other command — `merge`, `edgefilter`, `modify`, `inspect` and the importers that combine projects — reads 2.0 only and will stop with a hint to run `convert` if you feed it a 1.x file:

```
This is a legacy cc.json 1.x file. Run `ccsh convert <file>` to upgrade it to the 2.0 format first.
```

The visualization opens both old (1.x) and new (2.0) files directly, so you only need `convert` for the command-line tools.

#### Usage and Parameters

| Parameters                       | Description                                              |
|----------------------------------|---------------------------------------------------------|
| `FILE`                           | input project file (1.5 or 2.0)                         |
| `-o, --output-file=<outputFile>` | output File (or empty for stdout)                       |
| `-nc, --not-compressed`          | save uncompressed output File                           |
| `-h, --help`                     | displays help and exits                                 |

```
Usage: ccsh convert [-h] [-nc] [-o=<outputFile>] [FILE]
```

### Examples

```
ccsh convert legacy.cc.json -o=upgraded.cc.json
```

### Piped input

Instead of providing a file as input, a project can also be piped in:

```
cat legacy.cc.json | ccsh convert -o=upgraded.cc.json
```

### What is not carried over

`blacklist` and `markedPackages` are visualization view state that the 2.0 format does not carry. If the source file contains either, `convert` drops them and prints a warning so you know to re-apply that curation in the visualization after loading the converted file.
