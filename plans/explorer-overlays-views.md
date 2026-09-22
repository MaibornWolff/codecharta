---
name: Explorer overlays the views
issue: -
state: complete
version: -
---

## Goal

The sidebar explorer floats above the view instead of taking space from it: resizing or collapsing it
no longer moves the metrics bar / domain bar or re-lays out the word cloud.

## Tasks

### 1. Stop reserving explorer width
- Drop the `--cc-explorer-width` CSS variable the explorer publishes and the bar shell reads
- Bars center on the whole viewport
- Domain view's cloud container spans the full width (no `cloudLeftInset`)

### 2. Tests
- Remove unit tests for the published footprint and the cloud inset
- Move the e2e "click beside every word" target out from under the explorer
- Scenario e2e collapses the explorer before using the metrics bar; new e2e shows the bar stays put and is clear once collapsed

## Steps

- [x] Complete Task 1: Stop reserving explorer width
- [x] Complete Task 2: Tests
- [x] Changelog entry, full check set, e2e

## Notes

- Accepted trade-off: a wide explorer can cover the left end of a bar or of the cloud on narrow windows
