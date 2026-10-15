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
- `input:` names the folder to analyse, relative to the config (default: the config's folder)
- Each analyser is `on`, `off`, or a mapping of its own long options; names and values are checked
  with the analyser's picocli spec (no duplicated option knowledge)
- Run the applicable and switched-on ones of RawTextParser, UnifiedParser, DependencyParser and
  DomainLanguageParser as they are, merge their maps with the MergeFilter's `ProjectMerger`
- Leave the output folder out of the analysis, write the merged map into it
- `--parallel` / `parallel: on` runs the analysers in a thread pool; merge order stays the list order, so the
  result is identical to a sequential run

- `--map <file>` checks (or `--init`s from) an existing cc.json instead of analysing; cycle rules on a map
  without dependency data give a "cycles not checked" warning

### 2. `ccsh gate --init`
- Analyse, write `.codecharta.yml` fully commented out: every metric with a warning and an error level and
  its min/max found, the applicable analysers, exit codes, output folder, cycles and an example override
- Refuse to overwrite without `--force`

### 3. `ccsh gate --doctor`
- Validate the config without analysing; every problem with its line; exit 0 or 2

### 4. `ccsh gate`
- Metric rules per file, worst level only; anything left out is off; gitignore-style override patterns,
  last match wins, `<metric>: off`
- `cycles.betweenFiles`, `cycles.insideFiles` and `cycles.upward` count exactly like the dependency view: loops via the
  view's shortest-way-back search over the declaration edges the parser marks cyclic (ported from cycleChains.ts),
  upward via the view's upward rule (file pair decides between files); `ignore` drops loops/edges touching a match
- Unknown metrics as warnings; exit code = highest code mapped to a found severity, 2 for tool failures

### 5. Report
- Console in config order: each metric (errors before warnings), then file and package cycles; each cycle with
  its shared folder and every member's in-cycle dependencies; `report.json` in the output folder
- A separator line and "Analysis done" before the result; `--quiet` keeps the analysers' output off the console

## Steps

- [x] Complete Task 1: Analyse
- [x] Complete Task 2: `ccsh gate --init`
- [x] Complete Task 3: `ccsh gate --doctor`
- [x] Complete Task 4: `ccsh gate`
- [x] Complete Task 5: Report
- [x] Docs (gh-pages, module README), CHANGELOG

## Notes

- Named `gate` because `ccsh check` is the ValidationTool
- Reuse: parsers run through picocli unchanged, `ProjectMerger`, `StronglyConnectedComponentDetection`,
  `GitignorePatternMatcher` (refactored to expose pattern parsing and path matching)
- Package cycles (direct folder of each file) were dropped: merging a folder's files into one node made parent ↔ child
  folders look tangled where the parser's levels show nothing
- Out of scope for v1: checking only changed files, naming the offending function, SARIF, git log / SVN
- `--quiet` redirects System.out/err while the analysers run, since they print directly
