---
name: Triage the open Ruby findings
issue: -
state: complete
version: -
---

## Goal

Explain every open finding in the verdict of `sample-projects/ruby/FINDINGS.md`, record Christian's
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

- 22 open bullets or clauses: 5 closed by earlier decisions, 17 asked as 16 questions; 9 accepted, 12 ignored, 1 already
  covered by the Java decision on its bullet
- Against the recommendation: `__END__`, `Created Project with 1 leaves` and the heredoc end tag are ignored
- Derived to Bash; see the Ruby section of `sample-projects/REVIEW_PROGRESS.md`
