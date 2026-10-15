---
title: "Quality Gate"
---

`ccsh gate` analyses a project and checks it against the rules in its `.codecharta.yml`: limits per metric and
file, and the dependency cycles and upward dependencies the Dependency Parser finds. It prints every broken rule, writes a JSON report and exits
with a code you choose, so a build, a git hook or an AI agent can act on the result.

:::caution[Experimental]
The quality gate is still in development. Its commands, its config format and its report may change between releases.
:::

### Getting started

```bash
ccsh gate --init      # analyse the project and write a fully commented-out .codecharta.yml
ccsh gate --doctor    # validate .codecharta.yml without analysing
ccsh gate             # analyse and check
```

Each takes the project folder as an optional argument (default: the current folder) and `--config <file>` to read
the config from elsewhere, `--quiet` to keep the output of the analysers off the console, and `--parallel` to run the analysers at the same time. `--init` refuses to overwrite an existing config unless you add `--force`. Called
without arguments in a terminal, `ccsh gate` starts right away when the current folder has a `.codecharta.yml`,
and asks what to do otherwise.

`--init` lists every metric the analysis found, with the lowest and highest value as a comment, so you can pick
limits. Everything in the generated file is commented out: a fresh file checks nothing. Uncomment what you want.

### The analysis

The gate runs those of the [Raw Text Parser](/docs/parser/raw-text), [Unified Parser](/docs/parser/unified),
[Dependency Parser](/docs/parser/dependency) and [Domain Language Parser](/docs/parser/domain-language) that apply to
the project, merges their maps into one and checks that map. The merged map lands in the output folder next to the
report, so you can open it in the visualization.

### Checking an existing map

```bash
ccsh gate --map build/project.cc.json.gz          # check a map instead of analysing
ccsh gate --init --map build/project.cc.json.gz   # write the config from the metrics of that map
```

`--map` skips the analysis and checks the given map, so you can gate maps from any importer or parser, such as the
Sonar importer or the Git Log Parser. `input`, `analysers` and `parallel` in the config are then not used. The cycle
rules need the dependency analysis of the [Dependency Parser](/docs/parser/dependency); a map without it gets a warning
that cycles and upward dependencies could not be checked.

### The config

```yaml
input: .                          # the folder to analyse, relative to this file (default: its folder)
output: .codecharta-gate-output   # where the map and report.json go, relative to this file
parallel: off                     # on runs the analysers at the same time, like --parallel

analysers:                        # every applicable analyser runs unless switched off
  domainlanguageparser: off
  unifiedparser:                  # options instead of on: the analyser's own options, without the leading --
    exclude:
      - generated/
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

cycles:
  betweenFiles:
    severity: error
    instruction: Break the cycle by moving the shared part into its own file.
    ignore:                       # files or folders whose cycles are not reported
      - "**/generated/**"
  insideFiles:
    severity: warning
  upward:
    severity: warning
    ignore:
      - src/legacy

overrides:                        # other limits for the files the patterns match; the last match wins
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

- **Metric rules** compare each file's own value with the limits; folders are never summed up. A file is reported
  once, at the worst level it exceeds. Per-function rules use the file metrics the Unified Parser writes, such as
  `max_complexity_per_function`.
- **A level, metric or setting left out** is not checked or keeps its default.
- **Analyser options** are the long options of the analyser's own command, such as `ccsh unifiedparser --exclude`.
  A list repeats the option, `true` sets a flag and `false` leaves it out. `--init` lists the options of every
  analyser, and `--doctor` checks names and values the way the analyser itself would. The gate sets the output
  options itself.
- **Instructions** tell the reader, often an AI agent, what to do about a broken rule. They appear on the console in a box
  under the rule they belong to, wrapped at about 76 characters, and in the report. A YAML block (`instruction: |`)
  keeps the line breaks you write.
- **Path patterns** in `overrides` follow `.gitignore` syntax, relative to the `input` folder.
- **Cycles and upward dependencies** are counted the way the dependency view in the visualization counts them, from
  what the [Dependency Parser](/docs/parser/dependency) marks between declarations. `betweenFiles` and `insideFiles`
  report each loop through declarations: for every dependency the parser marks cyclic, the shortest way back, each
  loop once. `upward` reports each dependency between declarations that runs against the levels of its folder. A
  loop or an upward dependency that touches a file `ignore` matches is not reported.
- A rule for a metric the analysis did not produce is reported as a warning.

### The result

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
```

The first line appears with `--quiet` only. Each cycle is walked through the declarations it runs through, from the
folder its files share.

`report.json` holds the exit code, the counts per severity and every violation with its rule, severity, path, metric,
value, limit and instruction; a cycle lists its members instead of a path.

The exit code is the code the config maps the worst severity found to, 0 when no rule is broken, and 2 when the gate
itself fails: no config, an invalid config or a failing analyser.
