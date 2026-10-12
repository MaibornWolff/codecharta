---
name: Triage the open PHP findings with a reusable skill
issue: -
state: complete
version: -
---

## Goal

Put the triage workflow into a project skill, then explain every open finding in the verdict of
`sample-projects/php/FINDINGS.md`, record the decisions and update the review progress.

## Tasks

### 1. Skill
- `.claude/skills/triage-findings/SKILL.md`: the workflow of `REVIEW_PROGRESS.md` as steps

### 2. Triage
- Check the parser docs for each finding first, then show the code, recommend and ask, four at a time

### 3. Record
- Append the decision to each finding, derive to the other reports, update `REVIEW_PROGRESS.md`

## Steps

- [x] Complete Task 1: Skill
- [x] Complete Task 2: Triage
- [x] Complete Task 3: Record

## Notes

- 20 open items: 12 accepted, 9 ignored (bundled bullets counted per clause); 4 closed by earlier decisions
  without a question
- Derived: `xor` to Delphi (ignore)
- Against the recommendation: traits and `construct` are ignored
