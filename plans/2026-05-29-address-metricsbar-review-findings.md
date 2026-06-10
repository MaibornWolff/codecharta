---
name: address-metricsbar-review-findings
issue: ""
state: complete
version: <next>
date: 2026-05-29
branch: fix/explorer-sort-dropdown-auto-close
topic: "Fix all findings from the branch-change review of the ribbonBar→metricsBar redesign"
tags: [plan, visualization, metricsBar, review, cleanup, bugfix, test]
---

# Address metricsBar review findings

## Goal

Resolve the 27 confirmed findings from the branch review (the stray `*.cc.json.gz` data dumps are
excluded — the user removed those). Scope: three color-popover bugs, dead/over-generalized code in
the new `metricsBar` feature, area/height duplication, service cleanup, SCSS/hygiene leftovers from
the ribbon removal, and the lost unit-test coverage.

## Tasks

### 1. Color settings popover bugs
- Make `parseNumberInput` NaN-safe and write the clamped value back into the input element (#13, #14).
- Guard the color-range slider input handlers against NaN, matching the sibling popovers (#13).
- Derive the Invert-Colors checkboxes from the store (compare `mapColors` vs `defaultMapColors`)
  instead of write-only local signals (#15).
- Drop the unused `isDeltaStateSelector` input from `metricColorRangeColorsSelector` (#16).
- Scope the range-diagram d3 selection to the component host element, not a global id (#17).

### 2. Remove dead / over-generalized metricsBar code
- `axisCard`: make the no-search body a non-interactive `<div>` (not a clickable button); drop
  `metricNameClick`/`handleMetricNameClick`, unused inputs (`glyphTemplate`, `metricNameTitle`,
  `bodyAnchorName`), the `[footer]` slot, the glyph block and `NgTemplateOutlet`; de-duplicate the
  two body branches via a shared `ng-template`; make `cardClasses` a constant (#5, #6, #11).
- Migrate the delta color "Settings" segment from `MetricSegmentComponent` to `cc-axis-card`
  (cog-only, no search popover); delete `MetricSegmentComponent` and the duplicate anchor name
  (#3, #4, #7).
- `edgeSegment`: remove the dead `metricData` signal, `currentMetricData` computed, and import (#9).
- Remove the unused `#searchPopover` template refs from all four segments (#10).

### 3. Dedup segments + service cleanup
- Extract a shared `DistributionSegmentComponent` for area/height (preserve every testId) (#8).
- Multicast `NodeSelectionService.createNodeObservable()` with `shareReplay` (#2).
- Inject `ScenariosService` directly in `labelsScenariosSegment` and delete `ActiveScenarioService`;
  rename `ensureLoaded()` → `loadScenarios()` at the call site (#19).

### 4. SCSS + hygiene
- Delete `visualization/ready-for-deletion/` and the dead `ui/dialogs/dialogs.ts` barrel (#21, #24).
- Remove orphaned `matSelectMetricChooser.scss` + `matConfirmationDialog.scss` and their `@use` lines (#22, #23).
- Fix the stale `98px` static fallback + misleading "ribbonBar" comment in
  `attributeSideBar.component.scss` → use `var(--cc-bars-height, …)` (#20).
- Drop the redundant `!important` in `app.scss` (#25).
- Remove the dead `bottomBarHeight` (always 0) subtraction in `screenshot.service.ts` (#26).

### 5. Restore + add tests
- Recover the 3 deleted specs (search pipe, attribute-type selector, nodeSelection service) at their
  new `metricsBar` paths via `git show main:…`, updating only imports (#1).
- Add a spec for `axisCard` and for the new `DistributionSegmentComponent` (#12).

### 6. Verify
- `tsc --noEmit`, full `npm test`, `npm run format`; run a verification workflow; update CHANGELOG.

## Steps

- [x] Task 1: color popover bugs
- [x] Task 2: dead code removal
- [x] Task 3: dedup + services
- [x] Task 4: scss + hygiene
- [x] Task 5: tests
- [x] Task 6: verify (tsc + 346 suites/1974 tests + clean AOT + adversarial verification workflow: clean, no regressions)

## Notes

- **Excluded:** stray `*.cc.json.gz` dumps (user removed TKE/DES). `RestyleImages/` left in place —
  it's referenced by tracked plan docs; the user decides what lands when committing.
- **#18 (convert color-popover children off `@Input()`/`OnChanges` to signals):** the slider/diagram
  drag + d3 logic has zero test coverage and the finding is explicitly "not a bug". A full signal
  rewrite is high-risk/low-value; scope it to adding `OnPush` only where provably safe, otherwise
  leave the deeper rewrite as a documented follow-up.
- **Invert-colors (#15):** derivation compares against `defaultMapColors`; residual edge case is
  custom picker colors that coincide with a swap — strictly better than today's write-only signal.
</content>
