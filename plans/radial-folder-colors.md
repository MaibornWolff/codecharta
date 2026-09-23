---
name: Radial folder colors
issue: none
state: complete
version: 1
---

## Goal

In the sunburst and radial treemap, folders are coloured by the sum of their files against thresholds meant for single
files, so every big folder turns red. Add a **Folders** card to the metrics bar that picks the number a folder shows and
whether folders are tinted by it or stay neutral. Files keep their colour-metric colour, exactly like buildings.

Design template: [`radial-folder-colors.html`](./radial-folder-colors.html) (self-contained, open it in a browser).

## Tasks

### 1. Folder value calculation
- Seven values per folder, computed over all its (non-excluded) files, not only the visible rings:
  - On the file thresholds: `sum` (today), `max` (worst file), `median`, `mean` per file, `avg` per line (weighted by
    the area metric)
  - Own scale: `share ÷ size` (folder's share of the colour metric ÷ its share of the area metric; 1× green, 3× red)
    and `share of red` (share of the area in files at or above the upper threshold; 0 % green, 50 % red)
- File-threshold values go through `getColorByMetricValue`, so colour range, gradient mode and inverted colours apply
- Folder values are computed once per tree/metric change (selector), not per render

### 2. Folder colouring in both radial layouts
- `nodeColor` in `renderer/radialMap/util/radialColor.ts` colours folders from the chosen value; files stay unchanged
- Tinted: value colour mixed toward white by the tint strength (20–100 %); neutral: one grey for all folders
- Flattened and value-less folders keep their current colours
- Tooltip (`radialTooltip.ts`) shows the folder value, e.g. `max 47`

### 3. Preferences
- Three preferences: `radialFolderValue` (default `max`), `radialFolderStyle` (default `tinted`), `radialFolderTint`
  (default `0.5`)
- Each needs actions, reducer, selector and enrolment in `preferencesActions`
- Each needs a `case` in `mapPreferenceToAction` (`load/loadInitialFile.store.ts`), whose default branch throws
- Bump `DB_VERSION` (`stores/rootStore/indexedDB/indexedDBWriter.ts`) with a migration seeding the defaults

### 4. Folders card in the metrics bar
- New segment next to Color, rendered only when `isRadialLayout()` (takes the hidden Height card's slot)
- Card shows the value (e.g. `max`) and the style (`tinted 50 %` / `neutral`); neutral dims the value
- Card body opens the value list: 7 radio rows in two groups, each with a one-line description
- Cog opens folder style: Tinted by value / Neutral, and a tint-strength slider (disabled when neutral)
- Picking a value while neutral switches back to tinted
- Cog popover ends with a `cc-reset-settings-button` ("Reset folder colors"), like the Area, Height and Color popovers:
  keys `preferences.radialFolderValue`, `preferences.radialFolderStyle`, `preferences.radialFolderTint`, back to max,
  tinted, 50 %; check `getPartialDefaultState` resolves `preferences.*` keys
- Reuse `AxisCardComponent` and `SettingsPopoverShellComponent`; match the template's copy

### 5. Legend
- One extra line in the legend for radial layouts, e.g. `folders: their worst file, tinted`, with a tinted swatch
- Own-scale values label their scale (`1× – 3×`, `0 – 50 %`)

### 6. Tests and changelog
- Unit tests: value calculation (each value, excluded files, own scales), `nodeColor`, card, popovers, reset button,
  preferences, migration
- E2E: switch value and style in the sunburst and check the folder colour changes and survives a reload
- `visualization/CHANGELOG.md`: one Added entry for folder colours in the sunburst and radial treemap

## Steps

- [x] Complete Task 1: Folder value calculation
- [x] Complete Task 2: Folder colouring in both radial layouts
- [x] Complete Task 3: Preferences
- [x] Complete Task 4: Folders card in the metrics bar
- [x] Complete Task 5: Legend
- [x] Complete Task 6: Tests and changelog
- [x] Run format:check, npm test, npm run lint, tsc --noEmit and the e2e suite

## Notes

- Decisions (2026-09-23): own card next to Color; all 7 values; default `max`; card opens values, cog opens style; tint
  slider; reset button in the cog popover; saved as personal preferences, not with the map
- Signposts (ghost projection, trail, halo, x-ray) were explored and deferred; the comparison page is at
  https://claude.ai/artifact/VBL3JBTXw745b2UfyjXv54
- The design template is also published at https://claude.ai/artifact/EMLKoWMRVaYBRAS72Fr5Cy (private; the local HTML
  is the reference)
- The 3D map is unaffected: this only changes folder colours in the sunburst and radial treemap
