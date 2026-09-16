---
name: domain-view-first-draw
issue: <none>
state: complete
version: unreleased
---

## Goal

Make the domain view usable on huge codebases. Opening the explorer's Words tab currently renders one
row per word in the whole project vocabulary, and every domain setting change writes the domain word
bank to IndexedDB twice on the main thread. Both freeze the UI for seconds.

## Tasks

Measured on a synthetic netbeans-scale project (54,766 nodes, 3.14M word entries). Numbers below are
from those benchmarks, not estimates.

### 1. Render only a first slice while the word list is unmeasured

- `wordListWindow` falls back to `everyRow()` whenever `viewportHeight <= 0`. On first open the
  viewport is always unmeasured: the scroll host only exists once the Words tab renders, and
  `WordListViewport.attachTo` measures in an `effect()` that runs after the first change detection pass.
- Measured with a real render: 1,000 words → 347 ms, 10,000 → 4.2 s, 50,000 → **133 s**.
- Return a small fixed slice instead, keeping the remaining height in the bottom spacer so the
  scrollbar stays honest. The effect corrects the window on the next tick.
- Rewrite the `wordListWindow` spec case that currently pins the old behaviour, and add a component
  test that renders a large vocabulary with no scroll host and asserts the row count stays capped.

### 2. Keep tie order deterministic when picking the top words

- `selectTopWords` full-sorts the whole root vocabulary — 44 ms at 300k words, and it runs **twice**
  per cloud render (once in `renderedWords`, again inside `buildWordCloudOption`).
- Structural first: pass the already-selected words into `buildWordCloudOption` so it stops re-selecting.
- Then swap the full sort for a heap top-N (0.7 ms at 300k). A heap does not preserve input order, and
  tie order decides which words make the cutoff, so carry the input index and break ties by it.

### 3. Stop persisting the derived word bank

- `writeCcState` puts the whole `CcState` into IndexedDB; an IDB `put` structured-clones it on the main
  thread. The bank is in there twice: once per file, once merged in `domainLensSource.words`.
- Measured: **2785 ms** per save, vs **74 ms** with both banks removed.
- `domainLensSource.words` is pure derived state — `reconcileAfterLoad` already recomputes it from the
  files on every load. Strip it before the write with a pure helper in the save effect.
- `applySlice` and `missingKeysOf` must both treat `words` as optional, or every reload reports it as a
  setting that could not be restored.

### 4. Keep the domain word bank out of the structure lens clones

- `structureTreeSelector` deep-clones the file states, `AggregationGenerator` clones them again, and
  `viewIndependentTreeSelector` clones the result — the bank rides through all three and no consumer
  reads it (`accumulatedData`, `nodeMetricData`, `metricRuleLeaves`, `viewIndependentTree` touch only
  `.map` / `.fileMeta`).
- Measured: 183 ms per clone with the bank, 13 ms without.
- Replace `domainWords` with `{}` at the source, before the deep clone.

### 5. Do not debounce the first cloud draw

- `RENDER_DEBOUNCE_MS` (150) plus `LAYOUT_SETTLE_MS` (200) add a flat delay to every draw, including
  the first one after switching to the domain view.
- Skip the debounce only when nothing has been drawn yet. Drop this step if it causes a second layout
  once the ResizeObserver reports its first size.

## Steps

- [x] Complete Task 1: Render only a first slice while the word list is unmeasured
- [x] Complete Task 2: Keep tie order deterministic when picking the top words
- [x] Complete Task 3: Stop persisting the derived word bank
- [x] Complete Task 4: Keep the domain word bank out of the structure lens clones
- [x] Complete Task 5: Do not debounce the first cloud draw
- [x] Update `visualization/CHANGELOG.md`
- [x] Full gate green: `npm run format:check`, `npm test`, `npx tsc --noEmit`, `lint:architecture`, `lint:styles`

## Review Feedback Addressed

1. **Branch name**: `perf/` is not one of the allowed types; renamed to `tech/domain-view-first-draw`.
2. **`missingKeysOf`**: takes no optional-key set, so Task 3 must thread one through or the restore
   dialog fires on every reload.
3. **Heap tie order**: a heap loses the stable sort's input order, which decides the cutoff; Task 2
   carries the input index.

## Notes

- `buildWordOccurrenceTree` was investigated and is **not** a bottleneck: 19 ms even when folders carry
  aggregated subtree vocabularies. A prebuilt word index costs 355 ms to save 6 ms — not worth it.
- The echarts layout is ~100 ms and flat in codebase size; `gridSize` and `shrinkToFit` barely move it.
- Task 3 halves the freeze but cannot remove it: the per-file banks must stay persisted because
  `getMergedDomainWords` re-derives the merged one from them. ~1.4 s per settings save remains. The
  real fix is writing `files` to its own IndexedDB record, touched only by file actions — needs a
  `DB_VERSION` bump, a migration and a reader split. Deliberately out of scope here.
- Clicking a word in the cloud expands the explorer, which resizes the cloud container and triggers a
  full echarts relayout. By design, but worth revisiting.
