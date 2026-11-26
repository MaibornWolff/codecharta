---
name: Show source when Chrome never answers the permission query
state: complete
version: 1
---

## Goal

After a reload, Chrome can leave `queryPermission` of a saved folder unanswered, and "Show Source" then does
nothing at all. The lookup must give up on that query and ask for the folder instead.

## Tasks

### 1. Time out the permission query
- `hasReadPermission` treats a `queryPermission` that does not answer within a second as not readable
- not readable leads to the "Select the project folder" dialog, whose picker hands out a fresh folder
- `requestPermission` keeps waiting, as it shows the browser's prompt

### 2. Changelog
- Fixed entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Time out the permission query (test first)
- [x] Complete Task 2: Changelog
- [x] Run format check, tests, lint, type check

## Notes

- Found with console logging on prod 2.11.0: `queryPermission asked` was logged, its answer never came, no toast
- Headless Chromium crashes on reading a saved handle back, so this cannot be covered by an e2e test
