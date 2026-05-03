---
name: bottom-bar
issue: ""
state: todo
version: 1.142.0
date: 2026-04-30
git_commit: b5fbb5f632b189c08dfe95b531dc5bda37a79837
branch: main
topic: "Add Bottom Bar (hovered path + attribution)"
tags: [plan, visualization, bottombar, daisyui, signals, zoneless]
---

# Add Bottom Bar (hovered path + attribution)

## Goal

Add a fixed bottom bar to the visualization app showing the hovered-node path on the left and a `Made with ❤ by MaibornWolff v{version}` attribution on the right (separated by a vertical divider). The hovered-path display is migrated into the new `features/` architecture (OnPush, signals, no async pipe, no zone-tracked subscriptions, DaisyUI/Tailwind only). After this plan the 3D map area shrinks to leave room for the bar so nothing is hidden behind it.

## Overview

Layout, left-to-right:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 root › src › features › navBar › navBar.component.ts │ Made with ❤ by MaibornWolff v1.142.0 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

- Left: breadcrumb-style hovered path (icon + segments separated by `›`, last segment bold).
- Vertical divider.
- Right: `Made with ❤ by [MaibornWolff link] v{packageJson.version}`.
- When no node is hovered, the left side is empty; the right side never moves.

## Current State Analysis

- `HoveredNodePathPanelComponent` (`ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanel.component.ts:14-31`) renders the breadcrumb today via the `hoveredNodePathPanelDataSelector` and an `async` pipe. The component is annotated `@deprecated` and not rendered anywhere after the navbar refactor.
- The data shape from `hoveredNodePathPanelDataSelector` (`ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanelData.selector.ts:5-11`) is `{ path: string[], isFile: boolean } | undefined`.
- The version is exposed via `VersionStore.currentVersion` (`features/changelog/stores/version.store.ts:8`); `packageJson.version` can be imported directly the same way.
- `CodeMapComponent.observeBarsHeight()` (`ui/codeMap/codeMap.component.ts:54-72`) currently feeds a `--cc-bars-height` CSS variable consumed by `#codeMap { top: var(--cc-bars-height) }`. The map div is `position: fixed; top: var(--cc-bars-height); height: 100%`, so it overflows the viewport bottom by the top-bars height. The Three.js renderer (`threeViewer.service.ts:21,27,51-53`) sizes the canvas with `window.innerWidth × window.innerHeight`, so the rendered scene also overflows.
- The old floating logo (now deleted) used `Made with &#10084; by [MaibornWolff link]` (`U+2764`, heavy black heart) and linked to `https://www.maibornwolff.de/en/`.

## Desired End State

- A new feature folder `app/codeCharta/features/bottomBar/` owns the bar.
- `<cc-bottom-bar/>` is rendered at the end of `codeCharta.component.html`, pinned to the viewport bottom.
- Components are zoneless-compatible: `ChangeDetectionStrategy.OnPush`, signals only, `toSignal(...)` for store reads, no `async` pipe, no `MatXxx`.
- Custom SCSS is minimised — DaisyUI/Tailwind utility classes only, except where utility classes can't express the rule.
- The 3D map area (`#codeMap` + the Three.js canvas) shrinks to fit between the top bars and the bottom bar; nothing is hidden.

## What We're NOT Doing

