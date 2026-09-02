---
name: Show where a domain word occurs when it is right-clicked in the word cloud
issue: <#issueid>
state: todo
version: 1
---

## Goal

Right-clicking a word in the domain view's word cloud opens a context menu; picking "Show
occurrences" opens a docked right-side panel that breaks the word down over the node tree — an
expandable folder/file tree with each node's occurrence count and its share of the word's total
occurrences in the current scope.

## Tasks

### 1. Move the reusable context menu item into shared (structural, commit on its own)

- `ContextMenuItemComponent` currently lives inside `features/nodeContextMenu`. The word context menu
  needs the same row, and a domain feature must not reach into the metrics-map feature.
- Move it to `features/shared/components/contextMenuItem/` and export it from
  `features/shared/facade.ts`; update `nodeContextMenu.component.ts` to import from the facade.
- No behaviour change, no new tests — the existing node context menu specs cover it.

### 2. Derive the occurrence tree in the domain lens

- New `lenses/domain/store/wordOccurrences.ts`, exported from `domainLens.facade.ts`: given the
  structure tree, `domainWords`, the scope path (the currently selected node, root when nothing is
  selected) and a word, produce a tree of `{ path, name, isFolder, count, share, children }`.
- Roll-up rule: a node's count is its **own** recorded entry for that word when the producer emitted
  one, otherwise the sum of its children's counts. Producers may emit folder aggregates (the cloud
  already renders folder entries directly) or files only; this rule serves both without double
  counting.
- `share` = node count ÷ scope root count. Prune branches with a count of 0 — a reader only wants the
  places the word actually appears. Sort children by count descending, then name.
- The whole computation is a pure function over already-selected state, so it is unit-testable
  without the store; wrap it in a parameterised selector like `createWordsForSelectedNodeSelector`.

### 3. Hold the inspected word in a view-scoped store

- New `views/domainView/stores/domainWordInspection.store.ts` holding the inspected word (`string |
  null`) plus `inspect(word)` / `clear()`, provided by `DomainViewComponent` alongside
  `DomainSelectionStore`.
- Clear the inspection when the explorer selection changes — the scope the panel reports on is gone.

### 4. Emit a right-click on a word from the cloud

- `WordCloudChartHost` registers an echarts `contextmenu` handler and forwards the word name plus the
  native event's client coordinates; suppress the browser menu on the canvas container.
- `WordCloudComponent` exposes a `wordRightClicked` output carrying `{ word, x, y }`.

### 5. Word context menu

- New `features/domainWordMenu/` with a component modelled on `nodeContextMenu`: fixed position
  clamped to the viewport, closes on outside pointerdown / wheel / resize.
- Header row shows the word; items are "Show occurrences" and "Copy word" (reuse the shared context
  menu item, and the existing `CopyToClipboardService` the domain view already provides).

### 6. Docked occurrence panel

- New `features/domainWordOccurrences/` with a `cc-domain-word-occurrences` panel component
  positioned like `SidebarInspectorComponent` (fixed right, slides in, sits between the bars), shown
  only while a word is inspected.
- Header: the word, its total count in scope, and the scope's node name, plus a close button.
- Body: recursive rows for the occurrence tree — indent by depth, folders expandable (top level
  expanded, deeper levels collapsed), each row showing name, count and percentage. Clicking a row
  selects that node in the explorer via the existing selection store.
- Empty state when the word has no recorded occurrences in scope.

### 7. Wire into the domain view

- `DomainViewComponent` renders the menu and the panel, connects the cloud's `wordRightClicked` to
  the menu, and insets the cloud by the panel width while it is open so the cloud is not covered.

### 8. Docs

- Note the new interaction in the domain view documentation next to the wordless-node dimming entry.

## Steps

- [ ] Complete Task 1: Move `ContextMenuItemComponent` into shared
- [ ] Complete Task 2: Occurrence tree derivation in the domain lens
- [ ] Complete Task 3: Inspected-word store
- [ ] Complete Task 4: Right-click event from the word cloud
- [ ] Complete Task 5: Word context menu
- [ ] Complete Task 6: Docked occurrence panel
- [ ] Complete Task 7: Wire into the domain view
- [ ] Complete Task 8: Docs
- [ ] `npm test` green, `npm run format` clean

## Notes

- Decisions taken with the user: context menu first (not straight to the panel), docked right-side
  panel, expandable tree, percentage = share of the word's total occurrences in scope.
- Scope follows the explorer selection, matching what the cloud already shows.
- Tidy first: Task 1 is structural and ships as its own commit before any behavioural change.
