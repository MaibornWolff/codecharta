---
name: view-cube-toolbox
issue: ""
state: todo
version: 1.142.0
date: 2026-04-30
git_commit: b5fbb5f632b189c08dfe95b531dc5bda37a79837
branch: main
topic: "View-Cube Toolbox (Center / Screenshot / Presentation / Reset)"
tags: [plan, visualization, viewcube, toolbox, daisyui, signals, zoneless]
---

# View-Cube Toolbox (Center / Screenshot / Presentation / Reset)

## Goal

Replace the lone circular "Center Map" button above the view cube with a small horizontal **toolbox** (DaisyUI `join` button group) holding four small icon buttons:

1. **Center Map** — `fa-compass` (existing)
2. **Screenshot** — `fa-camera`
3. **Presentation Mode Toggle** — `fa-lightbulb-o`
4. **Reset Map** — `fa-refresh`

Each button reuses the existing logic from the deprecated toolbar widgets (or, in the case of Center Map, from the existing `CenterMapButtonComponent`). The new components live under `features/viewCubeToolbox/`, are zoneless-compatible (`ChangeDetectionStrategy.OnPush`, signals only, `toSignal(...)`, no `async` pipe, no `Mat*` widgets), and use DaisyUI/Tailwind utility classes with as little custom SCSS as possible.

## Overview

### Current

```
                                                        ┌────┐  ← cc-center-map-button (circular, 36×36)
                                                        │ ⌘  │
                                                        └────┘
                                                       ┌──────┐
                                                       │      │ ← view cube canvas (200×200)
                                                       └──────┘
                                                       [zoom -] ━━━━ [zoom +] 100%
```

### After this plan

```
                                              ┌──────┬──────┬──────┬──────┐
                                              │  ⌘   │ 📷   │  💡  │  ↻   │ ← cc-view-cube-toolbox
                                              └──────┴──────┴──────┴──────┘
                                                       ┌──────┐
                                                       │      │ ← view cube canvas (200×200, unchanged)
                                                       └──────┘
                                                       [zoom -] ━━━━ [zoom +] 100%
```

`⌘ = fa-compass`, `📷 = fa-camera`, `💡 = fa-lightbulb-o` (gets `btn-active` when presentation mode is on), `↻ = fa-refresh`.

## Current State Analysis

- `ViewCubeComponent` (`ui/viewCube/viewCube.component.{ts,html,scss}`) renders `<cc-center-map-button>` and `<cc-zoom-slider>` next to its Three.js canvas. The host is positioned `absolute; right: 0; top: 10px; z-index: 11`, with `right: 350px` when the attribute side bar is open.
- `CenterMapButtonComponent` (`ui/viewCube/centerMapButton/centerMapButton.component.ts:13`) calls `inject(ThreeMapControlsService).autoFitTo()`. Its template/SCSS positions a circular 36×36 button at `top: 0; right: 15px` with `cc-primary-color` background.
- `ScreenshotButtonComponent` (`ui/screenshotButton/screenshotButton.component.ts`) — already `@deprecated`. Owns the `Ctrl+Alt+S` (file) / `Ctrl+Alt+F` (clipboard) hotkeys via `hotkeys-js`. The click handler is `makeScreenshotToFile()` or `makeScreenshotToClipboard()` depending on `globalSettingsFacade.screenshotToClipboardEnabled$()`. Tooltips also flip with that flag. Uses `html2canvas-pro` and `ThreeRendererService` / `ThreeSceneService` / `ThreeCameraService` directly. Long enough that we **call back into the deprecated component as a service-style helper** — see "Architecture and Code Reuse" below.
- `PresentationModeButtonComponent` (`ui/toolBar/presentationModeButton/presentationModeButton.component.ts`) — already `@deprecated`. Toggles `setPresentationMode({ value })` based on the slide-toggle event; reads `isPresentationModeSelector`. Uses `MatSlideToggle`.
- `ResetMapButtonComponent` (`ui/resetMapButton/resetMapButton.component.ts`) — already `@deprecated`. Opens `ConfirmResetMapDialogComponent` via `MatDialog` with `panelClass: "cc-confirm-reset-map-dialog"`. The dialog itself stays out of scope (still Material).
- DaisyUI 5 + Tailwind 4 are available; the navBar feature already uses `join`, `btn-ghost`, `btn-square`, `btn-sm`, `btn-active` patterns we can mirror.

