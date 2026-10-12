---
name: Triage the Java findings of the sample project
issue: -
state: complete
version: -
---

## Goal

Walk through every finding in the verdict of `sample-projects/java/FINDINGS.md`, explain it, and record the
decision per finding (accept, ignore or a free-form note) next to the finding.

## Tasks

### 1. Triage
- Explain each finding and ask for the decision, four at a time, in the order of the verdict section

### 2. Record
- Append the decision to each finding in `sample-projects/java/FINDINGS.md`

## Steps

- [x] Complete Task 1: Triage (29 findings: unified 10, dependency 8, domain 11)
- [x] Complete Task 2: Record

## Notes

- Accept = the finding stands and is to be fixed in the parser; ignore = no action
- Result: 18 accepted, 11 ignored; unified 6 / 4, dependency 8 / 0, domain 4 / 7
- The parser docs (`gh-pages/.../parser/*.md`, parser READMEs) describe several reported behaviours as intended; check them before calling something a finding
