---
name: Bring the summary in line with the decisions
issue: -
state: complete
version: -
---

## Goal

`sample-projects/SUMMARY.md` states for each of its items whether it was accepted or ignored, and no longer lists
ABL.

## Tasks

### 1. Annotate
- Append the decision to every item of the summary; name the part where an item bundles several findings
- Add a decision column to the extension, parameter and missing-edge tables

### 2. Remove ABL
- Drop the ABL row, the ABL mentions and adjust the language counts

### 3. Close the review
- Update `REVIEW_PROGRESS.md`

## Steps

- [x] Complete Task 1: Annotate
- [x] Complete Task 2: Remove ABL
- [x] Complete Task 3: Close the review

## Notes

- The findings text is unchanged; only decisions were added
- The overview column is now "Biggest accepted issue"; rows whose issue was ignored name an accepted one instead
- The Rust row of the missing-edge table gained `use … as`, the crate name and `#[path]`, which were decided on
  2026-10-12
