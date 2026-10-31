---
name: Syntax highlighting for Show Source
state: complete
version: 1
---

## Goal

Colour the file shown by "Show Source" by its language with Prism.js 1.30.0 (the release that fixes
CVE-2024-53382), without loading Prism before a file is shown.

## Tasks

### 1. Dependency
- `prismjs@^1.30.0` and `@types/prismjs` via npm >= 11.10, so the 3-day quarantine applies; lockfile audit lists them

### 2. Highlighting
- Prism in manual mode, loaded lazily on the first shown file, with only the grammars of the languages the
  analysis knows, chosen by file extension; an unknown extension stays plain text
- The file shows as plain text at once and is coloured once Prism is done
- Prism escapes the content and returns only token spans; Angular's sanitiser keeps them

### 3. Colours
- Token colours from the daisyUI theme variables (the app runs daisyUI's light theme), status colours mixed with
  the text colour to stay readable

### 4. Tests and changelog
- Unit tests for the language choice, the escaping and the dialog; e2e checks a coloured TypeScript file
- Rewrite the unreleased local source entry

## Steps

- [x] Complete Task 1: Dependency
- [x] Complete Task 2: Highlighting
- [x] Complete Task 3: Colours
- [x] Complete Task 4: Tests and changelog

## Notes

- ABL has no Prism grammar and stays plain
- No size limit (decision from the production-ready round): a very large file takes a moment to colour
- Prism and its grammars build into the lazy `syntaxHighlighter` chunk (77.5 kB raw, ~23 kB transfer); the
  initial bundle carries none of it
- Installed with npm 11.12.1 (`--package-lock-only`, quarantine on); `auditLockfileDiff.mjs` passes and lists
  `prismjs@1.30.0` and `@types/prismjs@1.26.6`; `npm audit` reports neither
