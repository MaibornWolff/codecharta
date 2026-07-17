---
name: Filter hover edges by the selected edge metric
issue: <none>
state: complete
version: 1
---

## Goal

When a building is hovered or selected, only draw edges that carry the currently selected edge metric.
Today the hover path draws every edge of the visible files, so with two edge metrics (e.g. `dependencies`
and `temporal_coupling`) the map shows far more lines than the hovered building's number reports.

Pre-existing bug (present on `main` too), unrelated to the cc.json 2.0 work — keep it as its own commit.
See finding 3 in `2026-07-17-old-vs-new-comparison-findings.md`.

## Tasks

### 1. Reproduce with a failing test
- `codeMap.arrow.service.spec.ts`: hover a building whose edges carry two different edge metrics.
- Assert only the edges carrying the selected metric are drawn.

### 2. Fix `buildPairingEdges`
- Skip edges where `edge.attributes[edgeMetric] === undefined`, mirroring the predicate
  `setEdgeVisibility.ts` already applies on the edge-preview path.
- Read the selected edge metric from the map state, like the rest of the service does.

### 3. Verify
- Full visualization unit suite stays green.

## Steps

- [x] Complete Task 1: Reproduce with a failing test
- [x] Complete Task 2: Fix `buildPairingEdges`
- [x] Complete Task 3: Verify

## Notes

- The edge-preview path (`addEdgePreview`) was already correct; only the hover/select path
  (`buildPairingEdges`) lacked the filter. Both now apply the same predicate.
