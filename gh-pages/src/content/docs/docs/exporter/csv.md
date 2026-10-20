---
title: "CSV Exporter"
description: "Export the code metrics of a cc.json map to CSV, one row per file, to analyse them in a spreadsheet or feed them into your own tools."
---

The CSV exporter writes the metrics of a cc.json map as a CSV table: one row per file, one column per metric. Use it
to sort and filter metrics in a spreadsheet, to compare runs with your own scripts or to hand numbers to a tool that
does not read cc.json.

## Quick start

```bash
ccsh csvexport project.cc.json.gz -o project.csv
```

Leave out `-o` to print the CSV to the console.

## Options

| Option                                | Description                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `FILE or FOLDER...`                   | one or more cc.json files, or folders that contain them                     |
| `--depth-of-hierarchy=<maxHierarchy>` | number of `dir` columns that split up the path (default `10`, at least `0`) |
| `-o, --output-file=<outputFile>`      | output file; `.csv` is added when missing; prints to stdout when omitted    |
| `-h, --help`                          | show the help and exit                                                      |

```text
Usage: ccsh csvexport [-h] [--depth-of-hierarchy=<maxHierarchy>]
                      [-o=<outputFile>] FILE or FOLDER...
```

## Output

- Every node that carries at least one metric gets one row.
- `path` holds the path of the node below the root, with `/` between folders, `name` its name and `type` whether it
  is a `File` or a `Folder`.
- One column per metric follows. A node without a value for a metric leaves that cell empty.
- `dir0`, `dir1`, and so on hold the folders of the path one by one, so you can group rows by folder in a
  spreadsheet. `--depth-of-hierarchy` sets how many of these columns there are. A negative value is rejected.

```csv
path,name,type,rloc,mcc,coverage,dir0,dir1
README.md,README.md,File,3.0,,,,
src/a.ts,a.ts,File,10.0,2.0,80.0,src,
src/lib/b.ts,b.ts,File,20.0,5.0,,src,lib
```

The example above comes from `--depth-of-hierarchy=2`.

## Several inputs

With several files, or a folder, each map is written one after another into the same CSV file, every map with its own
header line. Pass `-o` for several inputs: printed to the console, only the first map appears.

:::caution
In a folder, the exporter picks up only files that end in `.cc.json`. Gzip files such as `project.cc.json.gz` are
skipped there. Name them directly to export them, or write them with `-nc`.
:::

## Related

- [CSV Importer](/docs/importer/csv): the way back, from CSV to cc.json
- [Inspection Tool](/docs/filter/inspection-tool): look at the folder structure of a map in the console
