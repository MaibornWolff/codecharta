---
title: "CodeCharta Shell (ccsh)"
description: "Install the CodeCharta Shell, map a codebase in one step and find every ccsh parser, importer, filter and tool for your code metrics."
sidebar:
  label: "Overview"
---

The CodeCharta Shell (`ccsh`) turns a codebase into a map you can open in the visualization. It measures source
code, reads the git or svn history, imports metrics from tools such as SonarQube or a coverage report, and merges
the results into one `.cc.json` file. Everything runs on your machine.

## Install

You need Node 22.19 or newer and Java 22 or newer.

```bash
npm i -g codecharta-analysis
ccsh -h
```

`ccsh -h` lists every command and `ccsh -v` prints the installed version. If the shell does not find `ccsh` right
after the install, open a new terminal. To run ccsh without installing Java and Node, use the
[Docker image](/docs/overview/getting-started/docker).

## Quick start

```bash
ccsh analyse path/to/project
```

[`ccsh analyse`](/docs/analysis/analyse) runs every code parser that applies to the folder, adds its git or svn
history and writes `project.cc.json.gz` into the current folder. Open that file in the
[Web Studio](https://codecharta.com/visualization/app/index.html).

## Commands

Each command has its own `-h`, such as `ccsh unifiedparser -h`.

| Group     | Command                | What it does                                                                     |
| --------- | ---------------------- | -------------------------------------------------------------------------------- |
| Parsers   | `unifiedparser`        | [code metrics such as complexity and rloc for many languages](/docs/parser/unified) |
|           | `rawtextparser`        | [lines and indentation of any text file](/docs/parser/raw-text)                  |
|           | `domainlanguageparser` | [the domain vocabulary of the code](/docs/parser/domain-language)                |
|           | `dependencyparser` (experimental) | [file and declaration dependencies, cycles and levels](/docs/parser/dependency) |
|           | `gitlogparser`         | [history metrics from git](/docs/parser/git-log)                                 |
|           | `svnlogparser`         | [history metrics from an svn log](/docs/parser/svn-log)                          |
| Importers | `sonarimport`          | [metrics from a SonarQube server](/docs/importer/sonar)                          |
|           | `tokeiimporter`        | [line counts from Tokei](/docs/importer/tokei)                                   |
|           | `coverageimport`       | [test coverage from coverage reports](/docs/importer/coverage)                   |
|           | `csvimport`            | [any metric from a CSV file](/docs/importer/csv)                                 |
|           | `sourcemonitorimport`  | [metrics from SourceMonitor](/docs/importer/sourcemonitor)                       |
|           | `codemaatimport`       | [temporal coupling from Code Maat](/docs/importer/code-maat)                     |
|           | `dependachartaimport` (deprecated) | [DependaCharta `.dc.json` files](/docs/importer/dependacharta)       |
| Filters   | `merge`                | [combines several maps into one](/docs/filter/merge-filter)                      |
|           | `edgefilter`           | [adds edge attributes to the files they connect](/docs/filter/edge-filter)       |
|           | `modify`               | [moves, removes or re-roots parts of a map](/docs/filter/structure-modifier)     |
| Tools     | `analyse`              | [maps a codebase with an opinionated selection of parsers and options to get started](/docs/analysis/analyse) |
|           | `gate` (experimental)  | [checks a project against the rules in its `.codecharta.yml`](/docs/analysis/quality-gate) |
|           | `inspect`              | [prints the folder structure of a map](/docs/filter/inspection-tool)             |
|           | `convert`              | [upgrades a 1.x file to the current format](/docs/filter/convert)                |
|           | `check`                | [validates a `.cc.json` file](/docs/filter/validation-tool)                      |
| Exporter  | `csvexport`            | [writes the metrics of a map to CSV](/docs/exporter/csv)                         |

The metrics each command writes are listed on its page. For a short guide to the metrics worth starting with, see
[Available metrics](/docs/analysis/metrics).

## Interactive mode

Started without arguments, `ccsh` asks for a file, folder or Sonar URL. For a folder it first offers to map
everything with `ccsh analyse`. Decline, and it lists the analysers that apply to the path: the Git Log, SVN Log,
Unified, Raw Text, Domain Language and Dependency Parsers, the Sonar and Coverage Importers, and the DependaCharta
Importer. Pick any of them with the space bar and answer their questions.

When every analyser is configured, `ccsh` prints the command line of each one for later use and offers to run them
in parallel. When several ran and all of them succeeded, it offers to merge their results into `mergedResult.cc.json` in a
folder you name, so write all results into that folder.

`ccsh -i` skips the path and lets you pick any command from a list. A command called without arguments, such as
`ccsh sonarimport`, asks for its own options.

## Output files

Every command writes the `.cc.json` 2.1 format (`{ meta, files, lenses }`), gzip-compressed by default: `-o
project.cc.json` writes `project.cc.json.gz`, so later commands need the `.gz` name. Add `-nc` for an uncompressed
file. Without `-o`, the result goes uncompressed to standard output.

Importers and filters read 2.x files only and stop with a hint at `ccsh convert` when they get a 1.x file. Upgrade
an old file once with [`ccsh convert`](/docs/filter/convert). The visualization opens both.

## Combine metrics

To see code metrics and history in one map, merge the results of several commands with
[`ccsh merge`](/docs/filter/merge-filter):

```bash
ccsh unifiedparser . -o code.cc.json
ccsh gitlogparser repo-scan --repo-path . -o history.cc.json
ccsh merge code.cc.json.gz history.cc.json.gz -o project.cc.json
```

Some commands merge a project piped into them, so you can skip the files in between:

- The Unified, Raw Text, Domain Language and Dependency Parsers merge a piped project when you add `-` as an extra
  argument: `ccsh unifiedparser . | ccsh rawtextparser . - -o project.cc.json`.
- The Git Log and SVN Log Parsers and the Sonar and Coverage Importers merge a piped project on their own.
- `ccsh modify`, `ccsh inspect` and `ccsh convert` read a piped project when you give no file:
  `cat project.cc.json | ccsh inspect --levels=2`.
- `ccsh merge` and `ccsh edgefilter` read files only.

For a metric no command produces, write it to a CSV file and import it with the
[CSV Importer](/docs/importer/csv). That is safer than editing a `.cc.json` file by hand. If you do edit one,
`ccsh check` validates it.

## Files a parser cannot analyse

The Unified, Dependency and Domain Language Parsers leave a file whose analysis fails out of the map. After the run
they warn once per cause, with the number of files it hit and the first five of them. They stop with exit code 1
and write no map when no file could be analysed at all, or when a grammar or the native tree-sitter library cannot
be used.

## Analyse with simplecc.sh

The [Docker image](/docs/overview/getting-started/docker) ships `simplecc.sh`, a script that runs the Unified, Raw
Text, Domain Language, Dependency and Git Log Parsers plus the external tools it finds (Tokei, `complexity` and,
with a token, SonarQube) and merges everything into one map. Tools that are missing or do not apply are skipped and
listed at the end. Run it from the folder that contains your project:

```bash
simplecc.sh my-project                          # writes my-project.cc.json.gz into the current folder
simplecc.sh my-project sqp_1234567890abcdef     # also scans the project with SonarQube and imports its metrics
```

| Option              | Effect                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| `-l, --leaf-merge`  | merges with the leaf strategy instead of the recursive one                             |
| `-s, --sonar-url`   | the SonarQube server (default: `http://localhost:9000`, or the `SONAR_URL` variable)   |

The optional second argument is a SonarQube user token. Without it, the Sonar steps are skipped. The script needs
`ccsh`; `git`, `tokei`, `complexity`, `sonar-scanner` and `jq` (for the SonarQube scan) are optional. Outside Docker, `ccsh analyse` covers the
parsers without any extra tool.

## Related

- [Analyse a project in one step](/docs/analysis/analyse)
- [Analysis examples](/docs/analysis/examples)
- [Quality gate](/docs/analysis/quality-gate)
