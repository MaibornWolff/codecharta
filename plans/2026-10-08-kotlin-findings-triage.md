---
name: Triage the open Kotlin findings of the sample project
issue: -
state: complete
version: -
---

## Goal

Explain every finding in the verdict of `sample-projects/kotlin/FINDINGS.md` that has no decision yet and record
the decision (accept, ignore or a free-form note) next to it.

## Tasks

### 1. Triage
- Check the parser docs for each finding first, then explain and ask, four at a time

### 2. Record
- Append the decision to each finding; where a bullet already carries derived decisions, add the clause

## Steps

- [x] Complete Task 1: Triage (11 open: unified 7, dependency 1, domain 3)
- [x] Complete Task 2: Record

## Notes

- The 15 items decided by derivation from Java stay as they are
- Result: 4 accepted (long signatures, secondary constructor body, single-name body, `.kts` in the README), 7 ignored
- Usages not counted is the same in every language, so the matching clauses in abl, bash, php and objectivec are marked ignore as well
