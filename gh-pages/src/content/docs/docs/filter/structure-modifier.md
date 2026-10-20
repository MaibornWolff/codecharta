---
title: "Structure Modifier"
description: "Change the folder structure of a cc.json map: cut out a subfolder as the new root, remove or move nodes, or rename the mcc metric."
---

The Structure Modifier (`ccsh modify`) changes the folder structure of a cc.json map without analysing the code again.
Cut out the part of a monorepo you care about, drop generated folders, move a folder to where it belongs, or rename
the `mcc` metric so maps from different sources line up.

## Quick start

```bash
ccsh modify project.cc.json.gz --set-root=/root/src -o src.cc.json
```

The output of `modify` is always uncompressed, so this writes `src.cc.json`.

## Options

| Option                             | Description                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `[FILE]`                           | input project file; reads piped input when omitted                                                                               |
| `-s, --set-root=<setRoot>`         | path within the project to be extracted as the new root                                                                          |
| `-r, --remove=<remove>`            | comma-separated list of nodes to be removed (when using PowerShell, the list either can't contain spaces or has to be in quotes) |
| `-f, --move-from=<moveFrom>`       | move the nodes in this folder ... (use paired with `--move-to`)                                                                  |
| `-t, --move-to=<moveTo>`           | ... into this destination folder (use paired with `--move-from`)                                                                 |
| `--rename-mcc[=<renameMcc>]`       | rename the `mcc` metric to `complexity`; with `sonar`, to `sonar_complexity`                                                     |
| `-p, --print-levels=<printLevels>` | deprecated; use [`ccsh inspect`](/docs/filter/inspection-tool) instead                                                           |
| `-o, --output-file=<outputFile>`   | output file, or empty for stdout; always uncompressed                                                                            |
| `-h, --help`                       | show the help and exit                                                                                                           |

```text
Usage: ccsh modify [-h] [--rename-mcc[=<renameMcc>]] [-f=<moveFrom>]
                   [-o=<outputFile>] [-p=<printLevels>] [-s=<setRoot>]
                   [-t=<moveTo>] [-r=<remove>]... [FILE]
```

Paths start with `/root`, the root folder of every map. Run [`ccsh inspect`](/docs/filter/inspection-tool) to see the
paths of a map.

## One action per run

Each run performs one action. Combine `--set-root`, `--remove` and `--move-from`/`--move-to` and `modify` reports
"More than one action specified" and writes nothing. Do not combine `--rename-mcc` with another action either: only
one of them takes effect. To do several changes, chain runs:

```bash
ccsh modify project.cc.json.gz --remove=/root/generated | ccsh modify --set-root=/root/src -o src.cc.json
```

## Actions

### Set a new root

`--set-root` keeps only the content of one folder, which becomes the new root:

```bash
ccsh modify project.cc.json.gz --set-root=/root/src/main -o main.cc.json
```

### Remove nodes

`--remove` drops nodes together with everything below them. Pass a comma-separated list or repeat the option:

```bash
ccsh modify project.cc.json.gz --remove=/root/docs,/root/build -o trimmed.cc.json
ccsh modify project.cc.json.gz --remove=/root/docs --remove=/root/build -o trimmed.cc.json
```

The root itself cannot be removed.

### Move nodes

`--move-from` together with `--move-to` moves everything inside the source folder into the destination folder. The
destination is created when it does not exist, and the source folder disappears. A node that already exists in the
destination with the same name and type is kept, and the moved one is dropped with a warning.

```bash
ccsh modify project.cc.json.gz --move-from=/root/src/lib --move-to=/root/libs -o moved.cc.json
```

### Rename `mcc`

```bash
ccsh modify project.cc.json.gz --rename-mcc -o renamed.cc.json
ccsh modify project.cc.json.gz --rename-mcc=sonar -o renamed.cc.json
```

The first command renames `mcc` to `complexity`, the second to `sonar_complexity`. A map without `mcc` stays as it is.

## Lenses and edges

When you set a root, remove or move nodes, the edges follow the new paths. The dependency and domain lenses move
along too: every remaining node keeps its entries, and the entries of removed nodes are dropped.

If the map carries data in a lens CodeCharta does not know, `modify` cannot tell which nodes that data belongs to. It
then refuses to set a root, remove or move nodes, writes nothing and exits with code 1. Restructure first and run the
analyser that writes that lens afterwards.

## Related

- [Inspection Tool](/docs/filter/inspection-tool): print the folder structure of a map
- [Merge Filter](/docs/filter/merge-filter): combine maps, or put several into one with `--large`
