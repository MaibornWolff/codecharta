---
name: domain explorer word mode
issue: <#issueid>
state: complete
version: 1
---

## Goal

Move the domain word breakdown out of the 320px right-hand panel and into the left explorer: the
explorer gets a Files/Words toggle, its search box searches whatever the active mode browses, and
Words mode lists the project's words with their folder/file distribution. The right panel is deleted.

## Decisions

- Toggle, not tabs: one control switching the explorer between browsing **files** and browsing **words**.
- The search box is mode dependent — path patterns in Files mode, word text in Words mode.
- Words mode is always project wide; the selected folder no longer scopes it (the word cloud keeps
  its own scoping).
- Full move in one step: `cc-domain-word-occurrences`' panel shell goes away, its occurrence rows and
  selector are reused inside the explorer.
- One word expanded at a time (accordion): a word's distribution tree is deep, and this replaces the
  panel one-to-one.

## Tasks

### 1. Explorer modes in the shared explorer feature
- Add `ExplorerMode` (`id`, `label`, `icon`, search placeholder + aria label) and an `ExplorerModeService`
  holding the active mode; register the service in `provideViewScopedExplorerState` so each view has its own.
- Add `modes: ExplorerMode[]` to `ExplorerCapabilities` (empty for metrics view = no toggle).
- Render the toggle in `cc-explorer-header` when a view declares more than one mode.
- In `cc-sidebar-explorer`, Words mode replaces the tree body with projected content and hides the
  node sort control (its options sort nodes, not words).

### 2. Mode-dependent search
- Split the search port: a pattern-input part (`pattern$`, `isPatternEmpty$`, `setPattern`, `resetPattern`)
  that the search bar depends on, and the existing `ExplorerSearch` that adds `searchedNodePaths$`.
- Add an optional `EXPLORER_WORD_SEARCH` token; the search bar resolves its input from the active mode
  and takes its placeholder/aria label from the mode.
- Domain view provides the word search from a view-scoped `DomainWordQueryStore` (transient signal
  store, like `DomainSelectionStore`).

### 3. Word list in the explorer
- New `cc-domain-word-list` in `features/domainWordOccurrences`: project words sorted by count
  descending, filtered by a case-insensitive substring match on the word query.
- A word row (own component) shows word, count and share bar; expanding it renders the existing
  `cc-domain-word-occurrence-row` subtree from `createWordOccurrencesSelector(null, word)`.
- Revealing a node from the tree keeps working through `ExplorerRevealService`.
- Add a `projectWordsSelector` to the domain lens for the root aggregate word list.

### 4. Delete the panel and rewire the word menu
- Delete `domainWordOccurrences.component.*` and `DOMAIN_WORD_OCCURRENCES_WIDTH_PX`; drop
  `cloudRightInset` so the cloud spans to the right edge again.
- `DomainWordInspectionStore` becomes the expanded-word state: no clear-on-selection-change, since
  Words mode is project wide.
- "Show occurrences" in the word context menu now switches the explorer to Words mode, expands it if
  collapsed, searches for that word so the list narrows to it, and expands its breakdown. Searching
  beats clearing plus scrolling: a filled search box says why the list is short, a silent scroll in a
  150-word list is easy to miss.

### 5. Tests
- Mode service, header toggle, search bar switching input per mode.
- Word list: sorting, filtering, accordion expansion, reveal output.
- Domain view: word menu wiring, no right inset, panel gone; update the specs that referenced the panel.

### 6. Make the word list an explorer list, not a list of its own
- Extract the explorer row's look into `cc-explorer-row` (id, hover/selected/marked/revealed states,
  the `part / amount` decoration slot) and put the file tree on it, so there is one definition of a row.
- Generalise `cc-explorer-tree-item-icon` to take `isFolder` instead of a `CodeMapNode`, so the word
  breakdown can use the very same folder/file glyphs and colours.
- Rebuild the word row and the occurrence row on those two: no chevron buttons, counts and shares in
  the decoration slot (`23% / 42`), indentation by nested `pl-3` like the tree.
- The share bar lives in `cc-explorer-row` too and always draws the percentage the row states, so a
  bar can never disagree with its number. The metric explorer states the same kind of percentage and
  could switch its bars on the same way.
- Occurrence rows behave like file-tree rows: a folder opens or closes, and every node becomes the
  selection (so the cloud scopes to it). Revealing a node — and the mode switch it needed — is gone.

### 7. Keep a handed-over node visible
- "Show in Domain" hands over a node, so the explorer switches to its file tree on arrival — the mode
  survives navigation, and a word list has no row to reveal.

## Steps

- [x] Complete Task 1: Explorer modes in the shared explorer feature
- [x] Complete Task 2: Mode-dependent search
- [x] Complete Task 3: Word list in the explorer
- [x] Complete Task 4: Delete the panel and rewire the word menu
- [x] Complete Task 5: Tests
- [x] Complete Task 6: Make the word list an explorer list, not a list of its own
- [x] Complete Task 7: Keep a handed-over node visible
- [x] `npm test` green, `npm run format`

## Notes

- Word list renders every project word (no virtual scroll). If a producer emits thousands of root
  words this needs windowing — follow-up, not part of this change.
- Mode is in-memory per view; the route reuse strategy keeps the domain view alive across view
  switches, so the toggle survives navigation without persistence.
- A word's tree opens collapsed (one level of folders). The panel used to auto-expand its top level,
  which is too many rows for the narrow explorer.
- `EXPLORER_WORD_SEARCH` must NOT carry a default `factory` that injects `EXPLORER_SEARCH`: a
  tree-shakable token's factory runs in the ROOT injector, where the view-scoped file search is not
  provided — that boots the app into NG0201. The search bar injects it optionally instead.
- The word list first shipped with its own row chrome (chevrons, share bars, count + percent columns)
  and looked nothing like the file tree it sits next to. Second pass: one row component for both.
- Verified: unit suite (412 suites), `ng build`, dependency-cruiser, knip, style lint, and the
  domainView e2e file (15 tests, two new ones for the word mode) all green in a real browser.
