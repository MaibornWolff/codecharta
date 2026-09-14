---
name: Drop the redundant autofocus from the metric picker search field
issue: -
state: complete
version: 2.3.2
---

## Goal

The metric picker's search field no longer carries `autofocus` (SonarCloud Web:S9379, accessibility).
The picker already focuses the field itself when the popover opens, so nothing changes for users.

## Tasks

### 1. Remove the attribute
- Delete the `autofocus` line from the picker template
- Confirm in the running app that the field still takes focus and typing filters the list

## Steps

- [x] Complete Task 1: attribute gone, all checks and e2e green

## Notes

- Pre-existing since PR #4481; reported against this PR only because the file moved to shared/
