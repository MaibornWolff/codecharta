# Lens data: what may enter the store, and what a copy costs

Written after the domain lens made a large project unusable in the browser. It is not a style guide —
every rule here was paid for once already, and the cost is given with each one.

The visualization holds a whole project in memory: the loaded files, the tree the map is built from,
and the render model. On an 830 MB `cc.json` that is roughly 3 GB of JS heap against a 4.3 GB ceiling.
Two more lenses are coming (dependencies, clusters). Whether they fit is decided by these rules, not by
how many bytes each lens adds.

## 1. Derived data never lives in the store

**Per-file lens data is source.** It arrives in the file and stays on the file — `fileSettings.domainWords`,
the dependency lens's `edges`, a node's metric `attributes`.

**Anything merged, indexed or aggregated across files is derived.** It belongs in a selector, computed
on demand. Not in `CcState`, not persisted, not written back into a file.

The domain lens broke this: the word bank merged from every loaded file was stored in
`domainLensSource.words`, beside source state. Everything that went wrong followed from that one
decision:

| Symptom | Cost |
| --- | --- |
| Every settings save re-wrote the bank | 2851 ms per save, on the main thread |
| The structure tree deep-copied it on every recompute | the bank rides in every graph copy |
| On restore the persisted bank was applied over the rebuilt one | the domain view came back **empty**, and reloading made it worse |
| A session from before the split kept it alive during boot | 631 MB of an 830 MB file |

`reconcileAfterLoad.mergeFileSettings` still writes five merged values into the store — blacklist,
marked packages, both attribute maps, and the word bank. Only the bank was ever big enough to hurt.
The pattern is the debt; the size decides when you pay.

## 2. Omit what you do not persist — never write it empty

A derived value left out of the persisted record must be **absent**, not `{}` or `[]`.

The restore applies the persisted state on top of what it just rebuilt from the files, because
persisted beats file-derived. An absent key is skipped. An empty one is applied — and wipes the
rebuilt value. That is exactly how the domain view came back empty after a reload.

If a value is stripped in more than one place (the write path and a schema migration, say), strip it
through **one function**. The wipe survived review because the write path and the migration each had
their own idea of the persisted shape.

## 3. Count the copies of the node graph, not the bytes of your lens

`util/clone.ts` is `klona/json`: a real deep copy. Every copy of the graph duplicates every node and
every node's `attributes` record — so it duplicates the metrics lens in full, every time.

Copies that exist by construction today:

- the files in the store,
- `structureTreeSelector`'s result,
- `accumulatedDataSelector`'s clone (memoized, decorates in place),
- `viewIndependentTreeSelector`'s clone (memoized, decorates in place).

Three of those are retained, because `createSelector` holds its last result. **Adding a lens costs one
graph's worth of source data multiplied by that number.** Cutting the count is worth more than
shrinking any single lens.

Before adding a copy, ask whether the consumer mutates. `DeltaGenerator` does — it writes deltas, file
counts and zeroed attributes into the nodes it walks — so the delta path must copy. The aggregation
path copies its own input, so its caller must not. `calculateNodeMetricData` and the explorer
selectors only read.

**Still open:** the two memoized clones above exist only because decoration mutates. Making decoration
return new nodes instead would remove them, and that is the next real win.

## 4. Persistence clones on the main thread, per record

An `IndexedDB` `put` structured-clones its value synchronously, in the renderer. One record holding
everything means every save pays for everything: a single 830 MB project costs ~6 s and ~1 GB of heap
per write.

So: **split persisted records by source and by lens**, and write a record only when its own data
changed. A settings change must not re-write the loaded maps. A restore must not write back the files
it just read — identity is the honest test for that, since a value comparison costs as much as the
write.

Beyond roughly 2-3× the current largest project, no amount of trimming is enough and the answer is
lazy hydration: read a lens's record when its view opens, not on boot.

## Checklist for a new lens

- [ ] Per-file data lands on the file; nothing merged is dispatched into `CcState`.
- [ ] Cross-file views are selectors, and are not persisted.
- [ ] Anything deliberately not persisted is omitted, through the same function everywhere.
- [ ] Its record is written only when its own data changed.
- [ ] It adds no new deep copy of the node graph; if it must copy, the mutation that forces it is named
      in a comment.
- [ ] Measured on a large project — heap peak and save duration — not on a sample file.
