---
name: Domain view follow-ups
issue: <#issueid>
state: progress
version: 1
---

## Goal

Close five gaps left open around the domain view: the `domain` lens is opaque and therefore
unmergeable, the word cloud and the explorer's word mode do not point at each other, noisy words
cannot be dropped from the UI, and the word list renders every word it has.

## Decisions

- Type the lens **before** merging it: a merge written against the opaque `JsonElement` would be
  thrown away by the very next task.
- Merge rule: **max wins** on both `frequency` and `tfidf`, matching `NodeMaxAttributeMerger`. The
  visualization keeps summing frequencies when it unions *separately loaded* files — a different
  operation (several files shown side by side, not one file reconciled from two scans).
- A hidden word is hidden **everywhere** (cloud and word list), persists like the other domain
  settings, and is restorable from a control in the domain bar.
- The word list gets **fixed-height windowing** — spacers above and below a rendered slice.

## Tasks

### 1. Type the `domain` lens (analysis)
- `DomainLens`/`DomainNode`/`DomainWord` in `:model` next to `MetricsLens` and `DependencyLens`;
  `LensSet.domain` becomes typed and leaves `opaqueLenses`.
- DTO + `CcJsonV2Gson`: `domain` joins the typed lens keys. It stays **nullable** so a project
  without the lens does not grow a `"domain": {}` key, and `nodes` stays omitted when empty so the
  reserved-empty form round-trips.
- Emitted JSON must stay byte-identical (node order, key order, `tfidf` omitted when absent), so
  fixtures, schema and `meta.checksum` are untouched.
- Move the parser's `DomainProjectGenerator` and `StructureModifier`'s `DomainLensRekeyer` onto the
  typed lens; drop the JSON-poking both do today.

### 2. Merge two domain maps (analysis)
- `DomainLens.merge(other)`: union by node id, and on a colliding word keep the higher `frequency`
  and the higher `tfidf` independently.
- `ProjectMerger` merges it like the other typed lenses, so `mergeOpaqueLens` no longer sees
  `domain` and its `MergeException` stops firing for it.
- Word order within a node stays deterministic (frequency desc, then text) so the output is stable.

### 3. Point the cloud and the explorer at each other (visualization)
- Left-clicking a word in the cloud toggles it as the inspected word, instead of doing nothing.
- The cloud draws the inspected word in an accent colour, so what is expanded in the explorer is
  visible in the picture.
- The word list scrolls the inspected word's row into view when it is set from outside.

### 4. Hide a word (visualization)
- `Hide word` in the cloud's word menu; hidden words leave both the cloud and the word list.
- `domainState.hiddenWords`, persisted with the rest of the domain state.
- A `Hidden Words` segment in the domain bar states the count and lists them with a restore button
  each, plus restore-all.

### 5. Window the word list (visualization)
- Render only the visible slice of word rows plus an overscan, with a spacer above and below.
- One word is expanded at a time; its breakdown is measured so the rows below it stay put.
- Falls back to rendering everything when the list is short enough not to need it.

## Steps

- [x] Complete Task 1: type the `domain` lens
- [x] Complete Task 2: merge two domain maps
- [ ] Complete Task 3: cloud and explorer point at each other
- [ ] Complete Task 4: hide a word
- [ ] Complete Task 5: window the word list

## Notes

- Each task is tested and committed on its own before the next one starts.
- Branch: `feature/domain-view-follow-ups`, off `main` after the word-mode work landed there.
