---
title: "Quality gate"
description: "Check a project against metric limits and dependency rules with ccsh gate, and fail a build, git hook or AI agent run on broken rules."
sidebar:
  label: "ccsh gate"
---

`ccsh gate` analyses a project and checks it against the rules in its `.codecharta.yml`: limits per metric and file,
and the dependency cycles and upward dependencies the Dependency Parser finds. It prints every broken rule, writes a
JSON report and exits with a code you choose, so a build, a git hook or an AI agent can act on the result.

:::caution[Experimental]
The quality gate is still in development. Its commands, its config format and its report may change between releases.
:::

## Quick start

```bash
ccsh gate --init      # analyse the project and write a .codecharta.yml whose rules are commented out
ccsh gate --doctor    # validate .codecharta.yml without analysing
ccsh gate             # analyse and check
```

`--init` lists every metric the analysis found, with the range of its values and what it measures, and one worked
rule that today's worst file still passes. It switches on all four analysers, runs them in parallel and sets the
exit codes. Every rule is commented out, so a fresh file analyses but checks nothing: uncomment what you want, and
copy the example rule for each metric you want to limit.

Called without arguments in a terminal, `ccsh gate` starts right away when the current folder has a
`.codecharta.yml`, and asks what to do otherwise.

## Options

| Option                | Effect                                                                    |
| --------------------- | ------------------------------------------------------------------------- |
| `FOLDER`              | the project folder (default: the current folder)                          |
| `-c, --config=<file>` | the config file (default: `.codecharta.yml` in the project folder)         |
| `--init`              | analyses the project and writes a config with its rules commented out     |
| `--doctor`            | validates the config without analysing the project                        |
| `-f, --force`         | lets `--init` overwrite an existing config                                |
| `-m, --map=<file>`    | checks this map instead of analysing the project                          |
| `-p, --parallel`      | runs the analysers at the same time                                       |
| `-q, --quiet`         | keeps the output of the analysers off the console                         |

`--init` and `--doctor` exclude each other, and `--map` and `--parallel` do nothing with `--doctor`.

## The analysis

The gate runs those of the [Raw Text Parser](/docs/parser/raw-text), [Unified Parser](/docs/parser/unified),
[Dependency Parser](/docs/parser/dependency) and [Domain Language Parser](/docs/parser/domain-language) that the
config switches on and that apply to the project, merges their maps into one and checks that map. The merged map
lands in the output folder next to the report, so you can open it in the visualization.

### Check an existing map

```bash
ccsh gate --map build/project.cc.json.gz          # check a map instead of analysing
ccsh gate --init --map build/project.cc.json.gz   # write the config from the metrics of that map
```

`--map` skips the analysis, so you can gate maps from any importer or parser, such as the Sonar Importer or the Git
Log Parser. `input`, `analysers` and `parallel` in the config are then not used. The dependency rules need the
analysis of the [Dependency Parser](/docs/parser/dependency): a map without it gets a warning that cycles and upward
dependencies could not be checked.

## The config

```yaml
input: .                          # the folder to analyse (default: the project folder)
output: .codecharta-gate-output   # where the map and report.json go
parallel: off                     # on runs the analysers at the same time, like --parallel
exclude:                          # files no rule checks, in .gitignore syntax
  - "**/generated/**"

analysers:                        # only the analysers listed as on (or with options) run
  rawtextparser: on
  dependencyparser: on
  domainlanguageparser: off
  unifiedparser:                  # options instead of on: the analyser's own options, without the leading --
    exclude:                      # a regular expression, as on the command line: leaves files out of the analysis
      - /generated/
    bypass-gitignore: true

exitCodes:                        # the exit code per severity; 2 is reserved for tool failures
  error: 1
  warning: 0

metrics:                          # checked per file
  rloc:
    warning:
      max: 200
      instruction: Watch the size, plan a split.
    error:
      max: 400
      instruction: Split the file by responsibility into smaller files.
  max_complexity_per_function:
    warning:
      max: 10
      instruction: Extract branches into named helper functions.

dependencies:
  cyclesBetweenFiles:
    severity: error
    instruction: Break the cycle by moving the shared part into its own file.
    ignore:                       # files or folders whose cycles are not reported
      - "**/generated/**"
    accept:                       # single known cycles, by the exact files they run through
      - files:
          - src/tree/TreeLevel.ts
          - src/tree/treeLevel.html
        reason: The tree renders its next level with its own component.
  cyclesInsideFiles:
    severity: warn
  upward:
    severity: warning
    ignore:
      - src/legacy
    accept:                       # single known upward dependencies, from one file to another
      - from: src/model/Node.kt
        to: src/model/MutableNode.kt
        reason: A node converts itself to its mutable form.

overrides:                        # other limits for the files the patterns match, applied in order
  - paths:
      - src/legacy/**
    metrics:
      rloc:
        error:
          max: 2000
  - paths:
      - "**/generated/**"
    metrics:
      rloc: off
```

A level, metric or setting you leave out is not checked or keeps its default.

### Metric rules

- A rule compares each file's own value with a `max` it must not exceed and/or a `min` it must not fall below, such
  as `coverage: { error: { min: 80 } }` on a map from the coverage importer. Folders are never summed up.
