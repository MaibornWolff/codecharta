---
title: "Convert Tool"
description: "Upgrade a legacy cc.json 1.x file to the cc.json 2.x format with ccsh convert, so you can merge, modify and inspect it with the current shell."
---

The Convert Tool (`ccsh convert`) upgrades a cc.json file in the legacy 1.x format to the 2.x `{ meta, files, lenses }`
format. You need it for maps written by an older CodeCharta version: every other `ccsh` command reads 2.x only and
stops on a 1.x file with this hint:

```text
This is a legacy cc.json 1.x file. Run `ccsh convert <file>` to upgrade it to the 2.0 format first.
```

The visualization opens 1.x and 2.x files directly, so you only need `convert` for the command line.

## Quick start

```bash
ccsh convert legacy.cc.json -o upgraded.cc.json
```

The output is gzip-compressed by default, so this writes `upgraded.cc.json.gz`. Add `-nc` for a plain
`upgraded.cc.json`.

## Options

| Option                           | Description                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| `[FILE]`                         | input project file (1.5 or 2.x); reads piped input when omitted      |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted                            |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file                               |
| `-h, --help`                     | show the help and exit                                                |

```text
Usage: ccsh convert [-h] [-nc] [-o=<outputFile>] [FILE]
```

## Piped input

Instead of a file, pipe a map into the tool:

```bash
cat legacy.cc.json | ccsh convert -o upgraded.cc.json
```

## What is not carried over

`blacklist` and `markedPackages` are view settings of the visualization that the 2.x format does not hold. If the
source file contains either, `convert` drops them and warns, so you know to apply them again in the visualization after
loading the converted file.

The warning about dropped `markedPackages` needs the source as a file argument. With piped input only the dropped
`blacklist` entries are reported.

## Related

- [Validation Tool](/docs/filter/validation-tool): check the converted file
- [Merge Filter](/docs/filter/merge-filter): merge the converted file with current maps
