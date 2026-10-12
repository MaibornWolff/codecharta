---
name: Triage the open C++ findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/cpp/FINDINGS.md`, record Christian's
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

- 23 open bullets or clauses: 5 closed by earlier decisions, 18 asked as 13 questions; 15 accepted, 8 ignored
- Against the recommendation: prototypes with parenthesised locals, and `= default` / `= delete`, are ignored
- Derived to C and C#; see the C++ section of `sample-projects/REVIEW_PROGRESS.md`
