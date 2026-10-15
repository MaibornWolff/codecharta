---
title: "Quality Gate"
---

`ccsh gate` analyses a project and checks it against the rules in its `.codecharta.yml`: limits per metric and
file, and dependency cycles between files or packages. It prints every broken rule, writes a JSON report and exits
with a code you choose, so a build, a git hook or an AI agent can act on the result.

### Getting started

```bash
ccsh gate --init      # analyse the project and write a fully commented-out .codecharta.yml
ccsh gate --doctor    # validate .codecharta.yml without analysing
ccsh gate             # analyse and check
```

Each takes the project folder as an optional argument (default: the current folder) and `--config <file>` to read
the config from elsewhere, and `--quiet` to keep the output of the analysers off the console. `--init` refuses to overwrite an existing config unless you add `--force`. Called
without arguments in a terminal, `ccsh gate` starts right away when the current folder has a `.codecharta.yml`,
and asks what to do otherwise.

`--init` lists every metric the analysis found, with the lowest and highest value as a comment, so you can pick
limits. Everything in the generated file is commented out: a fresh file checks nothing. Uncomment what you want.

### The analysis

The gate runs those of the [Raw Text Parser](/docs/parser/raw-text), [Unified Parser](/docs/parser/unified),
[Dependency Parser](/docs/parser/dependency) and [Domain Language Parser](/docs/parser/domain-language) that apply to
the project, merges their maps into one and checks that map. The merged map lands in the output folder next to the
report, so you can open it in the visualization.

### The config

```yaml
output: .codecharta-gate-output   # where the map and report.json go

analysers:                        # every applicable analyser runs unless switched off
  domainlanguageparser: off

exitCodes:                        # the exit code per severity; 2 is reserved for tool failures
  error: 1
  warning: 0

metrics:                          # checked per file
  rloc:
    warning:
      max: 200
      message: Watch the size, plan a split.
    error:
      max: 400
      message: Split the file by responsibility into smaller files.
  max_complexity_per_function:
    warning:
      max: 10
      message: Extract branches into named helper functions.

cycles:
  file:
    severity: error
    message: Break the cycle by moving the shared part into its own file.
  package:
    severity: warning
  allow:                          # cycles that are accepted as they are
    - - src/model/Node.kt
      - src/model/Edge.kt

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
- **Messages** tell the reader, often an AI agent, what to do about a broken rule. They appear on the console and in
  the report.
- **Path patterns** in `overrides` follow `.gitignore` syntax, relative to the project folder.
- **Cycles** are found in the dependency graph of the Dependency Parser. A package is the folder of a file. An
  allowed cycle is reported again once it gains a member.
- A rule for a metric the analysis did not produce is reported as a warning.

### The result

The rules are reported in the order the config lists them, below a line that marks the end of the analysis:

```
Analysing . with rawtextparser, unifiedparser, dependencyparser, domainlanguageparser ...

────────────────────────────────────────────────────────────────────────
Analysis done: 418 files with rawtextparser, unifiedparser, dependencyparser, domainlanguageparser in 4.2 s

ERROR  rloc > 400
       Split the file by responsibility into smaller files.
  src/parser/Parser.kt     812
  src/export/CsvWriter.kt  455

WARN   max_complexity_per_function > 10
       Extract branches into named helper functions.
  src/parser/Parser.kt  37

ERROR  1 file cycle
       Break the cycle by moving the shared part into its own file.
  cycle 1 of 1, 3 files in src/model/
    MutableNode.kt  → Node.kt, NodeInserter.kt
    Node.kt         → MutableNode.kt
    NodeInserter.kt → MutableNode.kt

3 errors, 1 warning, 418 files checked
Report: ./.codecharta-gate-output/report.json
```

The first line appears with `--quiet` only. Each cycle names the folder its members share and, per member, the
members of the cycle it depends on.

`report.json` holds the exit code, the counts per severity and every violation with its rule, severity, path, metric,
value, limit and message; a cycle lists its members instead of a path.

The exit code is the highest code the config maps a found severity to, 0 when no rule is broken, and 2 when the gate
itself fails: no config, an invalid config or a failing analyser.
