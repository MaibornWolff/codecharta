---
name: Triage the open TypeScript findings and derive them for JavaScript
issue: -
state: complete
version: -
---

## Goal

Explain every finding in the verdict of `sample-projects/typescript/FINDINGS.md` that has no decision yet, record
the decision next to it, and carry the decisions over to the same findings in the JavaScript and Vue reports.

## Tasks

### 1. Triage
- Check the parser docs for each finding first, then explain and ask, four at a time

### 2. Record
- Append the decision to each TypeScript finding

### 3. Derive
- Mark the matching items in `javascript/FINDINGS.md` and `vue/FINDINGS.md` as derived from TypeScript

## Steps

- [x] Complete Task 1: Triage (20 open: unified 6, dependency 11, domain 3)
- [x] Complete Task 2: Record
- [x] Complete Task 3: Derive

## Notes

- The 19 items already decided by derivation from Java and Kotlin stay as they are
- Result: 13 accepted, 7 ignored (optional parameters accepted, `this` parameter ignored within one item)
- Derived: 9 items in javascript, 7 in vue
