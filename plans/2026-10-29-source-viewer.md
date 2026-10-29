---
name: Full-screen source viewer
state: complete
version: 1
---

## Goal

Replace the quick "Show Source" dialog with a full-screen viewer that looks and behaves like an editor tab:
header with path, language and actions, one row per line, status bar, and mouse selection that stays on the
line the pointer is on.

## Tasks

### 1. Rows
- One full-width row per line with a non-selectable line number, so selecting past a line's end stays on it
- Coloured HTML split into lines with the open token spans closed and reopened at each line break
- Rows grouped in blocks drawn only near the view (`content-visibility`): 5 MB in ~30 ms instead of ~800 ms

### 2. Viewer
- Full screen: "Back to map", folder and file name, language badge; copy path, copy content, wrap toggle
  (remembered in this browser), Open in VS Code
- Status bar: language, lines, size, encoding, why a file stays uncoloured, and the line clicked ("Ln 42")
- Its own component; the local source actions keep the lookup, the size limit and the small too-large dialog

### 3. Tests
- Unit tests for the rows, languages and viewer; e2e for colouring, the note, line click and wrap

## Steps

- [x] Complete Task 1: Rows
- [x] Complete Task 2: Viewer
- [x] Complete Task 3: Tests

## Notes

- Decisions: full screen, light colours like the app, all four extras, changelog wording unchanged
- Measured: rows for 5 MB (126,573 lines) 816 ms plain, 27 ms with content-visibility blocks of 500 lines
- Mouse selection: the old layout put numbers and code in two separate blocks side by side, so a drag past a
  line's end snapped to text above; full-width rows fix it, covered by an e2e drag test
- Verified: unit suite, tsc, ngc, lint, format, both gates, full e2e (125)
