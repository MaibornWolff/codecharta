---
name: Triage the open C findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/c/FINDINGS.md`, record Christian's
decisions and update the review progress.

## Tasks

### 1. Collect
- List the Missing, Wrong and Bad items without a decision; close those an earlier decision already covers

### 2. Triage
- Check the parser docs and the code for each finding, show the code, recommend and ask, four at a time

### 3. Record
- Append the decision to each finding, derive to the other reports, update `REVIEW_PROGRESS.md`

## Steps

- [x] Complete Task 1: Collect
- [x] Complete Task 2: Triage
- [x] Complete Task 3: Record

## Notes

- The dependency parser reads `.c` / `.h` with the C++ analyzer (`SupportedLanguage.CPP`); there is no C mapping of its own
- 11 clauses asked: 4 accepted, 7 ignored; 10 clauses closed by earlier decisions
- Three answers against the recommendation: preprocessor conditions, include guards (ignored), macro-generated function (accepted)
- Nothing derived to C# or Rust; see the C section of `sample-projects/REVIEW_PROGRESS.md`
