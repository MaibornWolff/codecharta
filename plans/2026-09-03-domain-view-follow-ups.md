---
name: Domain view follow-ups
issue: <#issueid>
state: complete
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
- [x] Complete Task 3: cloud and explorer point at each other
- [x] Complete Task 4: hide a word
- [x] Complete Task 5: window the word list

## Review Feedback Addressed

1. **Windowing never engaged in the real flow (HIGH)**: the viewport searched for its scroll panel by
   walking the DOM on a 30-frame budget. The word list is projected into the explorer's `@if` branch, so
   Angular creates it while the panel does not exist; the budget expired and the list rendered every row
   for the rest of the session. Confirmed in a browser — a three-second pause before opening word mode
   gave all 3000 rows. The panel is now handed over by `ExplorerScrollHostService`, which the explorer
   already registers reactively.
2. **A collapse round trip left a destroyed panel behind (MEDIUM)**: same cause, same fix — the service's
   signal goes null on teardown and carries the new element on re-creation, so the viewport re-attaches.
3. **An open breakdown's height collapsed to 0 (MEDIUM)**: it was re-measured from the DOM, but the
   breakdown only exists while its own row is inside the window. Its height is remembered while that row
   is out of view, and forgotten when the breakdown closes.
4. **"In the window" is not "on screen" (MEDIUM)**: the guard counted the overscan rows, so a picked word
   could open just off screen. It now tests real visibility and centres the row like the file tree does.
   Fixing this exposed a second bug of my own: the effect re-ran on every scroll, dragging the list back
   whenever the reader scrolled an open word out of sight. It follows a *newly* expanded word only.
5. **Dead `index` on a hot computed (LOW)**: removed.

## Notes

- Each task is tested and committed on its own before the next one starts.
- Branch: `feature/domain-view-follow-ups`, off `main` after the word-mode work landed there.
- The visualization keeps *summing* frequencies when it unions separately loaded files, while `ccsh merge`
  now takes the maximum. Deliberate: they are different operations, and the merge rule was chosen to match
  how metrics reconcile.
- `emphasis.focus: "self"` does nothing in echarts-wordcloud — checked in a browser, the other words do not
  dim — so the inspected word is marked by the emphasis shadow alone.
- The word list's viewport has to wait for the panel to be laid out before it can measure: attaching in
  `afterNextRender` alone found a panel of height 0 and fell back to rendering all 3000 rows.

## Verification performed

- Analysis: full `./gradlew test` and `ktlintCheck` green on JDK 17; `integrationTest` (golden test) green,
  including a new step that merges two domain maps.
- Merging two real domain maps through the built `ccsh`: 65 + 18 nodes with 5 shared → 78, higher frequency
  kept on every collision, schema-valid; `--large` yields 0 keys pointing at nodes the output lacks.
- Visualization: 419 unit suites (2847 tests), `tsc`, dependency-cruiser, knip, style lint and all 72 e2e
  tests green.
- Review round: two e2e tests now cover the realistic flow (open the view, pause, then open word mode) and
  the collapse round trip. Both fail against the old attach mechanism and pass with the new one.
- In a browser: the clicked cloud word opens its breakdown and is marked in the cloud; hiding a word takes it
  out of both the cloud and the list and survives a reload; a 3000-word list renders 23 rows instead of 3000,
  keeps its 84008px scroll height, and jumps to a word picked far outside the rendered slice.
