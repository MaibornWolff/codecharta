---
name: ccsh analyse command
state: complete
version: 1
---

## Goal

Add `ccsh analyse [FOLDER]`, which runs every applicable parser on a codebase (unifiedparser, rawtextparser,
dependencyparser, domainlanguageparser, plus git or svn history when present) and merges the results into one map.
No config file.

## Tasks

### 1. Share the gate's run-and-merge code (structural, commit first)
- Move `ProjectAnalyser`/`ConfiguredAnalyser` out of GateTool into AnalyseTool, which the gate then depends on
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
- [x] Review subagent, then the ccsh gate on analysis and visualization

## Review Feedback Addressed

1. **Gate fail-fast**: sequential `ProjectAnalyser.analyse` stops at the first failed analyser again
2. **Enclosing-root hint**: no hint when another version control is rooted at the folder; the search stops at the home folder
3. **`--without`**: takes spaces after commas like `-e`, and `gitlogparser`/`svnlogparser` for the histories
4. **Results by analyser**: code and history results are matched by analyser, not by list position
5. **Tests**: default parsers with git, hint last without `--quiet`, `-nc`, failing parser, repo without commits, Dialog
6. **Docs**: exit code 2 and the svn trunk-only limitation
7. Accepted as they are: svn branch paths, interactive tail lines, old maps in the project folder, message wording,
   svn log timeout, `String?` result of `SvnLogWriter`, repeated literals, `CodeParsers` location, Unix tools in tests

8. **Every skipped source is named**: after `Map:`, a "Not in the map:" block names each parser and history that did
   not run and why, including a folder in no repository and sources left out with `--without`
9. **Module layout**: the runner lives in AnalyseTool instead of an `analysers/AnalyserRunner` module, as `analysers/`
   only holds the categories and the shared interface

## Notes

- Merge strategy: recursive, the same as the gate
- The history is filtered to the files the code parsers mapped before the merge, because gitlogparser and
  svnlogparser take no `--exclude`; this also keeps deleted and binary files out
- A failed history run does not fail the map; its reason joins the hints printed after `Map:`
- `ProjectAnalyser.analyseEach` now finishes every analyser before the gate reports the first failure
- Open: should the gate later also pick up git/svn through the shared code?
