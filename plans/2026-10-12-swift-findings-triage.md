---
name: Triage the open Swift findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/swift/FINDINGS.md`, record Christian's
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

- 15 open bullets or clauses: 4 closed by earlier decisions, 11 asked; 8 accepted, 3 ignored
- One clause against the recommendation: external argument labels are accepted
- Derived two clauses to C# and one to Rust; see the Swift section of `sample-projects/REVIEW_PROGRESS.md`
