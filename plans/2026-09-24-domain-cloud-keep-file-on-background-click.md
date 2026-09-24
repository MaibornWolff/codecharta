---
name: Domain view — a click beside every word unpins the word but keeps the selected file
issue: -
state: complete
version: vis 2.6.0
---

## Goal

Clicking the cloud where no word is drawn only unpins the open word. The file or folder the cloud is
scoped to stays selected, so the cloud keeps showing the same words.

## Tasks

### 1. Keep the node selection on a background click

- `deselect()` in the domain view clears the inspected word only, not the domain node selection.
- Unit and e2e tests assert the node stays selected.
- Changelog: a Fixed entry, since the old behaviour shipped in 2.2.0.

## Steps

- [x] Complete Task 1: keep the node selection on a background click

## Notes

- The e2e test is updated but was not run (Linux sandbox without browsers); run `npm run e2e` locally.
