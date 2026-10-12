---
name: Triage the open Objective-C findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/objectivec/FINDINGS.md`, record Christian's
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

- 25 open bullets, asked as 18 questions: 13 accepted (two of them split per clause), 5 ignored; 4 closed
  without a question
- Against the recommendation: `.h` with Objective-C content read as C is ignored
- Derived to C, C++, Swift, Ruby and Bash; see the Objective-C section of `sample-projects/REVIEW_PROGRESS.md`
- `append_decisions.py` matches unindented items now
