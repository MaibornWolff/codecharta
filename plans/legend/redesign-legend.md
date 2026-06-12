---
name: redesign-legend
issue: none
state: complete
version: 1
---

## Goal

Migrate the legend panel and its toggle button from `ui/legendPanel` to `features/legend` using the new architecture (zoneless, signals, daisyui/tailwind, no scss). Colors become read-only (no pickers), folder colors (marked packages) are removed, styling follows the color settings popover. Design: `plans/legend/redesign-legend.png`.

## Decisions (clarified with user)

- Delta mode: read-only positiveDelta/negativeDelta swatches + selected
- Edges: keep EDGE metric row + read-only incoming/outgoing swatches when edge metric is set
- Cleanup: delete `ui/legendPanel`; move `mapColorLabel.pipe` to `util/pipes/`
- UX: keep rotated LEGEND button at bottom-right + outside-click close, restyled with tailwind/daisyui
- No panel header, no metric links (follow-up feedback)
- Legend renders above the metrics bar (z-[60] vs zIndex 50)

## Tasks

### 1. Move MapColorLabelPipe to shared util/pipes
- Move `mapColorLabel.pipe.ts` + spec from `ui/colorPickerForMapColor/` to `util/pipes/`
- Update imports in metricsBar colorBandRow and ui colorPickerForMapColor

### 2. Create features/legend
- Stores (thin ngrx wrappers, read-only): areaMetric, heightMetric, colorMetric, edgeMetric, isDeltaState, mapColors, colorRange, selectedColorMetricData, attributeDescriptors
- Services wrapping each store
- Components: legendPanel (button + panel shell, outside-click close), legendMetricRow (label + descriptor title/tooltip), legendColorRow (read-only swatch + mapColorLabel text)
- facade.ts exporting LegendPanelComponent
- Position with `--cc-bottom-bar-height`/`--cc-file-extension-bar-height` vars, offset right when inspector visible (InspectorVisibilityService via sidebarInspector facade)

### 3. Wire up and delete old code
- Point codeCharta.component to features/legend/facade
- Delete `ui/legendPanel/**` (incl. obsolete marked-packages e2e)

### 4. Verify
- Unit tests for new components
- `npm test`, `npm run lint:architecture` (dependency-cruiser), format

## Steps

- [x] Complete Task 1: Move MapColorLabelPipe
- [x] Complete Task 2: Create features/legend
- [x] Complete Task 3: Wire up and delete old code
- [x] Complete Task 4: Verify

## Review Feedback Addressed

1. **Panel header**: Removed the "Legend" header bar per user feedback; panel starts directly with the metric rows
2. **Metric links**: Descriptor links are no longer rendered as anchors; titles are plain text with tooltip
3. **Stacking**: Legend panel and button use z-[60] so they sit above the metrics bar (zIndex 50)

Independent subagent review (fixes applied; "metric key missing from descriptor-less tooltips" was declined as expected behavior):

4. **CHANGELOG**: Added a "Legend panel" entry to the unreleased Changed section
5. **Type duplication**: Extracted `HexMapColor` to codeCharta.model.ts; replaced the three identical `keyof Omit<MapColors, …>` copies (legend, metricsBar `BandMapColor`, colorPickerForMapColor)
6. **Test gap**: Added a spec asserting panel/button `style.right` shift when the inspector sidebar is visible (stubbed InspectorVisibilityService)
7. **A11y**: Swatches got `role="img"` with a readable pipe-based label; toggle button got `aria-expanded` + `aria-controls`
8. **Spec robustness**: `afterEach` now uses `store?.resetSelectors()` so a failed render can't mask the real error

## Notes

- `ui/colorPickerForMapColor` could NOT be deleted: its component is still used by metricsBar's edgeSettingsPopover; only the pipe moved out
- Old e2e tests only covered marked packages, which leave the legend → deleted, not migrated
- `ui/labelledColorPicker` stays (used by 3dPrint logoUpload)
- ngrx gotcha: `MockStore.overrideSelector` patches the shared selector instance globally → instance `store.resetSelectors()` in afterEach is required when overriding selectors
- Verified: full unit suite green (387 suites / 2217 tests), tsc --noEmit clean, depcruise 0 errors (80 pre-existing warnings untouched), biome format clean
