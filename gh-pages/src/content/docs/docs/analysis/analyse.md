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

### When the history is missing

If the history cannot be included, the map is still written without it, and the last lines of the output, after the
`Map:` line, say why. This happens when the folder lies inside a repository or working copy but not at its root
(analyse the root instead), when `svn` is not installed, or when `svn log` or the git log fails.

### Interactive mode

Started without arguments, `ccsh` asks for a folder and then first offers to analyse everything with `ccsh analyse`,
before the list of single analysers.

`ccsh analyse` exits with 0 when the map is written and with 1 when the analysis fails.