- A file is reported once, at the worst level it breaks.
- Per-function rules use the file metrics the Unified Parser writes, such as `max_complexity_per_function`.
- A rule for a metric the analysis did not produce is reported at the worst severity the rule sets, with the closest
  metric name the analysis did produce, so a typo cannot let the gate pass.
- **Overrides** apply in order to the files their patterns match. One replaces only the levels and fields it names,
  so `error: { max: 2000 }` keeps the warning and the instruction, and `off` drops the metric for those files.

### Dependency rules

- Each rule takes a `severity` of `error` or `warning` (`warn` for short).
- Cycles and upward dependencies are counted the way the dependency view in the visualization counts them, from
  what the [Dependency Parser](/docs/parser/dependency) marks between declarations.
- `cyclesBetweenFiles` and `cyclesInsideFiles` report each loop through declarations: for every dependency the
  parser marks cyclic, the shortest way back, each loop once.
- `upward` reports each dependency between declarations that runs against the levels of its folder.
- A loop or an upward dependency that touches a file `ignore` matches is not reported.
- `accept` lets one known cycle or upward dependency through and says why, where `ignore` would hide every one in
  its folder. A cycle is accepted when it runs through exactly the listed `files`, in any order: two or more for
  `cyclesBetweenFiles`, one for `cyclesInsideFiles`. An upward dependency is accepted from `from` to `to`, not the
  other way. The paths are exact, relative to `input`, never patterns. An entry the analysis no longer finds is
  reported as a warning, so you remove it once the cycle or dependency is gone.

### Paths and patterns

- `input` and `output` are relative to the project folder: the folder you pass to `ccsh gate`, otherwise the
  current folder, wherever the config file lives.
- Patterns in `exclude`, `overrides` and `ignore` follow `.gitignore` syntax relative to `input`, `!` included. A
  pattern that matches no file is reported as a warning, so a typo does not go unnoticed.
- `exclude` leaves files out of every rule and out of the dependency analysis the rules see. An analyser's own
  `exclude` option is a regular expression instead, and keeps the files out of the analysis itself.

### Analyser options

The options of an analyser are the long options of its own command, such as `ccsh unifiedparser --exclude`. A list
repeats the option, `true` sets a flag and `false` leaves it out. `--init` lists the options of every analyser, and
`--doctor` checks names and values the way the analyser itself would. The gate sets the output options itself.

### Instructions

Instructions tell the reader, often an AI agent, what to do about a broken rule. They appear on the console in a box
under their rule, wrapped at about 76 characters, and in the report. A YAML block (`instruction: |`) keeps the line
breaks and indentation you write.

### Validate the config

`--doctor` reports every problem with its line: unknown keys, wrong values, patterns that are no valid `.gitignore`
patterns, analyser options the analyser would refuse, a warning limit beyond its error limit, and rules or overrides
that would check nothing.

## The result

The rules are reported in the order the config lists them, below a line that marks the end of the analysis:

```
Analysing . with rawtextparser, unifiedparser, dependencyparser, domainlanguageparser ...

────────────────────────────────────────────────────────────────────────
Analysis done: 418 files with rawtextparser, unifiedparser, dependencyparser, domainlanguageparser in 4.2 s

ERROR  rloc > 400
┌ Instruction ────────────────────────────────────────
│ Split the file by responsibility into smaller files.
└─────────────────────────────────────────────────────
  src/parser/Parser.kt     812
  src/export/CsvWriter.kt  455

WARN   max_complexity_per_function > 10
┌ Instruction ─────────────────────────────────
│ Extract branches into named helper functions.
└──────────────────────────────────────────────
  src/parser/Parser.kt  37

ERROR  1 cycle between files
┌ Instruction ────────────────────────────────────────────────
│ Break the cycle by moving the shared part into its own file.
└─────────────────────────────────────────────────────────────
  cycle 1 of 1, 2 files in src/model/
    MutableNode.kt: MutableNode → Node.kt: Node
    Node.kt: Node               → MutableNode.kt: MutableNode

3 errors, 1 warning, 418 files checked
Report: ./.codecharta-gate-output/report.json
Map: ./.codecharta-gate-output/map.cc.json.gz
```

The first line appears with `--quiet` only. Each cycle is walked through the declarations it runs through, from the
folder its files share. The last line names the merged map, to open in the visualization.

`report.json` holds the exit code, the counts per severity and every finding with its rule, severity and
instruction:

- a metric finding with its path, metric, value and the `max` or `min` it breaks
- a cycle with its files and the declarations it runs through
- an upward dependency with its path, target and both declarations
- a pattern that matches no file, with the setting it is in

## Exit codes

The gate exits with the code the config maps the worst severity found to (by default 1 for an error and 0 for a
warning), with 0 when no rule is broken, and with 2 when the gate itself fails: no config, an invalid config or a
failing analyser.

## Related

- [Analyse a project in one step](/docs/analysis/analyse)
- [Dependency Parser](/docs/parser/dependency)
- [Dependency view](/docs/visualization/user-controls/dependency-view)
