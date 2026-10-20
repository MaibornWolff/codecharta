---
name: ccsh analyse --local-changes and --commit
state: complete
version: 1
---

## Goal

`ccsh analyse` takes `--local-changes` and `--commit <ref>` like the single parsers do, so a one-step map can show only
the work in progress or the codebase at a past commit.

## Tasks

### 1. Move the commit worktree setup into CommitAnalysisContext (structural)
- `CommonAnalyserParameters.resolveEffectiveInput` builds the worktree context inline; move that into a factory on
  `CommitAnalysisContext` so `ccsh analyse` can create one worktree for all analysers.

### 2. `--commit` in `ccsh analyse`
- One worktree at the commit; every code parser and the git history read it (passing `--commit` to each parser would
  make one worktree per parser and rename each parser's map).
- The map is prefixed with the short hash like the parsers do (`<hash>.shop.cc.json.gz`).
- svn history is skipped with a reason; messages keep showing the original folder.
- `--commit` and `--local-changes` are mutually exclusive.

### 3. `--local-changes` in `ccsh analyse`
- Passed to rawtextparser and unifiedparser.
- dependencyparser and domainlanguageparser are skipped with a reason under "Not in the map:" (the dependency graph
  and TF-IDF need every file of the project).
- The git history keeps working: it is filtered to the files the code parsers mapped.

### 4. Docs and changelog
- AnalyseTool README, gh-pages `analyse.md`, `local-changes.md`, `commit-analysis.md`, analysis CHANGELOG.

## Steps

- [x] Complete Task 1: Move the commit worktree setup
- [x] Complete Task 2: `--commit`
- [x] Complete Task 3: `--local-changes`
- [x] Complete Task 4: Docs and changelog
- [x] ktlintCheck, test, format:check, ccsh gate on analysis and visualization

## Notes

- Decided with Christian: skip dependencyparser and domainlanguageparser under `--local-changes` instead of running
  them on the whole project.
- `AnalyseRequest` moved into its own file: `HistoryFinder` now reads it, which made a file cycle with
  `CodebaseAnalysis` in the gate.
- Found, not fixed: with no local changes, `rawtextparser` and `unifiedparser --local-changes` map every file, because
  an empty change set means "no filter" in `ProjectMetricsCollector` and `ProjectScanner`.