- Not deleting `HoveredNodePathPanelComponent`. The old component file stays (it's already `@deprecated`), only the new one is rendered.
- Not changing `hoveredNodePathPanelDataSelector` or any state action — it's reused as-is.
- Not changing the Three.js scene/material/animation logic — only the canvas sizing source.
- Not introducing a new global state slice for the bottom bar.
- Not relocating the version-display or attribution to anywhere else (e.g. settings dialog).

## Architecture and Code Reuse

```
app/codeCharta/features/bottomBar/
  components/
    bottomBar/
      bottomBar.component.ts          # root container; OnPush, signals
      bottomBar.component.html
      bottomBar.component.spec.ts
    hoveredPath/
      hoveredPath.component.ts        # migrated from ui/toolBar/hoveredNodePathPanel
      hoveredPath.component.html
      hoveredPath.component.spec.ts
    attribution/
      attribution.component.ts        # static "Made with ❤ … v{version}" + link
      attribution.component.html
      attribution.component.spec.ts
  facade.ts                           # re-exports BottomBarComponent
```

Reuse without modification:
- `hoveredNodePathPanelDataSelector` from `ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanelData.selector.ts`.
- `packageJson.version` (read at module load, same pattern as `VersionStore`).

Bridging RxJS → signals: `pathData = toSignal(this.store.select(hoveredNodePathPanelDataSelector))` (no `requireSync` — the selector legitimately emits `undefined` until a node is hovered).

Existing `HoveredNodePathPanelComponent`, `.component.html`, `.component.scss`, and `.component.spec.ts` stay where they are with their `@deprecated` JSDoc. It is still imported by the deprecated `ToolBarComponent` (which is itself unrendered after the navbar refactor), so nothing live renders the old hovered-path panel — but the import chain is left intact and will be cleared up by the same future plan that rehomes the other deprecated toolbar widgets.

## Files Affected

- `app/codeCharta/features/bottomBar/**` — new feature.
- `app/codeCharta/codeCharta.component.html` — append `<cc-bottom-bar></cc-bottom-bar>` at the end of the `@if (isInitialized())` block.
- `app/codeCharta/codeCharta.component.ts` — add `BottomBarComponent` to `imports`.
- `app/codeCharta/ui/codeMap/codeMap.component.ts` — extend `observeBarsHeight()` to also observe `cc-bottom-bar` and set a `--cc-bottom-bar-height` CSS variable on `#codeMap`.
- `app/codeCharta/ui/codeMap/codeMap.component.scss` — replace `height: 100%` with `bottom: var(--cc-bottom-bar-height, 0px)` so the map div is bounded between the top bars and the bottom bar.
- `app/codeCharta/ui/codeMap/threeViewer/threeViewer.service.ts` — size camera/renderer/labelRenderer from the `#codeMap` container's `clientWidth/clientHeight`; observe the container with a `ResizeObserver` (replacing the `window.resize` listener for sizing concerns; keep `focusin/focusout`).
- `app/codeCharta/ui/codeMap/threeViewer/threeRenderer.service.ts` — `initComposer()` uses the passed-in `containerWidth/containerHeight` instead of `window.innerWidth/innerHeight`.

## UI Mockups

### Empty (no node hovered)

```
│                                                    │ Made with ❤ by MaibornWolff v1.142.0 │
```

### With hover

```
│ 📁 root › src › services › loadFile.service.ts     │ Made with ❤ by MaibornWolff v1.142.0 │
```

## Migration Notes

- No persisted state changes. No keyboard-shortcut changes.
- The `--cc-bottom-bar-height` CSS variable is set per-instance on `#codeMap` (matches the existing `--cc-bars-height` pattern), so no global theme changes are needed.

---

## Phase 1: Build the bottom bar feature

Add the new feature, render it under the map. After this phase the bar is visible and functional, but its bottom edge overlaps the bottom strip of the rendered Three.js scene (same kind of overlap that already exists today between the top bars and the scene).

### Tasks

- [x] Create directory `app/codeCharta/features/bottomBar/components/{bottomBar,hoveredPath,attribution}/` and `facade.ts`.

- [x] **`HoveredPathComponent`** — `selector: "cc-hovered-path"`, `OnPush`.
  - `pathData = toSignal(this.store.select(hoveredNodePathPanelDataSelector))` (no `requireSync` — emits `undefined` initially).
  - `breadcrumbs = computed(() => pathData()?.path.map((segment, i, arr) => ({ key: \`${i}-${segment}\`, segment, isLast: i === arr.length - 1 })) ?? [])`.
  - `isFile = computed(() => pathData()?.isFile ?? false)`.
  - Template renders `@if (breadcrumbs().length > 0)` block with `@for` over `breadcrumbs()`, last segment bold (`font-semibold`), separators rendered as `<i class="fa fa-angle-right text-base-content/40 mx-1">`. Leading icon is `fa-file-o` (file) or `fa-folder` (folder), shown only on the last segment. Tailwind `text-xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center` classes. No SCSS file.

- [x] **`AttributionComponent`** — `selector: "cc-attribution"`, `OnPush`.
  - `version = packageJson.version` (constant).
  - Template renders `Made with <span class="text-error">❤</span> by <a href="https://www.maibornwolff.de/en/" target="_blank" rel="noopener noreferrer" class="link link-hover">MaibornWolff</a> v{{ version }}`.
  - Tailwind `text-xs flex items-center gap-1`. No SCSS file.

- [x] **`BottomBarComponent`** — `selector: "cc-bottom-bar"`, `OnPush`, `imports: [HoveredPathComponent, AttributionComponent]`.
  - Template:
    ```html
    <footer class="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 bg-base-100 border-t border-base-300 px-3 py-1 min-h-7">
      <cc-hovered-path class="flex-1 min-w-0"></cc-hovered-path>
      <div class="divider divider-horizontal mx-0"></div>
      <cc-attribution class="shrink-0"></cc-attribution>
    </footer>
    ```
  - No SCSS file.

- [x] **`facade.ts`** — `export { BottomBarComponent } from "./components/bottomBar/bottomBar.component"`.

- [x] In `codeCharta.component.html`: append `<cc-bottom-bar></cc-bottom-bar>` inside the `@if (isInitialized())` block (after `<cc-changelog-dialog>`).

- [x] In `codeCharta.component.ts`: add `BottomBarComponent` (from `./features/bottomBar/facade`) to the standalone component's `imports`.

### Automated Verification

- [x] `hoveredPath.component.spec.ts` — given a hovered-node path of three segments, renders three segments with separators, last segment has `font-semibold`, leading icon class is `fa-file-o` when `isFile`. Renders nothing when the selector returns `undefined`.
- [x] `attribution.component.spec.ts` — renders the heart character, the MaibornWolff link with the correct `href`, and the version string with the `v` prefix.
- [x] `bottomBar.component.spec.ts` — renders one `<cc-hovered-path>` and one `<cc-attribution>`.
- [x] No `provideZone*` import in `features/bottomBar/**`; no `async` pipe in any new template; no `Mat*` import in `features/bottomBar/**` (grep check is fine to perform manually during review).
- [x] `npm run build` succeeds.
- [x] `npm test` passes.
- [x] `npm run format:check` passes.

### Manual Verification

- [ ] Open `npm run dev`. The bottom bar appears at the bottom of the viewport with the attribution visible on the right.
- [ ] Hovering a building / folder shows the path on the left; moving the mouse off resets it to empty.
- [ ] Clicking "MaibornWolff" opens https://www.maibornwolff.de/en/ in a new tab.
- [ ] No browser console errors introduced by the new components.

---

## Phase 2: Shrink the 3D map area to fit between the bars

Make the 3D area exactly fill the space between the top bars and the bottom bar so nothing is hidden behind either. Touches the Three.js renderer's sizing source.

### Tasks

- [ ] In `ui/codeMap/codeMap.component.ts`, extend `observeBarsHeight()` to also observe `cc-bottom-bar` and write its measured height into `--cc-bottom-bar-height` on `#codeMap`. Keep `--cc-bars-height` behaviour for the top bars unchanged.

- [ ] In `ui/codeMap/codeMap.component.scss`, replace `height: 100%` with `bottom: var(--cc-bottom-bar-height, 0px)` (the `top` rule already uses `--cc-bars-height`).

- [ ] In `ui/codeMap/threeViewer/threeViewer.service.ts`:
  - Replace `window.innerWidth/innerHeight` in `init()` and the resize handler with `target.clientWidth/clientHeight`.
  - Rename `onWindowResize` → `onContainerResize`; drive it from a `ResizeObserver` watching `target` (created in `init()`, disconnected in `destroy()`).
  - Keep the existing `focusin`/`focusout` window listeners; they're unrelated to sizing.

- [ ] In `ui/codeMap/threeViewer/threeRenderer.service.ts`:
  - `initComposer()` accepts the same `containerWidth/containerHeight` already passed into `init()` and uses them to set `composer.setSize` and the FXAA `resolution` uniforms.

### Automated Verification

- [ ] Existing `threeViewer`/`threeRenderer` specs (if any) still pass; otherwise add a unit test that calls `init()` with a stub element whose `clientWidth/clientHeight` differ from `window.innerWidth/innerHeight` and asserts that `renderer.setSize` is called with the stub element's dimensions.
- [ ] `npm run build` succeeds.
- [ ] `npm test` passes.
- [ ] `npm run format:check` passes.

### Manual Verification

- [ ] Open `npm run dev`. The 3D scene fills the area between the top bars and the bottom bar exactly; no clipping at the bottom.
- [ ] Resize the browser window — the canvas resizes correctly and the scene stays centred (no off-centre cropping).
- [ ] Toggle Compare/Explore — the scene re-renders without sizing artefacts.
- [ ] In dev tools, set `--cc-bottom-bar-height: 100px` on `#codeMap`; confirm the canvas shrinks accordingly. Reset to remove.

---

## Steps

- [ ] Complete Phase 1: Build the bottom bar feature
- [ ] Complete Phase 2: Shrink the 3D map area to fit between the bars

## References

- Hovered-path data source: `app/codeCharta/ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanelData.selector.ts:5`
- Old hovered-path component (now deprecated): `app/codeCharta/ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanel.component.html:1-13`
- Version source: `app/codeCharta/features/changelog/stores/version.store.ts:8`
- Top-bar height observer (pattern to extend): `app/codeCharta/ui/codeMap/codeMap.component.ts:54-72`
- Three.js renderer init: `app/codeCharta/ui/codeMap/threeViewer/threeViewer.service.ts:20-40`
- Old floating logo (for the attribution copy): removed in restyle-navbar plan; original text was `Made with ❤ by MaibornWolff` linking `MaibornWolff` to `https://www.maibornwolff.de/en/`.
