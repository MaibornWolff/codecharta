---
title: "Merge Filter"
description: "Merge several cc.json files into one map, for example code metrics, git history and coverage, so you see all of them on the same buildings."
---

The Merge Filter combines several cc.json files into one map. Each parser and importer delivers its own metrics; after
the merge, every file carries all of them, for example `rloc` from the Unified Parser next to `number_of_commits` from
the Git Log Parser and `line_coverage` from the Coverage Importer. That is what you need to spot hotspots: large,
complex files that change often and lack tests.

## Quick start

```bash
ccsh merge code.cc.json.gz git.cc.json.gz -o merged.cc.json
```

The output is gzip-compressed by default, so this writes `merged.cc.json.gz`.

## Options

| Option                                              | Description                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `FILE or FOLDER...`                                 | files to merge; folders are searched recursively                                              |
| `--recursive`                                       | use the recursive merging strategy (default)                                                  |
| `--leaf`                                            | use the leaf merging strategy                                                                 |
| `-a, --add-missing`                                 | [leaf strategy] keep leaves that match nothing in the reference                               |
| `--ignore-case`                                     | ignore case when comparing node names                                                         |
| `-f`                                                | merge without asking when the inputs share no top-level folder                                |
| `--mimo`                                            | merge files with the same prefix into one output file per prefix                              |
| `-ld, --levenshtein-distance=<levenshteinDistance>` | [MIMO mode] Levenshtein distance for prefix suggestions (default: 3; 0 for no suggestions)     |
| `--large`                                           | merge all inputs into one file, each in a folder named after its file's prefix                |
| `-o, --output-file=<outputFile>`                    | output file, or empty for stdout; [MIMO mode] an existing output folder                       |
| `-nc, --not-compressed`                             | write plain JSON instead of a gzip file                                                       |
| `-h, --help`                                        | show the help and exit                                                                        |

```text
Usage: ccsh merge [-afh] [--ignore-case] [--large] [--leaf] [--mimo] [-nc]
                  [--recursive] [-ld=<levenshteinDistance>] [-o=<outputFile>]
                  FILE or FOLDER...
```

## What gets merged

The first input is the reference: its structure is the base of the output, and the other inputs are fitted into it
with one of two strategies.

- **Recursive** (default): the folder structures of all inputs are combined node by node, matched by name. Nodes that
  exist in only one input are kept.
- **Leaf**: only the files of the other inputs are placed into the reference structure. Use it when one input covers
  the whole project and the others only parts of it, or name files by shorter paths.

When several inputs carry the same metric for the same node, the output keeps the highest value.

All lenses are merged as well:

- **Metrics lens**: metric types and descriptions of all inputs are combined.
- **Dependency lens**: edges of all inputs are combined. Edges between the same two files become one edge with the
  attributes of both.
- **Domain lens**: the words of all inputs are combined. A word that two inputs describe keeps the higher frequency
  and the higher tf-idf score.
- **Other lenses**: a lens CodeCharta does not know is copied when it is identical in all inputs or only one input
  carries it. If two inputs carry different content for such a lens, the merge fails.

All inputs must be cc.json 2.x files. A legacy 1.x file makes the merge fail with a hint to upgrade it with
[`ccsh convert`](/docs/filter/convert).

When the inputs share no top-level folder at all, the merge warns and asks whether to go on. Pass `-f` to merge
anyway without the question, for example in a CI pipeline.

## Folders as input

A folder is searched recursively. Every file in it, except hidden files, is read; files that are not cc.json maps
are skipped with a warning.

```bash
ccsh merge reference.cc.json.gz ../reports/ -o merged.cc.json
```

## Leaf merging

Leaf merging places every file of the other inputs into the reference structure. For each file it looks, in this
order, for:

1. a reference file with the same path,
2. a reference file with the same content checksum, when exactly one has it,
3. the reference file whose path shares the longest tail with the file's path, when exactly one fits best.

A file that matches nothing, or whose match another file claims as well, is dropped with a warning. Pass `-a` to keep
such files at their own path instead.

A typical case is a JaCoCo coverage report, which only knows packages and not the full file paths:

```bash
ccsh merge unified.cc.json.gz coverage.cc.json.gz --leaf --ignore-case -o merged.cc.json
```

The coverage metrics land on the files of `unified.cc.json.gz`.

## MIMO merge: multiple inputs, multiple outputs

`--mimo` groups the input files by their prefix, the part of the file name before the first dot, and merges each
group into its own file `<prefix>.merge.cc.json.gz`. For example, `shop.code.cc.json.gz` and `shop.git.cc.json.gz`
become `shop.merge.cc.json.gz`.

```bash
ccsh merge reports/ --mimo -ld 0 -f -o merged/
```

With `--mimo`, `-o` names an existing folder for the output files; without it, they go into the current directory.
Prefixes that are close to each other, within the Levenshtein distance, are offered as one group and the command
asks which files to include. Pass `-ld 0` and `-f` to run without questions.

## Large merge

`--large` merges several maps into one, each in its own top-level folder named after the prefix of its file name:

```bash
ccsh merge aa.cc.json.gz bb.cc.json.gz cc.cc.json.gz --large -o all.cc.json
```

```text
root
- aa
- bb
- cc
```

The prefixes must be unique across all inputs, otherwise the merge stops. The dependency and domain lenses move along
into the new folders. An input that carries data in a lens CodeCharta does not know cannot be moved this way and
stops the merge.

## Related

- [Convert Tool](/docs/filter/convert): upgrade legacy 1.x files before merging
- [Coverage Importer](/docs/importer/coverage): coverage maps to merge with leaf merging
- [Inspection Tool](/docs/filter/inspection-tool): check the folder structure of the merged map
