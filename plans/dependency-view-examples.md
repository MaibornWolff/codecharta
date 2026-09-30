---
name: Dependency view in the examples
issue: -
state: complete
version: -
---

## Goal

Let every example a user can reach open the dependency view: the startup sample and the live demo
maps carry dependency levels and `dependencies` edges, the demo links name a metric the maps have,
and an e2e test keeps the view working on the sample.

## Tasks

### 1. Extend sample1 by hand
- Add `lenses.dependency.nodes` with a level for each file and folder
- Give the edges a `dependencies` metric (keep `pairingRate`/`avgCommits` for the metric view's arrows)
- Add a cyclic and an upward edge so all four edge types show
- Keep `visualization/public/codeCharta/assets/sample1.cc.json` in sync; move the ccJson2 parity test
  onto its own fixture, since sample1 no longer matches its 1.x source

### 2. Run dependencyparser in the demo build
- `.github/workflows/scripts/build_demo_files.sh`: parse `../visualization` and `../analysis` on the
  unmodified tree (like the domain lens) and merge the result into each demo map

### 3. Fix the demo links
- Replace `edge=avgCommits` in README and docs links with `edge=dependencies`

### 4. Tests for the dependency view on the sample
- e2e: the dependency view opens a graph on the startup samples
- Unit: sample1 carries a level on every node and an edge of every type (the graph is a canvas, so e2e
  cannot see the edge types)

### 5. Changelog
- One visualization entry: the sample and the demo open the dependency view

## Steps

- [x] Complete Task 1: Extend sample1 by hand
- [x] Complete Task 2: Run dependencyparser in the demo build
- [x] Complete Task 3: Fix the demo links
- [x] Complete Task 4: Tests for the dependency view on the sample
- [x] Complete Task 5: Changelog

## Notes

- dependencyparser is still labelled experimental; the demo build runs it anyway (decided 2026-09-30)
- sample1 keeps pairingRate/avgCommits next to dependencies, so it opens on avgCommits; picking
  `dependencies` in the dependency bar shows the cyclic and upward edges (decided 2026-09-30)
- Verified: dependencyparser + merge on ../visualization and ../analysis take ~20 s each, and every
  level and edge end resolves in the merged tree
