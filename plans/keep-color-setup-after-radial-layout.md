---
name: Keep the color setup when leaving a radial layout
issue: none
state: complete
version: 2
---

## Goal

Switching between the 3D map and Sunburst / Radial TreeMap must not change the color metric or color range.
The layout stops switching "color follows height" off and on behind the user's back; the link is only
changed by the user.

## Tasks

### 1. Regression tests (red)
- Replace `layoutRoundTrip.repro.spec.ts` with a proper spec next to the link effect (real store,
  `LinkColorMetricToHeightMetricEffect` + `ResetColorRangeEffect`): link on, color range 50/100,
  Sunburst → Squarified TreeMap, color metric and range unchanged
- Colour segment spec: in a radial layout with the link on, picking a color metric turns the link off

### 2. Take the layout out of the link (green)
- `heightAndLinkedSelector`: drop `isRadialLayout`; the link is the preference alone
- `colorSegment.component.ts`: `isLinked` no longer depends on the layout
- Keep the color metric selectable in radial layouts: the picker is enabled there even while linked
- Picking a color metric in a radial layout while linked turns the link off (same as unlinking by hand)
- Update the existing effect and colour segment specs that encode the old "ignored in the sunburst" rule

### 3. Changelog
- `visualization/CHANGELOG.md` → Fixed 🐞, one entry, e.g. **Color setup after the radial layouts**:
  switching to the sunburst or radial treemap and back keeps your color metric and color range.
- If the unlink-on-pick is user visible enough, mention it in the same sentence rather than a second entry

## Steps

- [x] Complete Task 1: Regression tests (red)
- [x] Complete Task 2: Take the layout out of the link (green)
- [x] Complete Task 3: Changelog
- [x] Run checks: `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit -p tsconfig.json`

## Notes

- Root cause: b68fc83bc folded `!isRadialLayout` into the link, so entering a radial layout is a silent
  unlink and leaving it a silent relink. Relinking dispatches `setColorMetric(height)`, and
  `ResetColorRangeEffect` gives every `setColorMetric` a fresh range.
- Reproduced (link on, range 50/100, `TEST_FILE_DATA`): radial round trip → 34/67; link off → kept.
  Manual unlink keeps 50/100, manual relink resets to 34/67 — relinking resetting is existing behaviour and
  stays.
- Rejected: only dispatching when height ≠ color — hides the symptom but keeps the layout toggling the link.
- Selection (selected building) survives layout switches; not part of this fix.
