---
name: Size limits for Show Source
state: complete
version: 1
---

## Goal

Keep "Show Source" from freezing the browser on huge or minified files: refuse files above 5 MB with a message
and a way to open them in VS Code, and colour only files up to 1 MB without lines over 20,000 characters.

## Tasks

### 1. Limits
- Above 5 MB the file is not read; the dialog names its size and the limit and offers "Open in VS Code"
- Coloured only up to 1 MB and when no line is longer than 20,000 characters (VS Code's colouring limit);
  otherwise plain text with one line saying why

### 2. Tests and changelog
- Unit tests for the limits and the dialog; e2e with a stand-in file above 5 MB and one with a long line
- Mention the limit in the unreleased local source entry

## Steps

- [x] Complete Task 1: Limits
- [x] Complete Task 2: Tests and changelog

## Notes

- Measured in Chromium here (normal code / minified code): plain text ~30 ms per MB; colouring ~0.4 s per MB plus
  Angular's sanitising, minified code 3-4x more per KB
- Decision: 5 MB shown, 1 MB coloured (looser than the recommended 2 MB / 512 KB)
- Verified: unit suite, tsc, ngc, lint, format, both gates, full e2e (123, two new: 6 MB file refused with the VS
  Code button, minified line shown plain with the note)
