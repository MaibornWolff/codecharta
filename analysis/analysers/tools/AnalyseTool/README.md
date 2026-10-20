# Analyse

`ccsh analyse` maps a codebase in one step. It runs every applicable code parser (`rawtextparser`, `unifiedparser`,
`dependencyparser`, `domainlanguageparser`), adds the git or svn history when the folder is the root of a repository
or working copy, and merges everything into one map. It needs no config file.

Full documentation: https://maibornwolff.github.io/codecharta/docs/analysis/analyse

### Usage and Parameters

| Parameter                  | Description                                                                         |
|----------------------------|-------------------------------------------------------------------------------------|
| `FOLDER`                   | project folder (default: the current folder)                                        |
| `-o, --output-file=<file>` | output file (default: `<folder name>.cc.json.gz` in the current folder)             |
| `-e, --exclude=<patterns>` | comma-separated regex patterns of files and folders that every code parser skips    |
| `--without=NAME[,NAME...]` | parsers or histories to leave out, such as `dependencyparser,svn` or `gitlogparser` |
| `--local-changes`          | maps only the files that differ from the remote tracking branch                     |
| `--commit=REF`             | maps the codebase at a git commit, tag, branch or date; the map name starts with its short hash |
| `-p, --parallel`           | runs the analysers at the same time                                                 |
| `-nc, --not-compressed`    | writes the map uncompressed                                                         |
| `-q, --quiet`              | keeps the output of the analysers off the console                                   |
| `-h, --help`               | displays help and exits                                                             |

In a git repository it runs `gitlogparser repo-scan`; in an svn working copy it runs
`svn log --verbose --non-interactive` itself and reads the log with `svnlogparser`. The history only adds metrics to
the files the code parsers mapped. The svn history only matches the code when the working copy is a checkout of the
trunk of a single-project repository; for a branch or a multi-project layout the map has no svn metrics.

`--local-changes` leaves out `dependencyparser` and `domainlanguageparser`, which need every file of the project.
`--commit` reads the code and the git history from one temporary worktree at that commit and leaves out the svn
history. The two options cannot be combined.

The last lines of the output, after `Map:`, name every parser and history that is not in the map and why, for example
a folder inside a repository but not at its root. The map is written either way.

```
Usage: ccsh analyse [-hpq] [--local-changes] [-nc] [--commit=REF]
                    [-o=<outputFile>] [-e=<excludePatterns>]...
                    [--without=NAME]... [FOLDER]
```

## Examples

```
ccsh analyse
ccsh analyse path/to/project -o build/project.cc.json.gz
ccsh analyse --exclude=generated,vendor --parallel
ccsh analyse --without=domainlanguageparser,git
ccsh analyse --local-changes
ccsh analyse --commit=v2.0.0
```

Exit codes: 0 when the map is written, 1 when the analysis fails, 2 when the command line cannot be parsed.
