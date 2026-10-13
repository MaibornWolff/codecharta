---
name: Triage the open Rust findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/rust/FINDINGS.md`, record Christian's
decisions and update the review progress. Rust is the last language of the review.

## Tasks

### 1. Collect
- List the Missing, Wrong and Bad clauses without a decision; close those an earlier decision already covers

### 2. Triage
- Check the parser docs and the code for each finding, show the code, recommend and ask, four at a time

### 3. Record
- Append the decision to each finding, update `REVIEW_PROGRESS.md`

## Steps

- [x] Complete Task 1: Collect
- [x] Complete Task 2: Triage
- [x] Complete Task 3: Record

## Notes

- Every bullet of the Rust verdict is bundled; decisions name the clause
- 19 clauses asked in five rounds: 10 accepted, 9 ignored; 6 clauses closed by earlier decisions
- One answer against the recommendation: `self: Box<Self>` as a parameter is ignored
- Nothing derived; see the Rust section of `sample-projects/REVIEW_PROGRESS.md`
