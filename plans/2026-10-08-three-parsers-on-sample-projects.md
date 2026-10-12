---
name: Run unified, domain and dependency parser on the sample projects
issue: -
state: complete
version: -
---

## Goal

Run `unifiedparser`, `domainlanguageparser` and `dependencyparser` on all 18 sample projects and record per
language what is missing, bad or wrong. Close the gaps in the samples first, so every parser has something
to be judged on.

## Tasks

### 1. Extend the spec
- `sample-projects/README.md`: unified parser stress module (`EncounterResolver`) with expected values
  written before the run, language-specific edge-case file, German words, JSX / TSX, extension variants,
  restored TypeScript typings, three-parser report template

### 2. Extend and run per language
- One subagent per language: add the files, write the expected values, run the three parsers into
  `<language>/output/`, rewrite `<language>/FINDINGS.md`
- Rebuild `ccsh` from the current branch first; nothing under `analysis/` or `visualization/` changes

### 3. Check and summarise
- Spot-check each report against the raw output
- Rewrite `sample-projects/SUMMARY.md` across languages, ranked by impact

## Steps

- [x] Complete Task 1: Extend the spec
- [x] Complete Task 2: Extend and run per language
- [x] Complete Task 3: Check and summarise

## Notes

- Decisions (2026-10-08): one shared stress file per language plus constructs the parsers are expected to
  miss; German / non-ASCII words, JSX / TSX, typings, extension variants all added; `FINDINGS.md` rewritten
  in place; one subagent per language
- Unsupported pairs are still run and the behaviour recorded: unified has no ABL, dependency has no abl,
  bash, objectivec, ruby, swift, domain has no delphi
- Result: `sample-projects/SUMMARY.md` and 18 `FINDINGS.md`; outputs in `<language>/output/` (git-ignored)
- All runs need `LC_ALL=C.UTF-8`: under a POSIX locale the parsers drop files with non-ASCII names silently
