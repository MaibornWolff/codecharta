---
name: Decouple the domain explorer from the metrics blacklist
issue: <#issueid>
state: complete
version: 1
---

## Goal

Excluding a file in the metrics explorer also removes it from the domain explorer, even though the
domain view cannot create, inspect or undo exclusions. Make the "hide excluded nodes" behaviour a
per-view decision, owned by the explorer row projection, so the domain explorer shows the full tree.

## Tasks

### 1. Move the exclusion gate into the row projection
- `ExplorerRowInputs` gets `hidesExcludedNodes`, mirroring the existing `showsFlattenedState` input.
- `ExplorerRowProjection` gets `isHidden`, set only when the view opts in and the node is excluded.

### 2. Let each view opt in
- `MetricsExplorerRow` passes `hidesExcludedNodes: true` (unchanged behaviour).
- `DomainExplorerRow` keeps its trivial projection, so excluded nodes stay visible there.

### 3. Replace the hardcoded template gate
- `explorerTreeLevel.component.html` gates on `rowProjection().isHidden` instead of `node().isExcluded`.
- Update the shared projection mocks/specs that spell out the projection shape.

## Steps

- [x] Complete Task 1: Move the exclusion gate into the row projection
- [x] Complete Task 2: Let each view opt in
- [x] Complete Task 3: Replace the hardcoded template gate
- [x] Run the visualization unit tests

## Notes

- Chosen over an `EXPLORER_TREE` port (per-view tree selector). The domain row projection already
  ignores every other map decoration on `accumulatedDataSelector`, so the projection is the smaller,
  consistent seam. Revisit the port if the domain tree needs a different source entirely.
- The blacklist itself stays in `sharedView`; only its rendering effect becomes view-scoped.
