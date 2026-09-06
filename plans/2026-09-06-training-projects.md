---
name: training projects for the dependency and domain language parsers
issue: none
state: complete
version: 1
---

## Goal

Create one "Cellars and Centaurs" example project per supported language under `training/`, run the
dependency parser and the domain language parser on each, and record what each parser gets right, wrong
or misses.

## Tasks

### 1. Shared spec and tooling
- `training/README.md` with the shared model, stress constructs, planted comments, commands and report template
- `training/tools/dump_lenses.py` to print both lenses as plain text
- exclude `training/` from Biome and Sonar

### 2. One project per language (18 languages, union of both parsers)
- one agent per language via a workflow, all in parallel
- each agent writes the project, runs both parsers, writes `training/<language>/FINDINGS.md`

### 3. Summary
- `training/SUMMARY.md` with a cross-language table and the ranked list of parser defects

## Steps

- [x] Complete Task 1: shared spec and tooling
- [x] Complete Task 2: one project per language
- [x] Complete Task 3: summary

## Notes

- The installed `ccsh` under `analysis/build/install` is used as is; agents do not touch parser code.
- Findings only, no parser fixes in this task.
