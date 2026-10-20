---
title: "Available metrics"
description: "The code metrics worth starting with, such as rloc, complexity, coverage and commit counts, which ccsh command writes them and how to read them."
sidebar:
  label: "Metrics"
---

> When a metric becomes a target, it ceases to be a good metric.
> -- Free interpretation of [Goodhart's Law](https://en.wikipedia.org/wiki/Goodhart%27s_law)

Metrics are a good place to **start** a conversation:

> "Why does this really complex class have so little line coverage? Do we need to do something about that? Does
> that low coverage create problems for future feature X?"

They are bad targets:

> "Increase the line coverage of these 100 classes to 100% within 4 weeks."

Line coverage is easy to raise with tests that assert nothing. Once a team is judged by coverage, that is what it
gets, and the metric stops telling you anything. Used to ask questions instead, metrics give you a lot of insight.

## Metrics worth starting with

| Metric              | What it tells you                                                                                       | Written by |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| `rloc`              | Real lines of code: lines that are neither blank nor comment. How much code there actually is, without copyright headers and commented-out code. | [Unified Parser](/docs/parser/unified) |
| `complexity`        | How often the control flow branches, based on McCabe's [cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity): every `if`, `case` or loop is a decision, and code with many decisions is hard to follow. | [Unified Parser](/docs/parser/unified) |
| `line_coverage`     | How many lines the tests cover.                                                                          | [Coverage Importer](/docs/importer/coverage), [Sonar Importer](/docs/importer/sonar) |
| `sonar_code_smells` | How many smells SonarQube found: hints that something may be wrong and worth a look.                     | [Sonar Importer](/docs/importer/sonar) |
| `number_of_commits` | How many commits changed the file. A file that changes all the time is worth a second look.              | [Git Log Parser](/docs/parser/git-log), [SVN Log Parser](/docs/parser/svn-log) |
| `number_of_authors` | How many people changed the file. A file many people edit may be a coordination problem.                 | [Git Log Parser](/docs/parser/git-log), [SVN Log Parser](/docs/parser/svn-log) |

Each command's page lists all the metrics it writes, and the [command overview](/docs/analysis/codecharta-shell#commands)
links to every command. For a metric no command produces, import it from a CSV file with the
[CSV Importer](/docs/importer/csv).
