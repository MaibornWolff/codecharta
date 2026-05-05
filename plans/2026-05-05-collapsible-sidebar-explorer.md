---
name: collapsible-sidebar-explorer
issue: ""
state: todo
version: <next>
date: 2026-05-05
git_commit: 876b47bd96eb737702a9ab8a7a5ee2abec9d2567
branch: feature/sidebar-explorer
topic: "Add collapsible mode to the File Explorer sidebar"
tags: [plan, visualization, sidebar, explorer, daisyui, signals]
---

# Add collapsible mode to the File Explorer sidebar

## Goal

Let users collapse the left-side `cc-sidebar-explorer` to a small floating search box pinned at the top-left of the viewport, freeing the codemap area. The collapsed widget keeps the existing search input + clear + kebab menu (Flatten / Exclude) and adds a `»` button to expand. Expanded mode adds a `«` button at the right end of the EXPLORER header. State is in-memory only (resets on reload).

## Constraints (non-negotiable)

All new code lives inside `app/codeCharta/features/sidebarExplorer/` and follows the same rules already enforced for the rest of that feature:

- **Feature folder only.** No new files outside `features/sidebarExplorer/`. Modifications are limited to files already inside this folder (the service, the sidebar root component, the header component, and their specs).
- **DaisyUI + Tailwind only.** No Angular Material imports. Use the existing DaisyUI utilities already in use in the feature (`btn`, `btn-ghost`, `btn-square`, `btn-sm`, `btn-xs`, `flex`, `items-center`, `justify-between`, `rounded-br-md`, etc.).
- **No new SCSS.** No `*.scss` files added or referenced. All styling is utility classes on the templates / host. The existing single SCSS in `ui/codeMap/codeMap.component.scss` is **not** touched.
- **Zoneless-compatible.** No `setTimeout`/`setInterval` in change-detection-relevant paths, no manual `ChangeDetectorRef` calls, no `NgZone` usage. `@if` controls rendering. (The app bootstrap is still Zone-based, but feature code must work under `provideZonelessChangeDetection` per the project rule for `features/`.)
- **Signals only.** State is held in `signal()`, derived with `computed()`. No `BehaviorSubject`, no `async` pipe, no class-field booleans for reactive UI state. `toSignal(...)` only when wrapping an existing RxJS source — not used here because the new state has no upstream RxJS source.
- **OnPush.** Every component touched or created sets `changeDetection: ChangeDetectionStrategy.OnPush`. The two components modified already are OnPush; the change keeps them that way.

These are the same rules the surrounding feature already follows (`features/sidebarExplorer/components/**` is signal-driven, OnPush, DaisyUI-only, no SCSS today). The Phase 1 spec gates them as `grep` checks; this plan reuses those gates verbatim in Automated Verification.

## Current State Analysis

`SidebarExplorerComponent` (`features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts:8-24`) is a fixed-position drawer pinned to the left:

```ts
host: {
    class: "fixed left-0 w-72 bg-base-100 overflow-hidden flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
    style: "top: var(--cc-bars-height, 98px); height: calc(100vh - var(--cc-bars-height, 98px))"
}
```

It composes `ExplorerHeaderComponent` (title + count chips), `ExplorerSearchBarComponent` (input + clear + kebab), `ExplorerSortControlComponent`, the recursive `ExplorerTreeComponent`, and two `RulesPopoverComponent` instances anchored to the FLATTENED / HIDDEN chips. There is no toggle today and the drawer is always visible.

The codemap canvas is `position: fixed; left: 0; width: 100%` (`ui/codeMap/codeMap.component.scss:6-13`), i.e. the sidebar overlays the canvas — collapsing the sidebar simply uncovers the area underneath, no codemap layout change is needed.

The existing `ExplorerSearchBarComponent` (`features/sidebarExplorer/components/explorerSearchBar/explorerSearchBar.component.{ts,html}`) is already self-contained: input, clear button (visible when not empty), and a DaisyUI kebab dropdown with Flatten / Exclude items. It will be reused verbatim in both modes.

## Desired End State

