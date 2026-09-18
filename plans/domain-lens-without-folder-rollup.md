---
name: domain-lens-without-folder-rollup
issue: <none>
state: progress
version: unreleased
---

## Goal

Stop writing the directory roll-up and full tfidf precision into the domain lens, so a project carries
its vocabulary once per file instead of once per file and every ancestor, and let the visualization
derive a folder's words when it needs them.

## Tasks

Measured on `netbeans.cc.json` (830 MB, api 2.0), where the domain lens is 619.9 MB of the file across
10,373,371 word entries:

```
on folders   6,958,454 entries (67.0%, ~416 MB) across 9,318 nodes
on files     3,424,996 entries (33.0%, ~205 MB) across 28,118 nodes
tfidf        180.6 MB, 12.9 decimals on average, 15 at most
distinct words 166,601, each written 62.3 times on average
```

### 1. Write a word only for the file it came from

- `SourceAnalyzer.buildWordsByPath` rolls every file's words up into each ancestor directory through
  `DirectoryWordAggregator`, up to the project root. That roll-up is two thirds of the entries.
- Drop the aggregation; `DirectoryWordAggregator` and its test go with it.
- Keep the File/Folder decision in `DomainProjectGenerator.buildDomainLens`. It looks dead once no folder
  entry is produced, but a piped project merged in can still carry folder ids.
- `--limit`'s help text promises that "a folder aggregates the words that survived each of its files'
  limit". That stops being true — rewrite it.

### 2. Round tfidf

- The scores are serialized at full double precision, which is ~29% of the lens.
- Round to 3 decimals in `DomainProjectGenerator.toDomainWord`, at the boundary where the lens is built.
- 3 decimals cannot collapse a real score. `TfIdfCalculator` multiplies a term's **corpus total** count by
  `log10(totalFiles / filesWithTerm)`, so a non-zero score is at least `log10(2) ≈ 0.3`; measured, the
  smallest in the benchmark is 4.45 and the largest 109,618.9, and no rounding down to 2 decimals turns
  any of the 10.4M values into zero. Test both ends anyway: a large score keeps its integer part, a small
  one stays non-zero.

### 3. Derive a folder's words in the visualization, always

- A folder's words are the sum of the files beneath it, combined with the existing
  `sumFrequenciesAndKeepStrongestTfidf` — the analysis roll-up summed frequencies and re-read each word's
  score too, because a score belongs to the word and the corpus, not to the file.
- Derive them on demand through an index memoized on the bank, holding each folder's aggregate once it is
  asked for. Which paths are folders comes from the bank's own keys — a path that is an ancestor of
  another key — so the cloud does not have to wait for the structure tree to be built.
- **Ignore any folder entry the lens does carry**, rather than deriving only when one is absent. Merging
  a file written by the old parser with one written by the new one would otherwise show one folder's
  numbers as a recorded roll-up and its neighbour's as a derived sum, in the same tree.
- Consumers that need this: `projectWordsSelector` (the root cloud, shown as the view opens),
  `createWordsForSelectedNodeSelector`, `DomainExplorerSelection.topWords` (the hover tooltip, which
  walks folders one at a time — memoize per path, not per call) and `pathsWithDomainWordsSelector`, which
  must now mark a folder whose files carry words.
- `wordOccurrences.countOccurrences` already falls back to summing its children. Make it always sum for a
  folder and read a recorded entry only on a leaf, for the same reason — the tree says which is which.
- Do not roll up eagerly in `getMergedDomainWords`: that repeats at load exactly the work this removes
  from the file, and puts derived data into `domainLensSource.words` — see `LENS_DATA_RULES.md`.

## Steps

- [x] Complete Task 1: Write a word only for the file it came from
- [x] Complete Task 2: Round tfidf
- [x] Complete Task 3: Derive a folder's words in the visualization, always
- [x] Update `analysis/CHANGELOG.md` (no visualization entry — see the note below)
- [x] Analysis gate green: `./gradlew ktlintCheck test` in `analysis/`
- [x] Visualization gate green: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit`
- [x] Re-measure a real project: the file's size
- [x] Measure the time the domain view takes to open, now that the root cloud is summed on demand

## Notes

- The visualization test that matters most: a bank carrying file entries only, asserting
  `projectWordsSelector` returns the summed root. That is the one that would have caught an empty domain
  view before a reader did.
- Aggregating the root walks every file's words once — about 3.4M map operations on the measured
  project. It happens when the domain view opens and once per file-set change, not per frame.
- The two changes are independent of each other; task 2 alone is worth ~100 MB and touches one function.
- Only `analysis/CHANGELOG.md` gets an entry. The visualization shows the same words in the same places
  either way — deriving them rather than reading them is invisible, and a release note for it would
  describe the mechanism rather than the change.
- `domainWord.combiners.ts` moved to `util/`: `lenses/` may not import from `load/`
  (`load-orchestrator-not-imported-by-lower-layers`), and both sides now sum words the same way.

- Measured afterwards by parsing `visualization/app` (1,331 files) with both binaries:

  ```
  file                   5.51 MB  ->  1.87 MB
  domain lens            ~5.3 MB  ->  1.72 MB      (4.38 MB with the roll-up reconstructed)
  lens nodes             1,742    ->  1,331        (one per file, no folders)
  word entries           90,633   ->  35,211
  tfidf                  15 decimals -> 3
  ```

  The roll-up alone is 60.8% of the lens here; on a deeper tree with a larger vocabulary it was 67%.

- What the root cloud now costs, summed on demand instead of read from the file (the index's own code run
  over the real banks; the largest is streamed out of the file and its tree flattened, which changes only
  how the index is built, not the sum being timed):

  ```
  800k entries / 20,000 files     index 55 ms, root cloud  61 ms, again 0.00 ms
  3.4M entries / 28,082 files     index 27 ms, root cloud 356 ms, again 0.01 ms
  ```

  356 ms once, when the domain view opens on the largest project we have, against the 416 MB of folder
  entries that no longer have to be parsed, stored and cloned on the way in. Both read stores are
  `providedIn: "root"` but injected only by the domain view and the word cloud, and `store.select` is
  lazy, so nothing derives at boot.

- Summing the occurrence tree's folders cannot disagree with the cloud: `viewIndependentTreeSelector`
  carries no blacklist, so no file the bank counts is missing from the tree it is summed over.

- The first three measurement runs reported no change at all, because `./gradlew :ccsh:installDist` writes to
  `ccsh/build/install/ccsh/` and leaves `build/install/codecharta-analysis/` — the path the docs give and the
  one I was running — untouched. Only the root `./gradlew installDist` refreshes it. Check the jar's timestamp
  before trusting a measurement of a CLI change.
