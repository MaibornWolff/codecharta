---
name: Triage the open C# findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/csharp/FINDINGS.md`, record Christian's
decisions and update the review progress.

## Tasks

### 1. Collect
- List the Missing, Wrong and Bad clauses without a decision; close those an earlier decision already covers

### 2. Triage
- Check the parser docs and the code for each finding, show the code, recommend and ask, four at a time

### 3. Record
- Append the decision to each finding, derive to the other reports, update `REVIEW_PROGRESS.md`

## Steps

- [x] Complete Task 1: Collect
- [x] Complete Task 2: Triage
- [x] Complete Task 3: Record

## Notes

- Every bullet of the C# verdict is bundled; decisions name the clause
- 7 clauses asked: 4 accepted, 3 ignored; 7 clauses closed by earlier decisions
- No answer against the recommendation
- Nothing derived to Rust; see the C# section of `sample-projects/REVIEW_PROGRESS.md`
