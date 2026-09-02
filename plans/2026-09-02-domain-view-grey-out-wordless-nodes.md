---
name: Grey out wordless folders and files in the domain view
issue: <#issueid>
state: todo
version: 1
---

## Goal

In the domain view's sidebar explorer, folders and files that carry no domain words are dimmed the
same way the metrics view dims nodes without area for the chosen metric, so a reader can tell at a
glance which parts of the tree the domain lens actually says something about.

## Tasks

### 1. Expose the paths that carry domain words

- Add a selector to the domain lens (`lenses/domain/store/domain.selectors.ts`) that derives the set
  of node paths with a non-empty word list from `domainWordsSelector`, and export it from
  `domainLens.facade.ts`.
- A folder needs no special handling: the analysis side already rolls file words up into every parent
  directory, so a folder has an entry exactly when something beneath it has words.
- Deriving a `Set` once in a memoized selector keeps the per-row lookup O(1) for large trees.

### 2. Let the explorer row lens dim a wordless row

- Extend `ExplorerRowInputs` with an optional set of paths that carry domain words; when it is
  omitted (metrics view) nothing changes.
- Both dimming reasons — no area, no words — end in the same projection (`isInactive`, `isItalic`,
  a `title` hint), so fold them into one helper that returns the hint text and drive `isInactive`
  off it, instead of adding a second parallel branch.
- Hint text for a wordless row: "No domain words" (matches the existing hover-tooltip wording in
  `domainExplorerSelection.ts`).

### 3. Feed the set from the domain view's row projection

- `DomainExplorerRow` reads the new selector and passes the set into `projectExplorerRow`.
- Rows stay selectable and keep their hover tooltip — the dimming is informational only.
- With no domain data loaded at all, every node is wordless and the whole tree dims; that is the
  intended, literal behaviour.

### 4. Tidy first

- The icon component's `NO_AREA_COLOR` now serves a second reason for dimming; rename it to an
  intent-revealing, reason-free name in its own structural commit before the behavioural change.

## Steps

- [ ] Complete Task 4: Tidy first — rename the reason-specific inactive colour constant
- [ ] Complete Task 1: Selector for paths carrying domain words (+ tests)
- [ ] Complete Task 2: Explorer row lens dims wordless rows (+ tests)
- [ ] Complete Task 3: Domain view row projection feeds the set (+ tests)
- [ ] Run the visualization test suite and format

## Notes

- The domain view has no 3D map; "folders/files" here are the sidebar explorer tree rows.
- Decisions taken with the user: metrics-identical look (dim + italic + title), rows stay selectable,
  dim everything when no domain data is present, no hide-toggle setting.