## Desired End State

- A new feature folder `app/codeCharta/features/viewCubeToolbox/` owns the toolbox.
- `ViewCubeComponent` imports and renders `<cc-view-cube-toolbox>` instead of `<cc-center-map-button>`.
- All four toolbox sub-components are `OnPush`, signals-only, no `async` pipe, no `Mat*` import (they delegate dialog opening to `MatDialog` *as an injected service* — that's not a UI widget).
- The deprecated `CenterMapButtonComponent` keeps its file but is no longer imported anywhere; the other three deprecated components stay deprecated (already done by the navbar plan).
- Visual: a single `join` shell with four `join-item btn btn-sm btn-square` buttons. The presentation-mode button gets `btn-active` while the mode is on.

## What We're NOT Doing

- **Not** redesigning `ConfirmResetMapDialogComponent`. It stays Material; we only re-open it from the new button.
- **Not** moving / changing the view cube's Three.js canvas or the zoom slider.
- **Not** changing any state actions or selectors. We reuse `setPresentationMode`, `isPresentationModeSelector`, and `ThreeMapControlsService.autoFitTo()` verbatim.
- **Not** removing `Ctrl+Alt+S` / `Ctrl+Alt+F` hotkey support — it moves into the new screenshot button.
- **Not** rebuilding `ScreenshotButtonComponent`'s screenshot pipeline (the `html2canvas-pro` glue + label backdrop fix-up + cropping). That logic is large and well-tested; the new button delegates to a thin service extracted from the existing component.
- **Not** deleting any deprecated file.

## Architecture and Code Reuse

```
app/codeCharta/features/viewCubeToolbox/
  components/
    viewCubeToolbox/
      viewCubeToolbox.component.ts            # root container, OnPush, no state
      viewCubeToolbox.component.html
      viewCubeToolbox.component.spec.ts
    centerMapButton/
      centerMapButton.component.ts            # injects ThreeMapControlsService
      centerMapButton.component.html
      centerMapButton.component.spec.ts
    screenshotButton/
      screenshotButton.component.ts           # delegates to ScreenshotService
      screenshotButton.component.html
      screenshotButton.component.spec.ts
    presentationModeButton/
      presentationModeButton.component.ts     # toSignal(isPresentationModeSelector)
      presentationModeButton.component.html
      presentationModeButton.component.spec.ts
    resetMapButton/
      resetMapButton.component.ts             # injects MatDialog
      resetMapButton.component.html
      resetMapButton.component.spec.ts
  services/
    screenshot.service.ts                     # extracted from ScreenshotButtonComponent
    screenshot.service.spec.ts                # may simply re-cover the existing tests
  facade.ts                                   # re-exports ViewCubeToolboxComponent
```

### Reuse / migration strategy

- **`ThreeMapControlsService`** (`ui/codeMap/threeViewer/threeMapControls.service`) — injected into the new `CenterMapButtonComponent`; calls `.autoFitTo()`.

- **`setPresentationMode`** action and **`isPresentationModeSelector`** — used by the new `PresentationModeButtonComponent` via `toSignal(this.store.select(isPresentationModeSelector), { requireSync: true })` and a click handler that dispatches `setPresentationMode({ value: !current })`.

- **Screenshot logic** — extracted from the deprecated `ScreenshotButtonComponent` into a new `ScreenshotService` under `features/viewCubeToolbox/services/screenshot.service.ts`. The service exposes:
  - `makeScreenshotToFile(): Promise<void>`
  - `makeScreenshotToClipboard(): Promise<void>`
  - `readonly isWriteToClipboardAllowed: boolean`
  Internals of `buildScreenShotCanvas`, `prepareLabelsForScreenshot`, `getCroppedCanvas`, etc., move with it. The deprecated component then becomes a thin wrapper — but we don't touch it (it's already deprecated and not imported anywhere active). The new `ScreenshotButtonComponent` injects the service, reads `globalSettingsFacade.screenshotToClipboardEnabled$()` via `toSignal(...)`, and registers `Ctrl+Alt+S` / `Ctrl+Alt+F` hotkeys in `ngOnInit()` (delegating to the same service).