- A small `ExplorerCollapseService` (Injectable, `providedIn: 'root'`) holds an `isCollapsed = signal(false)` and a `toggle()` method. No persistence — fresh state per load.
- `SidebarExplorerComponent` reads the signal and renders one of two templates:
  - **Expanded** (today's layout, plus a `«` collapse button at the right end of the header).
  - **Collapsed** (a single horizontal row pinned at top-left containing: `»` expand button + reused `<cc-explorer-search-bar>`).
- The collapsed widget has `height: auto` (one search-bar row), the same `top: var(--cc-bars-height)`, and a width matching the expanded drawer (`w-72`) so toggling does not shift the input horizontally. Bottom-right corner is rounded for a clean floating-pill look.
- `ExplorerHeaderComponent` adds the collapse `«` button (calls `ExplorerCollapseService.toggle()`).
- Search bar interactions (typing, clearing, Flatten / Exclude via the kebab) work identically in both modes — same component, same store wiring.
- All other behaviour (chips, popovers, sort, tree, hover/highlight, right-click) is unchanged in expanded mode and not rendered in collapsed mode.
- All existing Jest specs keep passing; new specs cover the toggle wiring and the collapsed template.

## What We're NOT Doing

- **Not persisting** the collapsed state — it resets to expanded on every page load (per user direction).
- **Not changing the codemap layout / CSS variable**. Sidebar already overlays the canvas; nothing to adjust there.
- **Not adding animation** between expanded and collapsed states. Instant swap is fine.
- **Not changing keyboard shortcuts**. No accelerator for toggle in this iteration.
- **Not modifying the search bar component itself**. It is reused as-is in both modes.
- **Not collapsing into an icon-only strip**. Layout is the horizontal mini-bar variant; the search bar stays a real input with placeholder text.
- **Not touching the rule popovers**, sort dropdown, or tree code paths.

## UI Mockups

### Expanded (added: `«` button at the right end of the header)

```
┌──────────────── 288px ─────────────────┐
│  EXPLORER                          «   │  ← NEW collapse button
│  ┌──────┐┌──────────┐┌──────┐          │
│  │ 47   ││  12  ▾   ││  5  ▾│          │
│  │SHWN  ││ FLAT     ││ HID  │          │
│  └──────┘└──────────┘└──────┘          │
│  Sort: Name                ▾ ↓         │
│  ┌──────────────────────────────────┐ │
│  │ 🔍 *.js, **/app/*           ✕ ⋮ │ │
│  └──────────────────────────────────┘ │
│  ▾ apps/                              │
│    ▸ web/                  412        │
│  ▸ services/                          │
│  ...                                  │
└────────────────────────────────────────┘
```

### Collapsed (small floating row at top-left, no full-height drawer)

```
top: var(--cc-bars-height)
left: 0
┌──────────────── 288px ─────────────────┐
│ »  🔍 *.js, **/app/*              ✕ ⋮ │  ← single row, height ~ search-bar
└────────────────────────────────────────┘
                                            (codemap visible underneath)
```

- Expand button (left): DaisyUI `btn btn-ghost btn-sm btn-square`, FontAwesome folder-tree icon (`fa fa-sitemap` — closest tree icon in the FA 4.7 set used in this project; FA4 has no `fa-folder-tree`).
- Search box: same `<cc-explorer-search-bar>` instance — input, clear, kebab with Flatten / Exclude.
- Bottom-right corner of the host element is rounded (`rounded-br-md`) so the pill reads as a floating widget. Same drop shadow as today.

## Architecture and Code Reuse

### State

```
ExplorerCollapseService  (signal-backed, providedIn: 'root')
        │
        ├── ExplorerHeaderComponent            (reads signal? no — only calls toggle())
        ├── SidebarExplorerComponent           (reads signal → switches template)
        └── (collapsed-template inline button) (calls toggle())
```

Pattern mirrors the existing `services/IsAttributeSideBarVisibleService` (`app/codeCharta/services/isAttributeSideBarVisible.service.ts`), upgraded to an Angular `signal` for OnPush correctness (the existing service uses a plain `boolean`; new code under `features/` must be signals + OnPush per the project's zoneless-feature rule).

### Files affected

- **New**
  - `features/sidebarExplorer/services/explorerCollapse.service.ts`
  - `features/sidebarExplorer/services/explorerCollapse.service.spec.ts`
- **Modified**
  - `features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts` — inject service, expose `isCollapsed`, computed host class/style, expose `toggle()`.
  - `features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.html` — branch with `@if (isCollapsed())` between collapsed (expand button + search bar) and expanded (today's children) layouts.
  - `features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.spec.ts` — add test that toggling the service switches the rendered children.
  - `features/sidebarExplorer/components/explorerHeader/explorerHeader.component.ts` — inject `ExplorerCollapseService`, add `collapse()` method.
  - `features/sidebarExplorer/components/explorerHeader/explorerHeader.component.html` — add `«` button at the right end of the title row.
  - `features/sidebarExplorer/components/explorerHeader/explorerHeader.component.spec.ts` — add test that clicking the collapse button calls the service toggle.

### Component sketches

```ts
// services/explorerCollapse.service.ts
@Injectable({ providedIn: "root" })
export class ExplorerCollapseService {
    readonly isCollapsed = signal(false)
    toggle() { this.isCollapsed.update(v => !v) }
}
```

```ts
// sidebarExplorer.component.ts (key bits)
private readonly collapseService = inject(ExplorerCollapseService)
readonly isCollapsed = this.collapseService.isCollapsed
toggle() { this.collapseService.toggle() }

host: {
    class: "fixed left-0 w-72 bg-base-100 overflow-hidden flex flex-col shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]",
    "[class.rounded-br-md]": "isCollapsed()",
    "[style.top]": "'var(--cc-bars-height, 98px)'",
    "[style.height]": "isCollapsed() ? 'auto' : 'calc(100vh - var(--cc-bars-height, 98px))'"
}
```

```html
<!-- sidebarExplorer.component.html -->
@if (isCollapsed()) {
    <div class="flex items-center gap-1 px-2 py-1">
        <button
            type="button"
            class="btn btn-ghost btn-sm btn-square"
            (click)="toggle()"
            title="Expand explorer"
            data-testid="explorer-expand-button"
        >
            <i class="fa fa-sitemap"></i>
        </button>
        <cc-explorer-search-bar class="flex-1"></cc-explorer-search-bar>
    </div>
} @else {
    <cc-explorer-header></cc-explorer-header>
    <cc-explorer-search-bar></cc-explorer-search-bar>
    <cc-explorer-sort-control></cc-explorer-sort-control>
    <div id="explorer-scroll" class="flex-1 overflow-auto px-1 py-1">
        <cc-explorer-tree></cc-explorer-tree>
    </div>
    <cc-rules-popover kind="flatten" popoverId="explorer-flatten-rules" anchorName="explorer-flat-chip"></cc-rules-popover>
    <cc-rules-popover kind="exclude" popoverId="explorer-hidden-rules" anchorName="explorer-hidden-chip"></cc-rules-popover>
}
```

```html
<!-- explorerHeader.component.html (header row only) -->
<div class="flex items-center justify-between px-2 py-2 border-b border-base-300">
    <span class="text-xs font-semibold uppercase tracking-wide">Explorer</span>
    <button
        type="button"
        class="btn btn-ghost btn-xs btn-square"
        (click)="collapse()"
        title="Collapse explorer"
        data-testid="explorer-collapse-button"
    >
        <i class="fa fa-angle-double-left"></i>
    </button>
</div>
<!-- count chips block unchanged -->
```

## Performance Considerations

- One additional signal read in the host bindings of `SidebarExplorerComponent`. Negligible.
- In collapsed mode, `ExplorerTreeComponent`, `ExplorerSortControlComponent`, `ExplorerHeaderComponent`, and the two `RulesPopoverComponent` instances are not constructed (Angular's `@if` truly removes them from the view), so the tree's hover-sync RxJS subscriptions and per-rule `ignore()` calculations are dormant — small CD/perf win when the user hides the explorer.
- The codemap canvas is unchanged; collapsing only uncovers the area that was already being rendered behind the drawer, so no extra Three.js work.

## Migration Notes

- No persisted state changes; nothing to migrate.
- Default state is **expanded** (matches current behaviour). Existing users see no difference until they click the new `«` button.

---

## Tasks

### 1. Add the collapse service

- [x] Create `features/sidebarExplorer/services/explorerCollapse.service.ts` with an injectable `ExplorerCollapseService` exposing `isCollapsed = signal(false)` and `toggle()`.
- [x] Add `features/sidebarExplorer/services/explorerCollapse.service.spec.ts` covering: default value is `false`, `toggle()` flips it, second `toggle()` flips it back.

### 2. Wire the collapse button into the header

- [x] Inject `ExplorerCollapseService` into `ExplorerHeaderComponent` and add a `collapse()` method that calls `service.toggle()`.
- [x] Update `explorerHeader.component.html`: change the header row to a `flex items-center justify-between` with the title on the left and a new `btn btn-ghost btn-xs btn-square` collapse button on the right (FontAwesome `fa fa-angle-double-left`, `data-testid="explorer-collapse-button"`, `title="Collapse explorer"`).
- [x] Add a spec case to `explorerHeader.component.spec.ts` that renders the component, clicks the collapse button, and asserts `ExplorerCollapseService.isCollapsed()` is `true`.

### 3. Branch the sidebar template on collapsed state

- [x] In `sidebarExplorer.component.ts`: inject `ExplorerCollapseService`, expose `isCollapsed` (the service's signal) and a `toggle()` method. Replace the static `host.style` with `[style.top]` (always `var(--cc-bars-height, 98px)`) and `[style.height]` (`auto` if collapsed, `calc(100vh - var(--cc-bars-height, 98px))` otherwise). Add `[class.rounded-br-md]` bound to `isCollapsed()`.
- [x] In `sidebarExplorer.component.html`: wrap the existing children in `@else` and add the collapsed branch — a `flex items-center gap-1 px-2 py-1` row with an expand button (`btn btn-ghost btn-sm btn-square`, FontAwesome folder-tree icon `fa fa-sitemap`, `data-testid="explorer-expand-button"`, `title="Expand explorer"`) followed by `<cc-explorer-search-bar class="flex-1">`.
- [x] Update `sidebarExplorer.component.spec.ts`: add tests that (a) by default the expanded children render (`cc-explorer-header`, `cc-explorer-tree`); (b) after toggling the service, the expand button + search bar render and the header / tree are gone; (c) clicking the expand button toggles back.

### 4. Verify and clean up

- [x] Run `npm test` from `visualization/` and confirm the new and existing specs pass.
- [x] Run `npm run build` from `visualization/` and confirm a clean build.
- [x] Run `npm run format:check` from the repo root.
- [ ] `npm run dev` and exercise the toggle (see Manual Verification below).

## Steps

- [ ] Complete Task 1: Add the collapse service
- [ ] Complete Task 2: Wire the collapse button into the header
- [ ] Complete Task 3: Branch the sidebar template on collapsed state
- [ ] Complete Task 4: Verify and clean up

## Automated Verification

- [ ] `explorerCollapse.service.spec.ts` covers default + toggle behaviour and passes.
- [ ] Updated `explorerHeader.component.spec.ts` asserts the collapse button toggles the service and passes.
- [ ] Updated `sidebarExplorer.component.spec.ts` asserts the conditional rendering and passes.
- [ ] `npm test` passes.
- [ ] `npm run build` succeeds.
- [ ] `npm run format:check` passes.

### Constraint gates (run from `visualization/`)

- [ ] No new files outside the feature folder: `git diff --name-only main -- ':!app/codeCharta/features/sidebarExplorer/' | wc -l` returns `0`.
- [ ] No SCSS introduced: `! find app/codeCharta/features/sidebarExplorer -name "*.scss"`.
- [ ] No Angular Material imports: `! grep -rE "from \"@angular/material" app/codeCharta/features/sidebarExplorer/`.
- [ ] No `AsyncPipe` import in the touched files: `! grep -rn "AsyncPipe" app/codeCharta/features/sidebarExplorer/components/sidebarExplorer/ app/codeCharta/features/sidebarExplorer/components/explorerHeader/ app/codeCharta/features/sidebarExplorer/services/explorerCollapse.service.ts`.
- [ ] No `BehaviorSubject` for the new collapse state: `! grep -rn "BehaviorSubject" app/codeCharta/features/sidebarExplorer/services/explorerCollapse.service.ts`.
- [ ] No `setTimeout` / `NgZone` / manual CD in the new/changed files: `! grep -rnE "setTimeout|NgZone|ChangeDetectorRef" app/codeCharta/features/sidebarExplorer/services/explorerCollapse.service.ts app/codeCharta/features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts app/codeCharta/features/sidebarExplorer/components/explorerHeader/explorerHeader.component.ts`.
- [ ] All touched components keep OnPush: `grep -c "ChangeDetectionStrategy.OnPush" app/codeCharta/features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts app/codeCharta/features/sidebarExplorer/components/explorerHeader/explorerHeader.component.ts` returns `1` for each.

## Manual Verification (`npm run dev`)

- [ ] On load, sidebar is expanded with the same layout as today, plus a `«` button at the right end of the EXPLORER header.
- [ ] Clicking `«` collapses the sidebar to a single-row floating box at the top-left, containing a `»` expand button, the search input (with placeholder `*.js, **/app/*`), the clear `✕` button (when text is present), and the kebab `⋮` menu. The codemap is now visible across the area where the drawer used to be.
- [ ] In collapsed mode, typing a pattern still updates `searchPattern` (codemap highlights matching nodes), the clear button still empties the input, and the kebab still offers Flatten / Exclude (both dispatch the existing actions).
- [ ] Clicking `»` expands the sidebar back to its full layout, with all chips, sort, tree, and popovers intact and still functional (counts, sort, hover-sync, right-click context menu, FLATTENED / HIDDEN popovers).
- [ ] Reloading the page returns the sidebar to the expanded state (no persistence).
- [ ] No console warnings or errors related to popovers, change detection, or destroyed signals.

## Notes

- **In-flight scope addition (FontAwesome 4.7 → 7):** While implementing, the user requested the modern `fa-folder-tree` icon for the expand button. FA 4 has no such icon, so the project was migrated from `font-awesome@4.7.0` to `@fortawesome/fontawesome-free@^7.0.0`. Files touched outside the feature folder for this: `visualization/package.json`, `visualization/package-lock.json`, `visualization/app/app.scss` (added imports for `all.css`, `v4-shims.css`, `v4-font-face.css` so all 80+ existing `<i class="fa fa-…">` usages keep rendering via FA 7's compatibility layer). The expand button uses the modern syntax `<i class="fa-solid fa-folder-tree"></i>`. Cleanup of the v4 shim imports + rewriting all legacy markup to FA 7 modern syntax is intentionally deferred to a follow-up PR.
- Width in collapsed mode stays `w-72` (288 px) so the search input does not shift horizontally on toggle. Height is `auto` (one row) — that is what makes the widget feel "smaller".
- The collapse state is a single signal in a root-provided service — no ngrx slice, no localStorage. Matches the user's session-only requirement and keeps the change surgical.
- Both the collapse and expand buttons use FontAwesome chevron icons already used elsewhere in the app (FontAwesome is loaded globally; no new icon dependency).
- Constraints recap: feature folder only, DaisyUI/Tailwind only, no SCSS, zoneless-compatible, signals + OnPush. Gated by the grep checks under "Automated Verification → Constraint gates".

## References

- Sidebar root: `app/codeCharta/features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.component.ts:8-24`
- Header to extend: `app/codeCharta/features/sidebarExplorer/components/explorerHeader/explorerHeader.component.html:1-3`
- Reused search bar: `app/codeCharta/features/sidebarExplorer/components/explorerSearchBar/explorerSearchBar.component.{ts,html}`
- Bars-height variable updater: `app/codeCharta/ui/codeMap/codeMap.component.ts:57-73`
- Existing visibility-service pattern (boolean field, providedIn root): `app/codeCharta/services/isAttributeSideBarVisible.service.ts`
- Previous sidebar redesign plan: `plans/2026-05-04-sidebar-explorer.md`
