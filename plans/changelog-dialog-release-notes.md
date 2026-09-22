---
name: Changelog dialog shows the right release notes
issue: -
state: complete
version: -
---

## Goal

The "What's new" dialog after an update lists the real changes, skips versions whose section is empty,
does not open at all when nothing is left, and links to the GitHub releases.

## Tasks

### 1. Parser
- Match category headings by their name, with or without emoji (`### Removed` was never shown)
- Empty version sections contribute nothing

### 2. Dialog
- Acknowledge instead of opening when the parsed changes are empty
- "View full changelog" points to https://github.com/MaibornWolff/codecharta/releases

## Steps

- [x] Complete Task 1: Parser
- [x] Complete Task 2: Dialog
- [x] Changelog entry, full check set

## Notes

- 2.5.2 was released with an empty CHANGELOG section, which is what left the dialog blank
