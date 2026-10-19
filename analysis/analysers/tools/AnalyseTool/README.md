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
| `--without=NAME[,NAME...]` | parsers or histories to leave out, such as `dependencyparser,svn`                   |
| `-p, --parallel`           | runs the analysers at the same time                                                 |
| `-nc, --not-compressed`    | writes the map uncompressed                                                         |
| `-q, --quiet`              | keeps the output of the analysers off the console                                   |
| `-h, --help`               | displays help and exits                                                             |

In a git repository it runs `gitlogparser repo-scan`; in an svn working copy it runs
`svn log --verbose --non-interactive` itself and reads the log with `svnlogparser`. The history only adds metrics to
the files the code parsers mapped. When the history cannot be included, for example because the folder lies inside a
repository but not at its root, the map is still written and the last lines of the output say why.

```
Usage: ccsh analyse [-hpq] [-nc] [-o=<outputFile>] [-e=<excludePatterns>]...
                    [--without=NAME[,NAME...]]... [FOLDER]
```

## Examples

```
ccsh analyse
ccsh analyse path/to/project -o build/project.cc.json.gz
ccsh analyse --exclude=generated,vendor --parallel
ccsh analyse --without=domainlanguageparser,git
```

Exit codes: 0 when the map is written, 1 when the analysis fails.
