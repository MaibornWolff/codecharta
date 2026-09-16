---
name: Configurable center-map zoom
issue: <#issueid>
state: complete
version: 1
---

## Goal

Let each user pick the zoom level the compass button applies. Today `fitCameraToBoundingSphere`
hard-codes `setZoomPercentage(140)`; instead it should apply a persisted per-user preference,
editable by right-clicking the compass button.

## Tasks

### 1. New preference `centerMapZoom`

- Add a slice under `stores/preferences/store/centerMapZoom/` modelled on `maxTreeMapFiles`
  (actions, reducer with `defaultCenterMapZoom = 140`, selector, reducer spec).
- Add the key to `Preferences` in `model/state.model.ts`, register the reducer and default in
  `preferences.reducer.ts`, expose it on `preferences.readWindow.ts`, and export the action and
  selector from the write/read facades.
- Add the action to `preferencesActions` in `preferences.actions.ts` — that is what enrolls it in
  `actionsRequiringSaveCcState` and gets the value written to IndexedDB.

### 2. Make the saved value load again

Persistence is IndexedDB (`CodeCharta` DB, `ccstate` store), not localStorage, and it needs two more
steps that CLAUDE.md's "Adding a New Setting" checklist omits:

- `mapPreferenceToAction` in `load/loadInitialFile.store.ts` is an exhaustive switch whose `default`
  branch throws. Without a new `case` the restore blows up — this is not optional.
- Bump `DB_VERSION` in `stores/rootStore/indexedDB/indexedDBWriter.ts` and add a migration seeding
  the default into existing records, registered in `CCSTATE_RECORD_MIGRATIONS`, following
  `migrateCcStateRecordToV20`. Otherwise every existing user gets the "could not be fully restored"
  dialog on their next load.

### 3. Apply the preference when fitting

- `ThreeMapControlsService.fitCameraToBoundingSphere` replaces the literal `140` with the preference
  value, clamped to `MIN_ZOOM`/`MAX_ZOOM`.
- The renderer layer may read the store — `threeViewer/stores/threeScene.store.ts` already reads
  preferences synchronously through `PreferencesReadWindow`. Follow that rather than threading the
  value through every call site.
- All three `autoFitTo` callers then get the preference: the toolbox button,
  `autoFitCodeMap.effect.ts` (file load / file-panel change), and the `threeViewer.service.ts`
  wrapper. A different zoom on load than on the button would surprise the user.
- Leave `scenarioApplier.service.ts` alone — it restores an explicit camera position and suppresses
  the auto-fit on purpose.

### 4. Right-click popover on the compass button

- `centerMapButton.component.html`: keep `(click)="autoFitTo()"`, add
  `(contextmenu)` with `preventDefault()` that calls `showPopover()` on the shell dialog
  (`popovertarget` is left-click only), plus `style="anchor-name: --center-map"` and
  `data-anchor-name="center-map"`. Mention right-click in the `title`.
- New `centerMapZoomPopover` component next to the button, using `cc-settings-popover-shell` with
  `positionArea="bottom span-right"` (the toolbox sits at `top-0`) and `cc-slider-number-input`
  bounded by `MIN_ZOOM`/`MAX_ZOOM`.
- Contents: the zoom slider, a "Use current zoom" button reading `zoomPercentage$`, and a reset to
  140. Check whether `cc-reset-settings-button`'s `settingsKeys` paths reach the preferences slice;
  if not, a plain button dispatching the default.

### 5. Tests, changelog, checks

- Specs: reducer, button (left click still fits, right click opens and does not fit), popover
  (slider dispatches, "use current zoom" takes the live value, reset). AAA comments, `should…` names.
- One `visualization/CHANGELOG.md` entry under Added 🚀.
- `npm run format:check`, `npm test`, `npm run lint`, `npx tsc --noEmit -p tsconfig.json`.

## Steps

- [x] Complete Task 1: New preference `centerMapZoom`
- [x] Complete Task 2: Make the saved value load again
- [x] Complete Task 3: Apply the preference when fitting
- [x] Complete Task 4: Right-click popover on the compass button
- [x] Complete Task 5: Tests, changelog, checks

## Follow-up: centering framed the map behind the metric bar

Measured after the feature landed: the fit centred the map on the whole canvas, while the metric bar,
file-extension bar and bottom bar float over it, so the map sat ~84px too low and its lower edge was
hidden. Pre-existing, not caused by the zoom preference. Vertical only — the horizontal offset from
the explorer was reviewed and left alone.

- `util/barLayout.ts` now owns the bar gap, the default bar heights and the bar height CSS variable
  names, shared by `barShell.directive.ts` and the renderer. Structural move, no behaviour change.
- The metric bar publishes its height like the other bars, via the existing `PublishesHeightDirective`.
- `liftMapAboveBottomBars` moves camera and target together after the zoom is applied, so the map
  centres in the strip the bars leave visible while view direction and distance stay put. The renderer
  reads the heights off the canvas's computed style, which keeps it from importing a feature.

## Notes

- Zoom percentage is already a first-class concept: `MIN_ZOOM = 10`, `MAX_ZOOM = 200`,
  `zoomPercentage$`, `getZoomPercentage`/`setZoomPercentage` in `threeMapControls.service.ts`, so the
  slider, the stored value and "use current zoom" all speak the same scale.
- The zoom slider under the view cube (`features/viewCube/zoomSlider/`) already shows this exact
  percentage, so "use current zoom" reads back the number the user is looking at.
- `features/shared/components/floatingMenu/` is the established right-click surface (it already
  suppresses the native menu and self-dismisses). Use the settings popover shell if the slider layout
  wants it, but check the floating menu first — it is the pattern `nodeContextMenu` and
  `fileExtensionBarSegment` follow.
- Right-click has no touch equivalent; out of scope, the button keeps working with the default there.
- Built with `FloatingMenuComponent`, not the settings popover shell: it already suppresses the native
  context menu, clamps to the viewport and dismisses itself.
- The slider applies its value to the camera as it moves. Without that preview the number is a blind
  guess, which is the problem the feature exists to solve.
- The menu renders from `ViewCubeToolboxComponent`, as a sibling of the toolbar, not from the button.
  The toolbar's `-translate-x-1/2` would otherwise become the containing block of the fixed-positioned
  menu and place it away from the cursor. A spec asserts the menu is not inside `.join`.
- Verified in a browser (scratch-copy build, Playwright): the menu opens under the compass, clamped
  inside the viewport and unobstructed, both with and without the inspector open; the chosen zoom is
  what the compass centres at, and it survives a reload.
