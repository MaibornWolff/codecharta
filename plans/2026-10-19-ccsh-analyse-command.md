---
name: ccsh analyse command
state: progress
version: 1
---

## Goal

Add `ccsh analyse [FOLDER]`, which runs every applicable parser on a codebase (unifiedparser, rawtextparser,
dependencyparser, domainlanguageparser, plus git or svn history when present) and merges the results into one map.
No config file.

## Tasks

### 1. Share the gate's run-and-merge code (structural, commit first)
- Move `ProjectAnalyser`/`ConfiguredAnalyser` out of GateTool into a shared module that both gate and analyse use
- Gate behaviour stays the same; existing gate tests stay green

### 2. AnalyseTool command
- New tool `ccsh analyse [FOLDER] -o <file>`, default folder `.`, default output `<folder-name>.cc.json.gz`
- Options: `--exclude` (regex, passed to every parser), `--parallel`, `--without <analyser>` (repeatable), `--not-compressed`, `--quiet`
- Runs the four code parsers that `isApplicable`, prints which ones ran, and fails clearly when none applies
- Register in `Ccsh.kt`

### 3. Version control history
- `.git` present → add `gitlogparser repo-scan` (the folder must be the repo root; otherwise skip and say so)
- `.svn` present → run `svn log --verbose` into a temp file, feed it to `svnlogparser`; if `svn` is missing, skip with a hint
- `--without git`/`--without svn` skip history
- Skip and failure hints for git/svn are collected and printed at the very end, after the line naming the
  written map, so they are the last thing the user reads and don't scroll away in the parser output

### 4. Interactive mode
- `getDialog()`: ask for the folder, the output file and the exclude pattern
- Interactive `ccsh` offers "analyse everything" as the first choice, before picking single analysers

### 5. Docs and changelog
- README for the tool, gh-pages docs entry, `analysis/CHANGELOG.md` Added entry

## Steps

- [x] Complete Task 1: Share the gate's run-and-merge code
- [x] Complete Task 2: AnalyseTool command
- [x] Complete Task 3: Version control history
- [x] Complete Task 4: Interactive mode
- [x] Complete Task 5: Docs and changelog
- [x] Run `./gradlew ktlintCheck test integrationTest`
- [ ] Review subagent, then the ccsh gate on analysis and visualization

## Notes

- Merge strategy: recursive, the same as the gate
- The history is filtered to the files the code parsers mapped before the merge, because gitlogparser and
  svnlogparser take no `--exclude`; this also keeps deleted and binary files out
- A failed history run does not fail the map; its reason joins the hints printed after `Map:`
- `ProjectAnalyser.analyseEach` now finishes every analyser before the gate reports the first failure
- Open: should the gate later also pick up git/svn through the shared code?
