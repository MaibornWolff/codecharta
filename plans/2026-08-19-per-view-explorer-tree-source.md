---
name: Give each view its own explorer tree source
issue: <#issueid>
state: complete
version: 1
---

## Goal

The domain explorer still reads the map's decorated render model, so blacklisted files skew its
`NUMBER_OF_FILES` sort even though they are visible again. Introduce an `EXPLORER_TREE` port so each
view supplies its own tree, and let the domain view read a view-state-independent tree instead.

## Tasks

### 1. A view-state-independent tree in the structure lens
- New `viewIndependentTreeSelector`: the structure tree with stable ids, merged folder chains and
  file counts, and nothing that depends on map view state (no blacklist, no metrics).
- File counts are computed from scratch (leaf = 1, folder = sum of its subtree), so exclusions
  cannot skew them.

### 2. An EXPLORER_TREE port
- `ExplorerTree.rootNodeFor(sortingOrder, ascending)` returns the sorted root node.
- `ExplorerTreeComponent` injects the port instead of the root-provided read store.
- The read store loses `rootNodeFor`; sorting stays shared via `sortNodesInPlace`.

### 3. One adapter per view
- `MetricsExplorerTree` keeps the render-model tree (area sorting still reads the area metric).
- `DomainExplorerTree` reads the view-independent tree.

## Steps

- [x] Complete Task 1: A view-state-independent tree in the structure lens
- [x] Complete Task 2: An EXPLORER_TREE port
- [x] Complete Task 3: One adapter per view
- [x] Run the visualization unit tests

## Notes

- Follow-up to [decouple-explorer-from-blacklist](./2026-08-19-decouple-explorer-from-blacklist.md),
  which made exclusion *visibility* per-view. This makes the tree *source* per-view.
- Both trees run `decorateMapWithStructure` on a clone of the same structure tree, so node ids and
  merged folder paths stay identical across views — the domain word lookup is keyed by those paths.