- **`MatDialog`** (Angular Material's dialog *service*, not a UI widget) — injected into the new `ResetMapButtonComponent` to open the existing `ConfirmResetMapDialogComponent` with the same `panelClass`. This keeps the rule "no Mat* widgets in `features/viewCubeToolbox/**` templates" intact: services are fine.

### Bridging RxJS → signals

- `isPresentationMode = toSignal(this.store.select(isPresentationModeSelector), { requireSync: true })`
- `isScreenshotToClipboardEnabled = toSignal(this.globalSettingsFacade.screenshotToClipboardEnabled$(), { requireSync: true })`

### Hotkey behaviour

- The new `ScreenshotButtonComponent` registers the same two hotkeys in `ngOnInit()` and unregisters them in `ngOnDestroy()` via `hotkeys.unbind(...)`. Same global behaviour as today.

## Files Affected

- `app/codeCharta/features/viewCubeToolbox/**` — new feature (see tree above).
- `app/codeCharta/ui/viewCube/viewCube.component.html` — replace `<cc-center-map-button></cc-center-map-button>` with `<cc-view-cube-toolbox></cc-view-cube-toolbox>`.
- `app/codeCharta/ui/viewCube/viewCube.component.ts` — drop `CenterMapButtonComponent` import + entry from `imports`; add `ViewCubeToolboxComponent` (from `features/viewCubeToolbox/facade`) import + entry.
- `app/codeCharta/ui/viewCube/centerMapButton/centerMapButton.component.ts` — annotate class with `@deprecated Pending relocation plan; superseded by features/viewCubeToolbox.` JSDoc. File stays.

## UI Mockups

### Presentation mode OFF, hover Screenshot

```
┌──────┬──────┬──────┬──────┐
│  ⌘   │ [📷] │  💡  │  ↻   │
└──────┴──────┴──────┴──────┘
```

### Presentation mode ON

```
┌──────┬──────┬──────┬──────┐
│  ⌘   │  📷  │ [💡] │  ↻   │   ← lightbulb has btn-active (filled)
└──────┴──────┴──────┴──────┘
```

## Performance Considerations

- OnPush + signals avoid the cost of zone-driven CD on every async event in the toolbox.
- Hotkey registration is done once per `ScreenshotButtonComponent` instance; re-registering on a re-mount is fine because we unbind in `ngOnDestroy`.
- Extracting `ScreenshotService` does not duplicate any work — it's a pure refactor of existing logic.

## Migration Notes

- No persisted state changes. No keyboard-shortcut changes.
- The deprecated `CenterMapButtonComponent` becomes orphaned; the other three deprecated components are already orphaned by the navbar plan.

---

## Phase 1: Build the toolbox feature and wire it into the view cube

Single phase — the feature is small and self-contained.

### Tasks

- [x] Create directory `app/codeCharta/features/viewCubeToolbox/components/{viewCubeToolbox,centerMapButton,screenshotButton,presentationModeButton,resetMapButton}/` and `app/codeCharta/features/viewCubeToolbox/services/`. Add `facade.ts`.

- [x] **`ScreenshotService`** (`services/screenshot.service.ts`) — `@Injectable({ providedIn: "root" })`. Move the screenshot pipeline out of `ScreenshotButtonComponent`:
  - `private state: State<CcState>`, `private threeRendererService`, `private threeSceneService`, `private threeCameraService` (all injected).
  - `readonly isWriteToClipboardAllowed = checkWriteToClipboardAllowed()`.
  - `async makeScreenshotToFile(): Promise<void>` — same body as `ScreenshotButtonComponent.makeScreenshotToFile()`.
  - `async makeScreenshotToClipboard(): Promise<void>` — same body, including the early return on `!isWriteToClipboardAllowed`.
  - Private helpers `buildScreenShotCanvas`, `saveRenderSettings`, `applyRenderSettings`, `getCroppedCanvas`, `prepareLabelsForScreenshot`, `restoreLabelsAfterScreenshot`, `downloadScreenshot` are moved verbatim.
  - The list of `tagsNamesToIgnore` inside `buildScreenShotCanvas` already excludes `cc-tool-bar` etc.; **add `cc-bottom-bar`** to it (otherwise screenshots of the new bottom bar would leak in). This is the only behavioural addition.

- [x] **`CenterMapButtonComponent`** — `selector: "cc-toolbox-center-map-button"`, OnPush, no template SCSS.
  - `private readonly mapControls = inject(ThreeMapControlsService)`.
  - Template: `<button type="button" class="join-item btn btn-sm btn-square" title="Center map" aria-label="Center map" (click)="mapControls.autoFitTo()"><i class="fa fa-compass"></i></button>`.

- [x] **`ScreenshotButtonComponent`** — `selector: "cc-toolbox-screenshot-button"`, OnPush, implements `OnInit`, `OnDestroy`.
  - Inject `ScreenshotService`, `GlobalSettingsFacade`.
  - `isClipboardMode = toSignal(this.globalSettingsFacade.screenshotToClipboardEnabled$(), { requireSync: true })`.
  - `tooltip = computed(...)` — same two strings as the deprecated component, derived from `isClipboardMode()` and the service's `isWriteToClipboardAllowed`.
  - `handleClick()`: dispatches to the service's `makeScreenshotToClipboard()` if `isClipboardMode()` and `isWriteToClipboardAllowed`; else `makeScreenshotToFile()`.
  - In `ngOnInit`, register `Ctrl+Alt+S` → `makeScreenshotToFile`, `Ctrl+Alt+F` → `makeScreenshotToClipboard`. In `ngOnDestroy`, `hotkeys.unbind(...)` both.
  - Template: `<button type="button" class="join-item btn btn-sm btn-square" [title]="tooltip()" aria-label="Screenshot" (click)="handleClick()"><i class="fa fa-camera"></i></button>`.

- [x] **`PresentationModeButtonComponent`** — `selector: "cc-toolbox-presentation-mode-button"`, OnPush.
  - Inject `Store<CcState>`.
  - `isPresentationMode = toSignal(this.store.select(isPresentationModeSelector), { requireSync: true })`.
  - `tooltip = computed(() => this.isPresentationMode() ? 'Disable flashlight hover effect' : 'Enable flashlight hover effect')`.
  - `handleToggle()`: `this.store.dispatch(setPresentationMode({ value: !this.isPresentationMode() }))`.
  - Template: `<button type="button" class="join-item btn btn-sm btn-square" [class.btn-active]="isPresentationMode()" [title]="tooltip()" aria-label="Presentation mode" (click)="handleToggle()"><i class="fa fa-lightbulb-o"></i></button>`.

- [x] **`ResetMapButtonComponent`** — `selector: "cc-toolbox-reset-map-button"`, OnPush.
  - Inject `MatDialog`.
  - `handleClick()`: `this.dialog.open(ConfirmResetMapDialogComponent, { panelClass: "cc-confirm-reset-map-dialog" })`.
  - Template: `<button type="button" class="join-item btn btn-sm btn-square" title="Reset map to default" aria-label="Reset map" (click)="handleClick()"><i class="fa fa-refresh"></i></button>`.

- [x] **`ViewCubeToolboxComponent`** — `selector: "cc-view-cube-toolbox"`, OnPush, `imports: [CenterMapButtonComponent, ScreenshotButtonComponent, PresentationModeButtonComponent, ResetMapButtonComponent]`.
  - Template:
    ```html
    <div class="join shadow-md absolute top-0 right-4 bg-base-100 rounded">
      <cc-toolbox-center-map-button></cc-toolbox-center-map-button>
      <cc-toolbox-screenshot-button></cc-toolbox-screenshot-button>
      <cc-toolbox-presentation-mode-button></cc-toolbox-presentation-mode-button>
      <cc-toolbox-reset-map-button></cc-toolbox-reset-map-button>
    </div>
    ```
  - No SCSS file. The `absolute top-0 right-4` mirrors where the old circular button used to sit (`top: 0; right: 15px` ≈ `right-4`); the parent `cc-view-cube` is already a positioned container (`position: absolute`).

- [x] **`facade.ts`** — `export { ViewCubeToolboxComponent } from "./components/viewCubeToolbox/viewCubeToolbox.component"`.

- [x] In `ui/viewCube/viewCube.component.html`: replace `<cc-center-map-button></cc-center-map-button>` with `<cc-view-cube-toolbox></cc-view-cube-toolbox>`.

- [x] In `ui/viewCube/viewCube.component.ts`: drop `CenterMapButtonComponent` import + entry from the standalone component's `imports`; add `ViewCubeToolboxComponent` (from `features/viewCubeToolbox/facade`) import + entry.

- [x] In `ui/viewCube/centerMapButton/centerMapButton.component.ts`: annotate class with `@deprecated Pending relocation plan; superseded by features/viewCubeToolbox.` JSDoc.

### Automated Verification

- [x] `centerMapButton.component.spec.ts` — clicking the button calls `ThreeMapControlsService.autoFitTo` once.
- [x] `screenshotButton.component.spec.ts` — when `isClipboardMode()` is `true` and clipboard is allowed, click calls `ScreenshotService.makeScreenshotToClipboard`; otherwise `makeScreenshotToFile`. The component registers and unbinds the two hotkeys.
- [x] `presentationModeButton.component.spec.ts` — initial active class follows `isPresentationModeSelector`; click dispatches `setPresentationMode({ value: !current })`.
- [x] `resetMapButton.component.spec.ts` — click calls `MatDialog.open` with `ConfirmResetMapDialogComponent` and the right `panelClass`.
- [x] `viewCubeToolbox.component.spec.ts` — renders one of each of the four sub-components.
- [x] `screenshot.service.spec.ts` — keep coverage of the existing `ScreenshotButtonComponent` tests (anything that targeted `makeScreenshotToFile` / `makeScreenshotToClipboard` behaviour is moved here verbatim).
- [x] No `Mat*` widget import in any `features/viewCubeToolbox/**/*.component.ts` template (the only Material dependency is `MatDialog` injected as a service in `ResetMapButtonComponent`); no `async` pipe in any new template; no `provideZone*` import. (Grep check during review.)
- [x] `npm run build` succeeds.
- [x] `npm test` passes.
- [x] `npm run format:check` passes.

### Manual Verification

- [ ] Open the app (dev server already running on `localhost:4200`). The four-button toolbox renders above the view cube where the round Center button used to be. The cube and zoom slider are unaffected.
- [ ] Click the compass button — the map auto-fits to view (same as today).
- [ ] Click the camera button — depending on the current "Screenshot to clipboard" setting (Settings dialog), either downloads a `.png` or copies it to the clipboard. Confirm the title attribute reflects the active mode.
- [ ] Press `Ctrl+Alt+S` — saves a screenshot to file regardless of the toggle. Press `Ctrl+Alt+F` — copies to clipboard if supported.
- [ ] Click the lightbulb button — presentation mode toggles on (button gets the `btn-active` style); hover effects on buildings change accordingly. Click again — toggles off.
- [ ] Click the refresh button — the existing confirm-reset dialog opens; confirming resets the map to defaults (same flow as the deprecated reset button used to do).
- [ ] Open the attribute side bar and verify the toolbox slides with the cube (`right: 350px` while the side bar is open).
- [ ] Browser console shows no zone or change-detection warnings introduced by the new components.

---

## Steps

- [-] Complete Phase 1: Build the toolbox feature and wire it into the view cube (awaiting manual verification)

## References

- Old center map button (still active until this PR): `app/codeCharta/ui/viewCube/centerMapButton/centerMapButton.component.ts:13`
- Deprecated screenshot logic to extract: `app/codeCharta/ui/screenshotButton/screenshotButton.component.ts:52-220`
- Presentation mode action / selector: `app/codeCharta/state/store/appSettings/isPresentationMode/{isPresentationMode.actions.ts,isPresentationMode.selector.ts}`
- Reset confirm dialog (kept as-is): `app/codeCharta/ui/resetMapButton/confirmResetMapDialog/confirmResetMapDialog.component.ts`
- `ThreeMapControlsService.autoFitTo`: `app/codeCharta/ui/codeMap/threeViewer/threeMapControls.service.ts`
- DaisyUI `join` reference (used in navbar feature): `app/codeCharta/features/navBar/components/mapSelector/mapSelector.component.html`
