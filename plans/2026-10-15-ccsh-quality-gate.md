---
name: ccsh quality gate
issue: none
state: complete
version: <version number>
---

## Goal

A `ccsh gate` command that analyses a codebase, checks the result against rules in `.codecharta.yml`
(metric limits per file, dependency cycles) and reports on the console, as JSON and through a configurable
exit code, so developers and AI agents get fast, scriptable feedback on code quality.

## Tasks

### 1. Analyse
- Run the applicable, switched-on ones of RawTextParser, UnifiedParser, DependencyParser and DomainLanguageParser
  unchanged through picocli, merge their maps with the MergeFilter's `ProjectMerger`, keep the map in the output folder
- Analyser options come from the config and are checked against each analyser's picocli spec
- `--parallel` / `parallel: on` runs the analysers in a thread pool, merged in list order
- `--map <file>` checks an existing cc.json instead of analysing
- Paths in the config are relative to the project folder; `input` names the folder to analyse

### 2. `ccsh gate --init`
- Commented-out config: settings, analysers with their options, one line per metric with range and description,
  one worked rule, dependency rules, an override example; a hint to keep the output folder out of version control

### 3. `ccsh gate --doctor`
- Every problem with its line, in line order; rules and overrides that would check nothing are reported

### 4. `ccsh gate`
- Metric rules per file with `max` and/or `min` per level, worst level only; `exclude` and overrides in `.gitignore`
  syntax (negation included), applied in order
- `dependencies.cyclesBetweenFiles`, `cyclesInsideFiles` and `upward` count like the dependency view (ported
  `cycleChains.ts` and `upwardRuleOf`); `ignore` per rule
- A rule for an unknown metric is reported at its worst severity with the closest metric name; patterns that match
  no file are warnings; exit code = code of the worst severity found, 2 for tool failures

### 5. Report
- Console in config order with an instruction box per rule, cycles walked through their declarations, upward
  dependencies by the folder they cross; `--quiet`; `report.json` in the output folder

## Steps

- [x] Complete Task 1: Analyse
- [x] Complete Task 2: `ccsh gate --init`
- [x] Complete Task 3: `ccsh gate --doctor`
- [x] Complete Task 4: `ccsh gate`
- [x] Complete Task 5: Report
- [x] Docs (gh-pages, module README), CHANGELOG
- [x] Independent config and code review, findings addressed

## Notes

- Named `gate` because `ccsh check` is the ValidationTool
- Reuse: parsers run through picocli unchanged, `ProjectMerger`, `GitignorePatternParser` (extracted from the matcher),
  `EditDistance` (moved from the MergeFilter's mimo merge into the model), `NodeId` for paths
- Package cycles (direct folder of each file) were dropped: merging a folder's files into one node made parent ↔ child
  folders look tangled where the parser's levels show nothing
- Not done from the review: a shared test fixture for the ported cycle search (both sides point to each other instead)
- Out of scope for v1: checking only changed files, naming the offending function, SARIF, git log / SVN
- `--quiet` redirects System.out/err while the analysers run, since they print directly
