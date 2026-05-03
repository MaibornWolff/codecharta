---
name: restyle-navbar
issue: ""
state: todo
version: 1.142.0
date: 2026-04-29
git_commit: b5fbb5f632b189c08dfe95b531dc5bda37a79837
branch: main
topic: "Restyle Top Navigation Bar"
tags: [plan, visualization, navbar, daisyui, signals, zoneless]
---

# Restyle Top Navigation Bar

## Goal

Replace the existing `cc-tool-bar` with a clean, DaisyUI-styled navigation bar built as a new feature (`features/navBar`). The new bar uses Angular signals end-to-end, is zoneless-compatible (OnPush, no async pipe, no zone-tracked subscriptions), and uses Tailwind/DaisyUI utility classes with as little custom SCSS as possible.

## Overview

The new navbar layout, left-to-right:

1. **CodeCharta logo** (links to GitHub, no version text)
2. **Vertical divider**
3. **Folder icon** (clickable — opens import file dialog, same flow as today)
4. **Map selector** (current multi-select dropdown with Apply, restyled with DaisyUI)
5. *(spacer)*
6. **Explore** (active = today's "Standard" mode)
7. **Compare** (active = today's "Delta" mode)
8. **3D Print** (opens `Export3DMapDialogComponent` exactly as today)
9. **Settings** (opens `GlobalConfigurationDialogComponent` exactly as today)

## Current State Analysis

Current toolbar sits at `app/codeCharta/ui/toolBar/`, uses Material + custom SCSS, and renders nine buttons/widgets. Mode switching (Standard/Delta) lives inside `cc-file-panel` as `FilePanelStateButtonsComponent`. The floating logo (`cc-logo`) is rendered separately in `codeCharta.component.html` at the bottom-left of the viewport. The app currently runs with Zone.js (`provideZoneChangeDetection` in `app/main.ts:7`); signals are used but mixed with RxJS `select(...)` subscriptions and async pipes. DaisyUI 5 + Tailwind 4 are installed (`app/tailwind.css:2`) but no UI uses DaisyUI classes yet.

## Desired End State

- A single feature folder `app/codeCharta/features/navBar/` owns the navbar.
- Top of `codeCharta.component.html` renders `<cc-nav-bar/>` instead of `<cc-tool-bar/>`. The floating `<cc-logo/>` is gone.
- Mode toggle (Explore/Compare), folder import, map selector, 3D Print, and Settings all work end-to-end.
- Components use OnPush, signals, no async pipes — zoneless-ready.
- Minimal custom SCSS: each component has either no `styles*` entry, or only properties that DaisyUI/Tailwind cannot express (e.g. exact border colour for the divider) inline as `class=`.

## What We're NOT Doing

- **Not migrating the app to zoneless.** `provideZoneChangeDetection` stays. Only the new navbar is written zoneless-compatible.
- **Not relocating the dropped widgets.** Screenshot, Copy-link, Reset-map, Loading spinner, Presentation toggle, Hovered-node-path panel are removed from rendering but their component files stay in place, marked `@deprecated`. A separate plan will rehome them.
- **Not changing dialog internals.** `Export3DMapDialogComponent` and `GlobalConfigurationDialogComponent` are reused unchanged.
- **Not changing the underlying file/state actions.** `setStandard`, `removeFiles`, `setDelta`, `setFiles` and `FileSelectionModeService.toggle()` are reused.
- **Not redesigning the file selector's logic** (multi-select + per-file remove + Apply). Only the visual shell changes.

## UI Mockups

### Current (today)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 📂 📷 🔗 🖨 ↺   [Standard|Delta] [▼ map dropdown]      ⠀ ⏳ [Pres⏵] Global Config ⚙ │
└────────────────────────────────────────────────────────────────────────────────┘
                                  …
                                                                         (logo)
                                                              ┌─────────────────┐
                                                              │ ◆ CodeCharta    │
                                                              │ Version 1.142.0 │
                                                              │ Made with ♥ …   │
                                                              └─────────────────┘
```

### New

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◆  │ 📂 │ [▼ monorepo/web-platform ⌄]                Explore  Compare  3D Print  Settings │
└──────────────────────────────────────────────────────────────────────────────┘
```

- `◆` = CodeCharta logo (anchor → GitHub)
- `│` = vertical divider
- `📂` = folder-open icon button (file import)
- `[▼ … ⌄]` = DaisyUI dropdown showing currently-selected map name; opens to multi-select list with per-file remove + Apply button
- Right group: `Explore` is underlined when in Standard mode, `Compare` is underlined when in Delta mode (DaisyUI `tab-active` or equivalent).
- `3D Print` and `Settings` are plain text buttons (no icon, matches screenshot).

## Architecture and Code Reuse

The navbar feature is structured to mirror existing features (`features/3dPrint`, `features/globalSettings`):

```
app/codeCharta/features/navBar/
  components/
    navBar/
      navBar.component.ts                       # root container; OnPush, signals
      navBar.component.html                     # daisyui navbar layout
    navBarLogo/
      navBarLogo.component.ts                   # logo + GitHub link
      navBarLogo.component.html
    navBarFolderButton/
      navBarFolderButton.component.ts           # folder icon → UploadFilesService
      navBarFolderButton.component.html
    mapSelector/
      mapSelector.component.ts                  # restyled multi-select w/ Apply
      mapSelector.component.html
      mapSelector.component.scss                # ONLY if utility classes can't cover
    modeToggle/
      modeToggle.component.ts                   # Explore / Compare
      modeToggle.component.html
    print3DButton/
      print3DButton.component.ts                # opens Export3DMapDialog
      print3DButton.component.html
    settingsButton/
      settingsButton.component.ts               # opens GlobalConfigurationDialog
      settingsButton.component.html
  facade.ts                                     # public exports (component, optional store)
```

Reuse without modification:

- `UploadFilesService` (`ui/toolBar/uploadFilesButton/uploadFiles.service.ts`)
- `FileSelectionModeService.toggle()` (`ui/filePanel/fileSelectionMode.service.ts`)
- `setStandard`, `removeFiles` actions + `filesSelector`
- `Export3DMapDialogComponent`, `GlobalConfigurationDialogComponent`
- `colorModeSelector` + error-dialog flow from `Export3DMapButtonComponent.export3DMap()` — copy this small method into `print3DButton.component.ts` rather than depending on the deprecated component
- `isDeltaStateSelector`

Bridging RxJS → signals: convert each store selector with `toSignal(this.store.select(...), { requireSync: true })` (or `initialValue`). This satisfies zoneless without rewriting NgRx.

Change-detection: every component declares `changeDetection: ChangeDetectionStrategy.OnPush`. No `async` pipe is used in any new template (rule: only signals + signal calls in templates).

## Files Affected

- `app/codeCharta/features/navBar/**` — new feature (see tree above).
- `app/codeCharta/codeCharta.component.html` — replace `<cc-tool-bar/>` with `<cc-nav-bar/>`, remove `<cc-logo/>`.
- `app/codeCharta/codeCharta.component.ts` — drop `ToolBarComponent` and `LogoComponent` imports, add `NavBarComponent` import.
- `app/codeCharta/ui/logo/**` — **delete** (only consumer was `codeCharta.component.html`).
- `app/codeCharta/ui/toolBar/toolBar.component.ts` — annotate class with `@deprecated` JSDoc; file stays.
- `app/codeCharta/ui/toolBar/{screenshotButton,copyToClipboardButton,resetMapButton,presentationModeButton,loadingMapProgressSpinner,hoveredNodePathPanel}/**` — annotate each component class with `@deprecated` JSDoc. Files stay; not imported anywhere after this PR.
- `app/codeCharta/ui/filePanel/filePanel.component.ts` — annotate `@deprecated` (only consumer was `ToolBarComponent`, which is itself deprecated).
- `app/codeCharta/ui/filePanel/filePanelStateButtons/**` — annotate `@deprecated`. The new `modeToggle` replaces its UI; the underlying `FileSelectionModeService` is shared.
- `app/codeCharta/ui/filePanel/filePanelFileSelector/**` — annotate `@deprecated`. The new `mapSelector` reimplements the UI on top of the same NgRx actions/selectors.
- `app/codeCharta/ui/filePanel/filePanelDeltaSelector/**` — annotate `@deprecated`. Renders inside the (now-deprecated) `FilePanelComponent`; not used by the new navbar. Future delta-mode UX is part of the relocation plan.
- `app/codeCharta/e2e/logo.e2e.ts` — **delete**. Tests the floating logo widget that no longer exists.
- `app/codeCharta/ui/toolBar/uploadFilesButton/uploadFilesButton.e2e.ts` — relocate alongside the new `NavBarFolderButtonComponent` and update the page object to target the navbar folder button. The upload-files behaviour itself is unchanged.

## Performance Considerations

- OnPush + signals avoid the cost of zone-driven CD on every async event in the navbar tree.
- `toSignal(..., { requireSync: true })` requires the store to emit synchronously on subscribe — NgRx selectors do, so no functional change.
- Map list rendering uses `@for` with `track file.fileMeta.fileName` to keep diffs minimal when files are added/removed.

## Migration Notes

- No persisted state changes; all NgRx slices are reused as-is.
- No keyboard shortcut changes.
- Visual regression: the bottom-left logo widget disappears. If the version-string is needed elsewhere (it is shown in screenshots / changelog), confirm `package.json#version` is still surfaced via the existing changelog dialog (it is — `features/changelog` reads it directly).

---

## Phase 1: Scaffold feature, deprecate displaced widgets, remove floating logo

Foundational, non-behavioural changes. After this phase the app still uses the old toolbar; the only visible change is that the floating logo is gone.

**Tasks**:

- [x] Create directory `app/codeCharta/features/navBar/components/` with empty subfolders for each component listed in the tree above.
- [x] Add `@deprecated Pending relocation plan; superseded by features/navBar.` JSDoc on:
  - [x] `ToolBarComponent` (`ui/toolBar/toolBar.component.ts`)
  - [x] `ScreenshotButtonComponent`
  - [x] `CopyToClipboardButtonComponent`
  - [x] `ResetMapButtonComponent`
  - [x] `PresentationModeButtonComponent`
  - [x] `LoadingMapProgressSpinnerComponent`
  - [x] `HoveredNodePathPanelComponent`
  - [x] `FilePanelComponent`
  - [x] `FilePanelStateButtonsComponent`
  - [x] `FilePanelFileSelectorComponent`
  - [x] `FilePanelDeltaSelectorComponent`
- [x] Delete `app/codeCharta/ui/logo/` directory entirely (`.ts`, `.html`, `.scss`, and any spec).
- [x] Delete `app/codeCharta/e2e/logo.e2e.ts` (tests the floating logo widget that is being removed).
- [x] Remove `<cc-logo></cc-logo>` from `codeCharta.component.html` and the `LogoComponent` import + `imports` entry from `codeCharta.component.ts`.

**Automated Verification**:

- [x] `npm run build` succeeds (no dangling `LogoComponent` reference).
- [x] `npm test` passes.
- [x] `npm run format:check` passes.

---

## Phase 2: Build the navBar feature

Implement every navbar piece in isolation, each component zoneless-compatible.

**Tasks**:

- [x] **`NavBarComponent`** — root container.
- [x] **`NavBarLogoComponent`** — anchor wrapping the existing logo SVG.
- [x] **Vertical divider** — rendered inline inside `NavBarComponent` template.
- [x] **`NavBarFolderButtonComponent`** — DaisyUI ghost-square button with folder-open icon.
- [x] **`MapSelectorComponent`** — full restyle of file selector with signals + DaisyUI dropdown.
- [x] **`ModeToggleComponent`** — two-tab Explore/Compare toggle.
- [x] **`Print3DButtonComponent`** — text button with 3D-export dialog logic.
- [x] **`SettingsButtonComponent`** — text button opening the global config dialog.
- [x] **Tests**:
  - [x] `navBarFolderButton.component.spec.ts`
  - [x] `modeToggle.component.spec.ts`
  - [x] `mapSelector.component.spec.ts`
  - [x] `print3DButton.component.spec.ts`
  - [x] `settingsButton.component.spec.ts`
  - [x] `navBar.component.spec.ts`

**Automated Verification**:

- [x] All new specs pass: `npm test`.
- [x] No new `provideZone*` import in `features/navBar/**`; no `async` pipe in any new template; no `MatSelect` import in `features/navBar/**`.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

---

## Phase 3: Wire navBar into the app and verify end-to-end

**Tasks**:

- [x] In `codeCharta.component.html`: replace `<cc-tool-bar></cc-tool-bar>` with `<cc-nav-bar></cc-nav-bar>` (keep the surrounding `@if (isInitialized())` and sibling components untouched).
- [x] In `codeCharta.component.ts`: drop `ToolBarComponent` import + entry from `imports`; add `NavBarComponent` import + entry.
- [x] Move `app/codeCharta/ui/toolBar/uploadFilesButton/uploadFilesButton.e2e.ts` to `app/codeCharta/features/navBar/components/navBarFolderButton/navBarFolderButton.e2e.ts` and update the page object selector to target the new folder button. Behaviour assertions stay the same.
- [x] Sanity check: search the codebase for residual `<cc-tool-bar`, `<cc-logo`, and `<cc-file-panel` usages — only inside the deprecated `toolBar`/`filePanel` templates themselves; no live component renders them.

**Automated Verification**:

- [x] `npm run build` succeeds.
- [x] `npm test` passes.
- [ ] `npm run e2e` passes — at least one e2e test path exercises file upload + map switch; if existing e2e selectors target the old toolbar markup, update them.
- [x] `npm run format:check` passes.

**Manual Verification** (`npm run dev`):

- [ ] Navbar renders at the top with logo, divider, folder icon, map selector, and the four right-side actions in the order shown in the mockup.
- [ ] Clicking the logo opens the CodeCharta GitHub repo in a new tab.
- [ ] Clicking the folder icon opens the OS file picker; selecting a `.cc.json` adds the map and it appears in the map selector.
- [ ] Map selector multi-select works: open dropdown, toggle files, click Apply — visualisation updates. Per-file remove icon removes a file from the store.
- [ ] Closing the dropdown without Apply does not change the visualisation.
- [ ] Clicking "Compare" with two maps loaded switches to delta visualisation; "Explore" switches back. The active label is visually distinct.
- [ ] Clicking "3D Print" opens the existing 3D print dialog (same content as current `Export 3D Map Dialog`). The color-mode-error path still triggers when colorMode ≠ absolute.
- [ ] Clicking "Settings" opens the existing Global Configuration dialog (same content as current cogwheel).
- [ ] No floating CodeCharta logo widget at bottom-left of the viewport.
- [ ] Browser console shows no Zone.js or change-detection warnings introduced by the new components.

---

## Steps

- [ ] Complete Phase 1: Scaffold feature, deprecate displaced widgets, remove floating logo
- [ ] Complete Phase 2: Build the navBar feature
- [ ] Complete Phase 3: Wire navBar into the app and verify end-to-end

## References

- Current toolbar: `app/codeCharta/ui/toolBar/toolBar.component.ts:17-39`
- Current upload flow: `app/codeCharta/ui/toolBar/uploadFilesButton/uploadFiles.service.ts:19-27`
- Current map selector: `app/codeCharta/ui/filePanel/filePanelFileSelector/filePanelFileSelector.component.ts:106-112`
- Current mode toggle: `app/codeCharta/ui/filePanel/fileSelectionMode.service.ts:40-53`
- Current 3D print button: `app/codeCharta/features/3dPrint/components/export3DMapButton/export3DMapButton.component.ts:26-35`
- Current settings button: `app/codeCharta/features/globalSettings/components/globalConfigurationButton/globalConfigurationButton.component.ts:13-15`
- DaisyUI + Tailwind config: `app/tailwind.css:1-39`
- Bootstrap (still uses zone): `app/main.ts:7`
- Reference image: `RestyleImages/navbar.png`
