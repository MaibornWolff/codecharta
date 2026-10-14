---
name: Tell what a folder or package uses and what uses it in the dependency inspector
issue: -
state: complete
version: -
---

## Goal

Selecting a folder or package in the dependency view shows the Uses and Used by sections a file already has, so the
reader sees what crosses its border in either direction.

## Tasks

### 1. Uses and Used by for folders and packages
- Only dependencies crossing the border of the selection: leaving it (Uses) and arriving in it (Used by)
- Rows as for a file: declaration → declaration, grouped under the file at the other end, own chip outlined
- Dependencies inside the folder stay out; Cycles and Upward already cover them
- Packages are built exactly like folders

### 2. Changelog
- Entry under Added in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Uses and Used by for folders and packages
- [x] Complete Task 2: Changelog

## Notes

- Decided with Christian: group by other file, leave inside dependencies out, own chip only, packages like folders
