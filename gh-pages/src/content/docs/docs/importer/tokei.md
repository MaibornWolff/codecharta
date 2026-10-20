---
title: "Tokei Importer"
description: "Import the JSON output of Tokei into CodeCharta to map lines of code, comment lines and empty lines for more than 200 languages."
---

The Tokei importer turns the JSON output of [Tokei](https://github.com/XAMPPRocky/tokei) into a cc.json map. Tokei
counts code, comment and empty lines quickly and knows
[more than 200 languages](https://github.com/XAMPPRocky/tokei?tab=readme-ov-file#supported-languages). Use it when
you need a size map of a codebase in a language the CodeCharta parsers do not cover.

## Quick start

Run Tokei in your project's root folder and pipe its JSON straight into the importer:

```bash
tokei . --output json | ccsh tokeiimporter -o tokei.cc.json
```

Or save the Tokei result first:

```bash
tokei . --output json > tokei_results.json
ccsh tokeiimporter tokei_results.json -o tokei.cc.json
```

## Options

| Option                             | Description                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `[FILE]`                           | the JSON file Tokei wrote; reads piped input when omitted                       |
| `-r, --root-name=<rootName>`       | the folder you passed to Tokei, which is cut from every path (default `.`)      |
| `--path-separator=<pathSeparator>` | separator between folders in Tokei's paths; detected on its own when omitted   |
| `-o, --output-file=<outputFile>`   | output file; prints to stdout when omitted                                      |
| `-nc, --not-compressed`            | write plain JSON instead of a gzip file                                         |
| `-h, --help`                       | show the help and exit                                                          |

```text
Usage: ccsh tokeiimporter [-h] [-nc] [-o=<outputFile>]
                          [--path-separator=<pathSeparator>] [-r=<rootName>]
                          [FILE]
```

When you run Tokei on a subfolder, pass the same folder with `--root-name` so the map starts inside it:

```bash
tokei src --output json | ccsh tokeiimporter -r src -o src.cc.json
```

## Metrics

| Metric          | Description                                       |
| --------------- | ------------------------------------------------- |
| `loc`           | all lines of the file: code, comments and empty lines |
| `rloc`          | lines that contain code                           |
| `comment_lines` | lines that contain only comments                  |
| `empty_lines`   | empty lines                                       |

## Install Tokei

Tokei offers binaries for Linux, macOS and Windows, and packages for most package managers. See the
[Tokei installation guide](https://github.com/XAMPPRocky/tokei#installation). With a Rust toolchain you can also
install it with `cargo install tokei`. JSON output is part of every build.

## Related

- [Unified Parser](/docs/parser/unified): size and complexity metrics for the languages CodeCharta parses itself
- [Raw Text Parser](/docs/parser/raw-text): line and indentation metrics for any text file
- [Merge Filter](/docs/filter/merge-filter): combine the Tokei map with other maps
