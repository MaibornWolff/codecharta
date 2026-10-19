---
title: "Analyse"
---

`ccsh analyse` maps a codebase in one step: it runs every parser that applies to the folder, adds the git or svn
history and merges the results into one map you can open in the visualization. It needs no config file.

```bash
ccsh analyse                  # map the current folder into <folder name>.cc.json.gz
ccsh analyse path/to/project  # map another folder; the map still lands in the current folder
```

### What it runs

- The [Raw Text Parser](/docs/parser/raw-text), [Unified Parser](/docs/parser/unified),
  [Dependency Parser](/docs/parser/dependency) and [Domain Language Parser](/docs/parser/domain-language), each when
  it applies to the folder.
- The [Git Log Parser](/docs/parser/git-log) (`repo-scan`) when the folder is the root of a git repository.
- The [SVN Log Parser](/docs/parser/svn-log) when the folder is the root of an svn working copy. `ccsh analyse` runs
  `svn log --verbose --non-interactive` itself, so `svn` has to be on the `PATH`.

The history only adds metrics to the files the code parsers mapped: excluded, ignored and deleted files do not come
back through it.

### Options

| Option                     | Effect                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `-o, --output-file=<file>` | where to write the map (default: `<folder name>.cc.json.gz` in the current folder)  |
| `-e, --exclude=<patterns>` | comma-separated regex patterns of files and folders that every code parser skips    |
| `--without=NAME[,NAME...]` | parsers or histories to leave out, such as `--without=dependencyparser,svn`         |
| `-p, --parallel`           | runs the analysers at the same time                                                 |
| `-nc, --not-compressed`    | writes the map uncompressed                                                         |
| `-q, --quiet`              | keeps the output of the analysers off the console                                   |

### What is not in the map

The last lines of the output, after the `Map:` line, name every parser and history that is not in the map, and why:

```
Map: ./shop.cc.json.gz
Not in the map:
  dependencyparser: found no file it reads in .
  git history: . is inside the git repository /home/me/shop, not at its root. Analyse /home/me/shop to include it.
  svn history: no svn working copy found for .
```

A history is missing when the folder is in no repository or working copy, when it lies inside one but not at its root
(analyse the root instead), when `svn` is not installed, or when `svn log` or the git log fails. The map is written
either way.

The svn history only matches the code when the working copy is a checkout of the trunk of a single-project
repository. For a checkout of a branch or of a project inside a multi-project repository, the map has no svn metrics.

### Interactive mode

Started without arguments, `ccsh` asks for a folder and then first offers to analyse everything with `ccsh analyse`,
before the list of single analysers.

`ccsh analyse` exits with 0 when the map is written, with 1 when the analysis fails and with 2 when the command line
cannot be parsed.
