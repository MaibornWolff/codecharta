---
title: "Install with npm"
description: "Install the CodeCharta Shell with npm, map your codebase with ccsh analyse and open the result in the Web Studio."
sidebar:
  label: npm
---

The CodeCharta Shell (`ccsh`) is published on npm as `codecharta-analysis`. Install it once and you can analyse any
project from your terminal.

## Prerequisites

- Node **>= 22.19**
- Java **>= 22**

## Install the CodeCharta Shell

```bash
npm i -g codecharta-analysis
ccsh -h
```

`ccsh -h` lists every command. If your terminal does not find `ccsh` right after the install, open a new one.

## Map a project

Run [`ccsh analyse`](/docs/analysis/analyse) in the project folder:

```bash
cd my-project
ccsh analyse
```

It runs an opinionated selection of parsers and options to get you started, adds the git or svn history when the
folder is the root of a repository, and merges everything into `my-project.cc.json.gz` in the current folder. To analyse another folder, pass
its path; the map still lands in the current folder:

```bash
ccsh analyse path/to/project -o project.cc.json.gz
```

The last lines of the output name every parser or history that is not in the map, and why.

### Run a single analyser

To control exactly which metrics end up in the map, run the analysers yourself and merge their results. For example,
the [Unified Parser](/docs/parser/unified) alone:

```bash
ccsh unifiedparser . -o metrics.cc.json
```

Output is gzip-compressed by default, so this writes `metrics.cc.json.gz`. `ccsh -i` starts the interactive mode, which
suggests the analysers that fit a folder and asks for their options. See
[CodeCharta Shell](/docs/analysis/codecharta-shell) for every parser, importer and filter.

## Open the map

Open the [Web Studio](https://codecharta.com/visualization/app/index.html) and load `my-project.cc.json.gz` with the
folder button (**Load cc.json files**) in the top bar. See
[Loading maps](/docs/visualization/user-controls/loading-maps) for loading several maps at once.
