---
name: Domain view manual QA findings
issue: <#issueid>
state: complete
version: 1
---

## Goal

Five issues found while using the branch: the metric view's inspector cannot be closed for a node
that has no building, the cloud wipes the highlight off the word under the pointer, clicking a word
scrolls the file tree instead of opening the word, hidden words are counted in the wrong place, and
the word menu does not read like the node menu.

## Decisions

- Left-clicking a word in the cloud does exactly what **Show occurrences** does — word mode, sidebar
  expanded, the search narrowed to that word, breakdown open. The menu entry stays for discoverability.
- Hidden words are counted by a **chip in the explorer header**, like the metric view's chips; the
  settings-bar segment goes away.
- The word menu's first line carries the word and copies it, like the node menu's path line; the
  separate **Copy word** entry goes away.
- Hovering a word emphasises it **alongside** the open word's mark, rather than replacing it.

## Tasks

### 1. Let the inspector close for a node without a building
- `ThreeSceneService.clearSelection` only writes the cleared selection to the store when a building
  object is held, but a node picked in the explorer sets the selection whether or not the map drew a
  building for it. The store is cleared either way now.

### 2. Keep the hover emphasis on the word under the pointer
- The open word's mark is re-applied on echarts' `finished` event, which also fires after a hover
  render, so the dispatched `downplay` wipes the hover a moment after it appears.
- Re-apply it only after a layout this component asked for, so hover and mark coexist.

### 3. Clicking a word in the cloud opens it in the word list
- The view routes the cloud's click into the same handler as the menu's **Show occurrences**.
- The word list must not scroll a panel it is not rendered in: while the explorer browses files, the
  list is projected but detached, so it measured — and scrolled — the file tree's panel.

### 4. Count hidden words in the explorer header
- Structural first: the hidden-words popover and its stores move from `domainBar` to
  `domainWordOccurrences`, which is where words live now that the bar segment is gone.
- The explorer header projects a `headerChips` slot; the domain view fills it with a `Hidden` chip
  built from the shared `cc-explorer-count-chip`, opening the popover that restores words.

### 5. The word menu reads like the node menu
- First line: the word, with the copy affordance the node menu's path line has; drop `Copy word`.

## Steps

- [x] Complete Task 1: inspector closes for a node without a building
- [x] Complete Task 2: hover emphasis survives
- [x] Complete Task 3: cloud click opens the word in the list
- [x] Complete Task 4: hidden-words chip in the explorer header
- [x] Complete Task 5: word menu header line

## Notes

- Tasks 2 and 3 are regressions from `0d299fc2`; task 1 predates this branch.
- Each task is tested and committed on its own.
- The header chip could not be projected through `cc-explorer-header`: content re-projected into a child
  component's selected slot never arrived. The explorer takes the slot in its own template instead.
- The word menu's first line mirrors the node context menu exactly — copy glyph first, then the word —
  rather than putting the copy button at the right end.

## Verification performed

- 419 unit suites (2854 tests), `tsc`, dependency-cruiser, knip, style lint, and all 75 e2e tests green.
- In a browser: the inspector closes for a folder; a hovered word keeps its emphasis while the open word
  keeps its mark; a click from the file tree switches to word mode, searches and breaks the word down
  without scrolling the tree; the Hidden chip counts and its popover opens under the chip; the word menu
  reads like the node menu.
