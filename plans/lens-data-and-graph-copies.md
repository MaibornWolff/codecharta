---
name: lens-data-and-graph-copies
issue: <none>
state: progress
version: unreleased
---

## Goal

Cut the number of full copies the app makes of the loaded node graph, so that a large project has
headroom for the dependency and clusters lenses, and write down the rule that keeps a new lens from
repeating what the domain lens did.

## Tasks

Measured on `netbeans.cc.json` (830 MB): boot peaks at 3909 MB of a 4295 MB heap limit. The multiplier
is not the number of lenses but the number of copies of the same graph. Per-node metric attributes ride
inside every one of them, so metrics pays this tax without contributing much data of its own.

### 1. Stop writing back the files that were just restored

- A restore reads the files record and the post-load save writes the identical files straight back:
  ~940 MB of structured clone and 6.3 s, measured, on every reload.
- Skip the write when the files being saved are the ones that were read, by identity. The restore puts
  the very array it read into the store, so identity is the honest test — a value comparison would cost
  as much as the write.

### 2. Remove the redundant structure-tree clone

- `structureTreeSelector` deep-clones every visible file state and hands the clone to
  `AggregationGenerator.calculateAggregationFile`, which clones its input again. For a single loaded
  file the aggregation returns its own clone, so the outer one is copied and thrown away.
- Only safe if nothing downstream mutates what the selector returns: check `DeltaGenerator` (it can
  return a reference to a file's own map) and `calculateNodeMetricData`. Keep the clone on any path
  where a consumer does mutate, rather than making the selectors defensive everywhere.

### 3. Do not build a node graph on restore that is then discarded

- `loadFiles.useCase` turns the restored file states back into name/data pairs, `commit` parses them
  into a fresh graph, and `setFiles(savedFileStates)` immediately replaces that graph with the
  originals. The parsed graph is garbage the moment it is built.
- `commit` also emits `filesLoaded`, validates and de-duplicates, so the reconciliation and the
  loading indicator depend on it. Only the graph building is redundant, not the commit.

### 4. Write down the rule

- A separate document, so whoever adds the dependency and clusters lenses reads it without reading
  this plan: per-file lens data is source and lives in the file; anything merged, indexed or
  aggregated across files is derived and belongs in a selector, never in `CcState` and never persisted.
- Name the concrete damage the domain lens took from breaking it, so the rule is read as a lesson and
  not a preference.

## Steps

- [ ] Complete Task 1: Stop writing back the files that were just restored
- [ ] Complete Task 2: Remove the redundant structure-tree clone
- [ ] Complete Task 3: Do not build a node graph on restore that is then discarded
- [ ] Complete Task 4: Write down the rule
- [ ] Re-measure boot heap on the 830 MB project and record the result here
- [ ] Full gate green: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`

## Notes

- Copies of the graph that exist by construction, before this work: the store's own files, the
  `structureTree` result, the `accumulatedData` clone and the `viewIndependentTree` clone. The last two
  are memoized selectors that decorate in place, so removing those copies means making decoration
  immutable — a redesign, deliberately out of scope here and called out in the rule document instead.
- `klona/json` is a real deep copy, so each copy duplicates every node's `attributes` record.
