---
title: "Edge Filter"
description: "Turn the edge metrics of a cc.json map into metrics on every file, so coupling and dependency counts can drive area, height and color."
---

The Edge Filter adds up the attributes of all edges that touch a file and writes the result onto the file as a
metric. Edge metrics, such as `pairingRate` from the [Code Maat Importer](/docs/importer/code-maat), are then
available like any other file metric for the area, height and color of the buildings.

## Quick start

```bash
ccsh edgefilter edges.cc.json.gz -o visual_edges.cc.json
```

The output of the Edge Filter is always uncompressed, so this writes `visual_edges.cc.json`.

## Options

| Option                             | Description                                         |
| ---------------------------------- | --------------------------------------------------- |
| `FILE`                             | the cc.json file with edges                         |
| `--path-separator=<pathSeparator>` | path separator (default `/`)                        |
| `-o, --output-file=<outputFile>`   | output file, or empty for stdout; always uncompressed |
| `-h, --help`                       | show the help and exit                              |

```text
Usage: ccsh edgefilter [-h] [-o=<outputFile>]
                       [--path-separator=<pathSeparator>] FILE
```

## How edge attributes are aggregated

For every file, the filter takes all edges that start or end at it and combines each edge attribute into one metric
of the same name:

- **Absolute** attributes, such as `avgCommits`, are summed.
- **Relative** attributes, such as `pairingRate`, are averaged.

An attribute without a type counts as absolute. The results are whole numbers. The edges themselves stay in the
output, and a file that an edge names but the map lacks is added as a node.

## Example

Two edges touch `app/codeCharta.html`:

| From                  | To                    | `pairingRate` | `avgCommits` |
| --------------------- | --------------------- | ------------- | ------------ |
| `app/codeCharta.html` | `app/codeCharta.scss` | 56            | 10           |
| `app/testVille.html`  | `app/codeCharta.html` | 42            | 8            |

`pairingRate` is relative and `avgCommits` absolute, so after the filter the file carries (excerpt of the metrics
lens):

```json
"6b185a8cc9433de8": { "pairingRate": 49, "avgCommits": 18 }
```

`app/codeCharta.scss` and `app/testVille.html` each touch only one edge and keep its values.

## Related

- [Code Maat Importer](/docs/importer/code-maat): temporal coupling as edges
- [Merge Filter](/docs/filter/merge-filter): combine the result with other maps
