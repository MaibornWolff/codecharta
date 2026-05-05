---
name: sidebar-explorer
issue: ""
state: complete
version: <next>
date: 2026-05-04
git_commit: 724a7a0cea3c7ac5b3f345114ff668933c1ce77d
branch: main
topic: "Redesign File Explorer as a left-side drawer"
tags: [plan, visualization, sidebar, explorer, daisyui, signals, zoneless]
---

# Redesign File Explorer as a left-side drawer

## Goal

Replace the current "File/Node Explorer" dropdown (`ui/ribbonBar/searchPanel/`) with a permanent, push-layout drawer pinned to the left side of the viewport, owned by a new `features/sidebarExplorer/` feature. The drawer matches `RestyleImages/Sidebar.png` and `RestyleImages/Flatten:hidden.png`: fixed-width, with `SHOWN`/`FLATTENED`/`HIDDEN` chips, a sort dropdown, a compact search bar, and the existing sortable file/folder tree. Clicking the `FLATTENED` or `HIDDEN` chip opens a popover listing the rules that contributed to that count, each removable via an `X`. New code is signals-only, OnPush, AsyncPipe-free, DaisyUI + Tailwind, no SCSS.

## Overview

End state, left-to-right:

```
┌─Nav-Bar─────────────────────────────────────────┐
├─Ribbon-Bar──────────────────────────────────────┤
│             │                                   │
│  EXPLORER   │                                   │
│  47 12 5    │                                   │
│  Sort ↓     │           3D codemap              │
│  🔍 search  │                                   │
│  ▾ apps/    │                                   │
│    ▸ src/   │                                   │
│  ▸ services/│                                   │
│  ▸ packages/│                                   │
└─────────────┴───────────────────────────────────┘
   ~280 px                  flex 1
```

- `EXPLORER` header + `SHOWN N | FLATTENED N | HIDDEN N` chips + sort dropdown + search input.
- Tree below scrolls independently; drawer stretches floor-to-ceiling underneath nav/ribbon.
- Clicking the `FLATTENED` chip opens a popover anchored to it titled `FLATTENING RULES` with one row per blacklist item of type `flatten`.
- Clicking the `HIDDEN` chip opens an analogous `HIDDEN RULES` popover for `exclude` items.
- Each row: badge (`RULE` for patterns, `MANUAL` for concrete paths), pattern/path text, file-count badge, `X` to remove.
- `SHOWN` chip is non-interactive (static counter).
- Search input above the tree wires to the existing `searchPattern` state. The current 3-dot "add to flatten/exclude blacklist" menu inside the search bar is preserved.

## Current State Analysis

The current "File/Node Explorer" lives at `app/codeCharta/ui/ribbonBar/searchPanel/`, mounted as the very first panel inside the top ribbon bar (`ui/ribbonBar/ribbonBar.component.html:1`). It is a collapsible dropdown with three modes (`treeView | blacklist | minimized`), a thumbtack pin, a sortable map tree (`mapTreeView/mapTreeViewLevel`), a `MatchingFilesCounter` showing `searchedLeaves/totalLeaves` ratios for files/flatten/exclude, and a `BlacklistPanel` listing flattened and excluded items as a separate mode. All components inject `Store<CcState>` directly, use `AsyncPipe`, Angular Material (`MatList`, `MatMenu`, `MatButtonToggle`, `MatSelect`), and per-component SCSS files.

State slices already exist and stay (consumed elsewhere too):
- `state/store/dynamicSettings/searchPattern/`
- `state/store/dynamicSettings/sortingOption/`
- `state/store/appSettings/sortingOrderAscending/`
- `state/store/fileSettings/blacklist/`
- `state/store/appSettings/isSearchPanelPinned/` — only consumed by the search panel; becomes obsolete once the drawer is always visible.

Existing primitives we reuse without modification:
- `mapTreeViewNodeSelector` (sorted tree) → `ui/ribbonBar/searchPanel/mapTreeView/mapTreeViewNodeSelector/mapTreeViewNode.selector.ts`
- `searchedNodesSelector` → `state/selectors/searchedNodes/searchedNodes.selector.ts`
- `matchingFilesCounter.selector.ts` (calculation logic) → `ui/ribbonBar/searchPanel/matchingFilesCounter/selectors/`
- `createBlacklistItemSelector(type)` → `ui/ribbonBar/searchPanel/blacklistPanel/`
- `blacklistSearchPattern` effect (3-dot menu) → `state/effects/blacklistSearchPattern/`
- `parseBlacklistItems`, `unifyWildCard` utils → `ui/ribbonBar/searchPanel/searchBar/utils/`
- `isPathBlacklisted`, `isLeaf` helpers → `util/codeMapHelper.ts`
- `NodeContextMenu` (right-click) — used by tree level today; reused as-is.

The app currently bootstraps with `provideZoneChangeDetection()` (`app/main.ts:7`). DaisyUI 5 + Tailwind 4 are installed and used by `features/navBar`, `features/labelSettings`, etc. The recent `features/navBar` and `features/labelSettings` migrations (`d143dee5a`) are the canonical pattern: facade.ts, components/, services/, stores/ wrapping ngrx, signals via `toSignal(...)`, OnPush, no SCSS.

The codemap viewport is positioned `position: fixed; left: 0; width: 100%` (`ui/codeMap/codeMap.component.scss:6`). Nav and ribbon bars sit above with `--cc-bars-height` (98 px).

## Desired End State

- New feature folder `app/codeCharta/features/sidebarExplorer/` owns every drawer component, store wrapper, selector, and service.
- `codeCharta.component.html` renders `<cc-sidebar-explorer>` as a left sibling of `<cc-code-map>`. The codemap viewport's left offset is driven by a CSS variable so it shrinks to `(100vw - drawer width)`.
- `<cc-search-panel>` is removed from `ui/ribbonBar/ribbonBar.component.html` and the entire `ui/ribbonBar/searchPanel/` directory is deleted.
- `state/store/appSettings/isSearchPanelPinned/` is deleted; no consumer remains.
- All new components are `ChangeDetectionStrategy.OnPush`, use signals only (`toSignal`/`computed`), no `async` pipe, no Angular Material imports, no SCSS files. Tailwind/DaisyUI utility classes only.
- Right-click on a tree row still opens the existing `NodeContextMenu`. Highlighting / hover sync with the 3D scene is preserved.
- Pattern search and the "add pattern → flatten / exclude" 3-dot menu still work, dispatching the same `setSearchPattern` and `blacklistSearchPattern` actions.
- Counts update reactively when files are loaded, search patterns change, or blacklist items are added/removed.
- All Jest specs and the affected Playwright e2e tests pass.

## What We're NOT Doing

- **Not flipping the app to zoneless.** `provideZoneChangeDetection()` stays in `app/main.ts`. New components are written zoneless-compatible; a future plan can switch the bootstrap.
- **Not adding a drawer toggle, resize handle, or persisted width.** Drawer is fixed-width, always visible.
- **Not redesigning the right-click context menu.** `NodeContextMenu` keeps its current look and behaviour.
- **Not changing the `BlacklistItem` data shape or any reducer.** Existing `state/store/fileSettings/blacklist/` actions and selectors are reused verbatim.
- **Not changing the sort options.** Same `SortingOption` enum (Name / Number of Files / Area Size) and same ascending/descending toggle. The mockup label `Complexity ↓` is illustrative.
- **Not introducing a new metric-based sort** (e.g. by height/color metric).
- **Not migrating `BlacklistSearchPatternEffect` or moving its file** — it still lives at `state/effects/blacklistSearchPattern/`. The feature only consumes it.
- **Not changing how nodes are highlighted / focused / excluded in the 3D scene.** `IdToBuildingService`, `ThreeSceneService`, `CodeMapMouseEventService` are reused as-is.

## UI Mockups

### Drawer (default state)

```
┌──────────────────────────────┐
│  EXPLORER         🔍   ☰     │  ← header row
│ ┌────┐┌────────┐┌────┐       │
│ │ 47 ││  12  ▾ ││ 5 ▾│       │  ← chips (FLATTENED / HIDDEN open popovers)
│ │SHWN││ FLAT   ││HID │       │
│ └────┘└────────┘└────┘       │
│ Sort: Complexity     ▾ ↓     │  ← sort dropdown + asc/desc toggle
│ ┌──────────────────────────┐ │
│ │ 🔍 *.js, **/app/*    ✕  │ │  ← search input (existing pattern semantics)
│ └──────────────────────────┘ │
│ ▾ apps/                      │
│   ▸ web/             412     │
│   ▸ docs/             28     │
│ ▾ services/                  │
│   ▾ billing/                 │
│       invoice.ts       •     │  ← right-click → NodeContextMenu
│       subscription.ts        │
│       tax.ts                 │
│   ▸ webhooks/         12     │
│ ▸ notifications/      23     │
│ ▸ packages/          180     │
│ ▸ infra/              34     │
└──────────────────────────────┘
```

### FLATTENED chip popover (analogous popover for HIDDEN chip)

```
┌─ FLATTENING RULES ───── ✕ ┐
│ [RULE]   **/__tests__/**     6  ✕ │
│ [RULE]   **/*.spec.ts        4  ✕ │
│ [MANUAL] apps/web/src/legacy 2  ✕ │
└──────────────────────────────────┘
```

- `RULE` badge → blacklist entry path contains a wildcard (`*`).
- `MANUAL` badge → blacklist entry path is a concrete node path (added via right-click context menu).
- File-count = number of leaves matched by that single rule.
- `✕` next to a row dispatches `removeBlacklistItem({ item })`.
- Top-right `✕` closes the popover.

## Architecture and Code Reuse

### Folder structure (new)

```
app/codeCharta/features/sidebarExplorer/
  facade.ts
  components/
    sidebarExplorer/
      sidebarExplorer.component.{ts,html,spec.ts}        # drawer root
    explorerHeader/
      explorerHeader.component.{ts,html,spec.ts}         # title + chips + sort
    explorerCountChip/
      explorerCountChip.component.{ts,html,spec.ts}      # one chip; emits click
    explorerSortControl/
      explorerSortControl.component.{ts,html,spec.ts}    # daisyUI dropdown + asc/desc
    explorerSearchBar/
      explorerSearchBar.component.{ts,html,spec.ts}      # input + 3-dot menu
    explorerTree/
      explorerTree.component.{ts,html,spec.ts}           # root level entry point
    explorerTreeLevel/
      explorerTreeLevel.component.{ts,html,spec.ts}      # recursive; replaces mapTreeViewLevel
    explorerTreeItemIcon/
      explorerTreeItemIcon.component.{ts,html}           # daisyUI icon (no scss)
    explorerTreeItemName/
      explorerTreeItemName.component.{ts,html,spec.ts}   # name + unary % cell
    explorerTreeItemActions/
      explorerTreeItemActions.component.{ts,html}        # hover-only flatten/menu buttons
    rulesPopover/
      rulesPopover.component.{ts,html,spec.ts}           # generic popover for one type
    ruleRow/
      ruleRow.component.{ts,html,spec.ts}                # RULE/MANUAL badge + ✕
  services/
    explorerCounts.service.ts                             # exposes shown/flat/hidden as signals
    explorerSearch.service.ts                             # wraps searchPattern store + 3-dot menu
    explorerSort.service.ts                               # wraps sortingOption + asc/desc
    explorerRules.service.ts                              # rules-with-affected-count + remove
  stores/
    searchPattern.store.ts
    sortingOption.store.ts
    sortingOrderAscending.store.ts
    blacklist.store.ts
  selectors/
    sidebarExplorer.selectors.ts                          # explorerCountsSelector, ruleWithAffectedCountSelectorFactory
    isPattern.ts                                          # path → "RULE" | "MANUAL"
  pipes/
    isNodeLeaf.pipe.ts                                    # moved from old searchPanel (unchanged behaviour)
    areaMetricValid.pipe.ts                               # moved from old searchPanel (unchanged behaviour)
```

### State / data flow

```
ngrx Store ── selectors ── stores/* ── services/* ── components (signals)
                      │
                      └── new selectors:
                          • explorerCountsSelector       → { shown:number, flattened:number, hidden:number }
                          • flattenRulesWithCountSelector → Array<{ item, affectedCount, kind:'RULE'|'MANUAL' }>
                          • excludeRulesWithCountSelector → Array<{ item, affectedCount, kind:'RULE'|'MANUAL' }>
```

`explorerCountsSelector` reuses the math from `_calculateMatchingFilesCounter` (`ui/ribbonBar/searchPanel/matchingFilesCounter/selectors/matchingFilesCounter.selector.ts`) but returns plain integers (no `"x/y"` strings). Inputs: `searchedNodesSelector`, `blacklistSelector`, `codeMapNodesSelector`. New definition:

```ts
shown    = countLeaves(searchedNodes) - flattened - hidden   // mockup style
flattened = countLeavesMatchingType('flatten', searchedNodes, blacklist)
hidden    = countLeavesMatchingType('exclude', searchedNodes, blacklist)
```

`flattenRulesWithCountSelector` / `excludeRulesWithCountSelector` map every blacklist item of the given type to `{ item, affectedCount, kind }`, where `affectedCount` is the number of leaf nodes matched by *that single rule* (not the cumulative blacklist). Implementation reuses `ignore()` per-rule (same library and pattern as `isPathBlacklisted` in `util/codeMapHelper.ts`).

`kind` is decided by `isPattern(path)` (`/[*?!]/.test(path)` → `'RULE'`, else `'MANUAL'`).

### Stores

Thin wrappers around existing ngrx slices, mirroring `features/labelSettings/stores/labelSize.store.ts`:

```ts
// stores/sortingOption.store.ts
@Injectable({ providedIn: "root" })
export class SortingOptionStore {
    constructor(private readonly store: Store<CcState>) {}
    sortingOption$ = this.store.select(sortingOrderSelector)
    setSortingOption(value: SortingOption) { this.store.dispatch(setSortingOption({ value })) }
}
```

`blacklist.store.ts` exposes `flattenRules$`, `excludeRules$`, `removeBlacklistItem(item)`, and dispatches the existing `blacklistSearchPattern(type)` thunk for the 3-dot menu.

### Components

Every component:
- `changeDetection: ChangeDetectionStrategy.OnPush`
- Reads state with `toSignal(this.someService.someValue$, { requireSync: true })`
- Templates use signals (`value()`) and the `@if`/`@for` control-flow syntax
- No `async` pipe, no `MatX` imports, no `*.scss`
- Tailwind + DaisyUI utility classes (e.g. `drawer`, `menu`, `badge`, `dropdown`, `popover`)

`SidebarExplorerComponent` is a single root container styled `flex flex-col w-72 shrink-0 border-r border-base-300 bg-base-100 h-[calc(100vh-var(--cc-bars-height))]`. It composes `ExplorerHeader`, `ExplorerSearchBar`, and `ExplorerTree`.

`ExplorerCountChipComponent` renders one chip; for `FLATTENED`/`HIDDEN` it uses the native `popover` API + `position-anchor` (same approach as `features/labelSettings/components/labelSettingsButton/labelSettingsButton.component.html`) to open `RulesPopoverComponent`.

`ExplorerTreeLevelComponent` is the new recursive tree row. Behavioural parity with `MapTreeViewLevelComponent`:
- Hover dispatches `setHoveredNodeId` and calls `CodeMapMouseEventService.hoverNode`.
- Click toggles open + selects the matching three.js building.
- Right-click dispatches `setRightClickedNodeData` to open `NodeContextMenu`.
- Search-result class still applied for nodes in `searchedNodesSelector`.
- Initial state: root folder open (`depth === 0`).

The recursive child tracking key changes from `track childNode.name` to `track childNode.path` (more correct for siblings sharing a name across folders).

### Layout integration

`codeCharta.component.html` becomes:

```html
<cc-error-dialog/>
@if (isInitialized()) {
    <cc-nav-bar/>
    <cc-ribbon-bar/>
    <cc-file-extension-bar/>

    <div class="flex h-[calc(100vh-var(--cc-bars-height))]">
        <cc-sidebar-explorer/>
        <cc-code-map class="flex-1"/>
    </div>

    <cc-legend-panel/>
    <cc-loading-file-progress-spinner/>
    <cc-changelog-dialog/>
    <cc-bottom-bar/>
}
```

`ui/codeMap/codeMap.component.scss` changes `#codeMap { left: 0; width: 100%; }` to `left: var(--cc-explorer-width, 0); width: calc(100% - var(--cc-explorer-width, 0));`. `SidebarExplorerComponent` sets `--cc-explorer-width: 18rem` via host binding.

### Files affected

- **New** — `app/codeCharta/features/sidebarExplorer/**` (full tree above).
- **Modified**
  - `app/codeCharta/codeCharta.component.html` — wrap codemap + drawer in flex row, mount `<cc-sidebar-explorer>`.
  - `app/codeCharta/codeCharta.component.ts` — add `SidebarExplorerComponent` to `imports`.
  - `app/codeCharta/ui/ribbonBar/ribbonBar.component.html` — remove `<cc-search-panel></cc-search-panel>` (line 1).
  - `app/codeCharta/ui/ribbonBar/ribbonBar.component.ts` — drop `SearchPanelComponent` from imports.
  - `app/codeCharta/ui/codeMap/codeMap.component.scss` — adjust `#codeMap { left, width }` per the layout integration section.
- **Deleted**
  - `app/codeCharta/ui/ribbonBar/searchPanel/**` (entire directory: searchPanel, searchBar, searchPanelModeSelector, mapTreeView, mapTreeViewLevel, mapTreeViewItemIcon, mapTreeViewItemName, mapTreeViewItemOptionButtons, mapTreeViewNodeSelector, blacklistPanel, matchingFilesCounter, sortingButton, sortingOption, thumbTackButton).
  - `app/codeCharta/state/store/appSettings/isSearchPanelPinned/**` (only consumer was the deleted search panel).
- **Relocated** — `mapTreeViewNodeSelector/{mapTreeViewNode.selector.ts,sortNodesInPlace.ts,sortNode.spec.ts}` → `features/sidebarExplorer/selectors/` (renamed `explorerTreeNode.selector.ts`, identical behaviour).
- **Relocated** — `parseBlacklistItems`, `unifyWildCard`, `isPatternBlacklisted` utilities and their specs from `ui/ribbonBar/searchPanel/searchBar/utils/` → `features/sidebarExplorer/services/utils/`. `BlacklistSearchPatternEffect` is updated to import from the new path (the effect itself stays where it is).
- **Relocated** — `mapTreeView/mapTreeViewItemIcon/{mapTreeViewItemIconClass.pipe.ts,mapTreeViewItemIconColor.pipe.ts}` (+ specs) → `features/sidebarExplorer/pipes/`.
- **Migrated** — `searchPanel.po.ts` (top-level toggle) and `mapTreeView.level.po.ts` are replaced with new POs `features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.po.ts` and `explorerTreeLevel.po.ts`. Existing e2e test `mapTreeView.level.e2e.ts` is renamed to `explorerTreeLevel.e2e.ts`, moved into the new feature folder, and updated to import the new POs and drop the `await searchPanel.toggle()` step (drawer is always open).
- **Migrated** — `app/codeCharta/ui/nodeContextMenu/nodeContextMenu.e2e.ts` imports `SearchPanelPageObject` and `MapTreeViewLevelPageObject` (lines 4 and 6) and calls `searchPanel.toggle()` in every test. Phase 4 swaps these imports to the new POs (drop the `searchPanel` instance entirely; replace `MapTreeViewLevelPageObject` with `ExplorerTreeLevelPageObject`).
- **Per-rule affected-count helper** — `affectedCount` per rule is computed by calling the existing `isPathBlacklisted(path, [singleItem], type)` from `util/codeMapHelper.ts` against every leaf path. No new matching logic is introduced — the existing helper already accepts a `BlacklistItem[]` and we pass a single-element array to scope it to one rule.

## Performance Considerations

- OnPush + signals + `track` by path keeps the tree CD-cheap.
- `flattenRulesWithCountSelector` builds one `ignore()` instance per rule per change. Total work = O(rules × leaves). With ≤ ~20 rules per project this is negligible compared to today's full-blacklist `ignore()` build, which already runs on every render. Memoisation by reselect (`createSelector`) ensures this only recomputes when blacklist or codemap nodes change — not on hover or sort.
- The drawer adds one always-mounted component subtree. Tree virtualisation is **not** introduced; the existing recursive renderer matches today's perf characteristics.
- Layout reflow: codemap viewport now uses `calc()` for `left` and `width`. Initial paint cost is identical; resize jank only on file load (drawer is fixed-width).

## Migration Notes

- No persisted state shape changes.
- Removing `isSearchPanelPinned` from `state/store/appSettings`: the slice key is dropped from `appSettings.reducer.ts` and the type `AppSettings.isSearchPanelPinned` is removed. Any persisted IndexedDB blob for an existing user that still contains this key is harmless (extra property is ignored on load — verify in `state.manager.ts`).
- The 3-dot menu on the search input keeps the same actions; existing keyboard / mouse muscle-memory is preserved.
- Visual regression: ribbon bar now starts with the Scenarios card (the search panel chip used to be its first child).

---

## Phase 1: Scaffold feature, add data layer

Foundational, non-behavioural. After this phase the old search panel still renders; the new feature exists but is not yet mounted. Pure additions plus relocated utilities.

**Tasks**:

- [x] Create directory tree under `app/codeCharta/features/sidebarExplorer/` with empty subfolders for `components/`, `services/`, `stores/`, `selectors/`, `pipes/`, `services/utils/`.
- [x] Add `facade.ts` exporting (will be filled as components land): `export { SidebarExplorerComponent } from "./components/sidebarExplorer/sidebarExplorer.component"`.
- [x] Implement stores wrapping existing ngrx slices, mirroring `features/labelSettings/stores/labelSize.store.ts` pattern:
  - [x] `stores/searchPattern.store.ts` — `searchPattern$`, `setSearchPattern(value)`, `resetSearchPattern()`, `blacklistSearchPattern(type)` (dispatches the existing `blacklistSearchPattern` thunk).
  - [x] `stores/sortingOption.store.ts` — `sortingOption$`, `setSortingOption(value)`.
  - [x] `stores/sortingOrderAscending.store.ts` — `sortingOrderAscending$`, `toggle()`.
  - [x] `stores/blacklist.store.ts` — `flattenItems$`, `excludeItems$`, `removeBlacklistItem(item)`.
- [x] Implement services that expose signals to components:
  - [x] `services/explorerSearch.service.ts` — wraps `searchPattern.store`; adds `isSearchPatternEmpty$`, `isFlattenPatternDisabled$`, `isExcludePatternDisabled$` (move existing selectors from `ui/ribbonBar/searchPanel/searchBar/selectors/` to `features/sidebarExplorer/selectors/searchBar/`).
  - [x] `services/explorerSort.service.ts` — wraps sort stores; exposes a single `sortState$ = combineLatest([sortingOption$, sortingOrderAscending$])` for the dropdown.
  - [x] `services/explorerRules.service.ts` — exposes `flattenRulesWithCount$`, `excludeRulesWithCount$`, `removeRule(item)`.
  - [x] `services/explorerCounts.service.ts` — exposes `counts$ = { shown, flattened, hidden }`.
- [x] Implement selectors:
  - [x] `selectors/sidebarExplorer.selectors.ts` — `explorerCountsSelector` (mockup-style integers), `flattenRulesWithCountSelector`, `excludeRulesWithCountSelector`. Reuse `searchedNodesSelector`, `codeMapNodesSelector`, `blacklistSelector`, `isLeaf`, and a per-rule `ignore()` helper.
  - [x] `selectors/isPattern.ts` — `export const isPatternRule = (path: string) => /[*?!]/.test(path)` (used to derive the `RULE`/`MANUAL` badge).
- [x] Relocate (without behavioural changes):
  - [x] `ui/ribbonBar/searchPanel/mapTreeView/mapTreeViewNodeSelector/{mapTreeViewNode.selector.ts,sortNodesInPlace.ts,sortNode.spec.ts}` → `features/sidebarExplorer/selectors/explorerTreeNode.selector.ts` + `sortNodesInPlace.ts` + `sortNode.spec.ts`.
  - [x] `ui/ribbonBar/searchPanel/mapTreeView/{areaMetricValidPipe.pipe.ts,isNodeLeaf.pipe.ts}` (+ specs) → `features/sidebarExplorer/pipes/`.
  - [x] `ui/ribbonBar/searchPanel/mapTreeView/mapTreeViewItemIcon/{mapTreeViewItemIconClass.pipe.ts,mapTreeViewItemIconColor.pipe.ts}` (+ specs) → `features/sidebarExplorer/pipes/`.
  - [x] `ui/ribbonBar/searchPanel/searchBar/utils/{parseBlacklistItems.ts,unifyWildCard.ts,isPatternBlacklisted.ts}` (+ specs) → `features/sidebarExplorer/services/utils/`.
  - [x] Update `state/effects/blacklistSearchPattern/blacklistSearchPattern.effect.ts` import for `parseBlacklistItems` to the new path.
  - [x] Update old searchPanel components (`mapTreeViewLevel.component.ts`, `mapTreeViewItemIcon.component.ts`, `mapTreeView.component.ts`, `searchBar.component.ts`) imports to the new pipe/util/selector paths so the app keeps building during the transition (these files are deleted in Phase 4).

**Automated Verification**:
- [x] `selectors/sidebarExplorer.selectors.spec.ts` — covers shown/flattened/hidden counts with a representative tree (no blacklist, only flatten, only exclude, mixed, empty file set, search pattern restricting visible set).
- [x] `selectors/isPattern.spec.ts` — distinguishes `**/*.spec.ts` (RULE) from `apps/web/src/legacy` (MANUAL).
- [x] `services/explorerRules.service.spec.ts` — `affectedCount` equals leaves matched by exactly one rule (uses dataMocks-style fixtures).
- [x] Each new store has a spec that asserts dispatch calls and selector wiring (mirror `features/labelSettings/stores/labelSize.store.spec.ts`).
- [x] `npm test` passes.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

---

## Phase 2: Build drawer UI (header, search bar, tree)

Implements every visible drawer piece except the chip popovers. Components are zoneless-compatible. Drawer is not yet mounted in `codeCharta.component.html`.

**Tasks**:

- [x] **`SidebarExplorerComponent`** — drawer root. Tailwind: `flex flex-col w-72 shrink-0 border-r border-base-300 bg-base-100`. Sets host CSS var `--cc-explorer-width: 18rem`.
- [x] **`ExplorerHeaderComponent`** — header row with title + 3 chips + sort row. Composes `ExplorerCountChipComponent` (×3) + `ExplorerSortControlComponent`.
- [x] **`ExplorerCountChipComponent`** — input: `{ label, count, popoverId? }`. If `popoverId` is set, the chip is a button with `popovertarget=popoverId`; otherwise a static badge. DaisyUI `badge` + `btn-ghost`.
- [x] **`ExplorerSortControlComponent`** — DaisyUI `dropdown` listing `Object.values(SortingOption)` and an asc/desc toggle button. Reuses `SortingOption` enum from `codeCharta.model.ts`.
- [x] **`ExplorerSearchBarComponent`** — input + `✕` clear button + 3-dot DaisyUI menu (Flatten / Exclude). Debounced `setSearchPattern` dispatch (400 ms) — reuse `util/debounce.ts`. Disabled rules computed via existing `isFlattenPatternDisabled$` / `isExcludePatternDisabled$` (relocated in Phase 1).
- [x] **`ExplorerTreeComponent`** — reads `mapTreeViewNodeSelector` (now `explorerTreeNodeSelector`) and renders a single `ExplorerTreeLevelComponent` at depth 0.
- [x] **`ExplorerTreeLevelComponent`** — recursive level. Matches `MapTreeViewLevelComponent` behaviour exactly: hover enter/leave, click toggle, right-click → `setRightClickedNodeData`, scroll-to-close listener, selected-building sync via `ThreeSceneService`/`IdToBuildingService`/`ThreeRendererService`/`CodeMapMouseEventService`. Open root by default. Tracks children by `path`. Composes `ExplorerTreeItemIconComponent`, `ExplorerTreeItemNameComponent`, `ExplorerTreeItemActionsComponent`.
- [x] **`ExplorerTreeItemIconComponent`** — folder/file icon (open/closed) with metric-derived colour. Reuses `mapTreeViewItemIconClass.pipe.ts` and `mapTreeViewItemIconColor.pipe.ts` from their new home in `features/sidebarExplorer/pipes/` (relocated in Phase 1).
- [x] **`ExplorerTreeItemNameComponent`** — name + percentage / file count. Same logic as `mapTreeViewItemName.component.html`.
- [x] **`ExplorerTreeItemActionsComponent`** — hover-only buttons: flatten toggle and ⋯ menu opener (right-click equivalent for accessibility). Same surface as `mapTreeViewItemOptionButtons`.
- [x] **Specs** for each leaf component (mirror existing `mapTreeViewItemName.component.spec.ts`-style with `@testing-library/angular`):
  - [x] `explorerHeader.component.spec.ts`
  - [x] `explorerCountChip.component.spec.ts`
  - [x] `explorerSortControl.component.spec.ts`
  - [x] `explorerSearchBar.component.spec.ts`
  - [x] `explorerTree.component.spec.ts`
  - [x] `explorerTreeLevel.component.spec.ts` (covers hover, right-click, open/close, search-result class)
  - [x] `explorerTreeItemName.component.spec.ts`
  - [x] `sidebarExplorer.component.spec.ts` (composition smoke test)

**Automated Verification**:
- [x] Each new spec passes: `npm test`.
- [x] No `*.scss` file under `features/sidebarExplorer/`.
- [x] No `Mat*` imports under `features/sidebarExplorer/`: `! grep -rE "from \"@angular/material" app/codeCharta/features/sidebarExplorer/`.
- [x] No `AsyncPipe` import under `features/sidebarExplorer/`.
- [x] No `provideZone*` calls anywhere under `features/sidebarExplorer/`.
- [x] Every component class has `changeDetection: ChangeDetectionStrategy.OnPush`.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

---

## Phase 3: Build rule popovers (FLATTENED / HIDDEN chips)

Adds the two popovers and wires them to the chip clicks.

**Tasks**:

- [x] **`RulesPopoverComponent`** — generic component with input `kind: 'flatten' | 'exclude'` and a popover host (DaisyUI `popover` + native `popover` API anchored to the chip via CSS `position-anchor`). Title is `'FLATTENING RULES'` for `flatten` and `'HIDDEN RULES'` for `exclude`. Displays a list of `RuleRowComponent`. Top-right `✕` closes the popover (`popover().hidePopover()`).
- [x] **`RuleRowComponent`** — input `{ item: BlacklistItem, affectedCount: number, kind: 'RULE' | 'MANUAL' }`. Renders DaisyUI `badge` for kind, the path/pattern text, the count, and a remove `✕` button. `(click)` on the remove button calls `ExplorerRulesService.removeRule(item)` (which dispatches `removeBlacklistItem`).
- [x] Wire `ExplorerCountChipComponent` for `FLATTENED` / `HIDDEN` chips to use `popovertarget="explorer-flatten-rules"` / `"explorer-hidden-rules"` respectively. Mount `<cc-rules-popover kind="flatten" id="explorer-flatten-rules">` and `<cc-rules-popover kind="exclude" id="explorer-hidden-rules">` inside `SidebarExplorerComponent`.
- [x] Anchor the popover to its chip with `style="anchor-name: --explorer-flat-chip"` on the chip and `style="position-anchor: --explorer-flat-chip"` on the popover (same approach as `labelSettingsButton.component.html`). Same for the hidden chip with its own anchor name.
- [x] **Specs**:
  - [x] `rulesPopover.component.spec.ts` — renders `RuleRow` per item from the matching selector; closes via `✕`.
  - [x] `ruleRow.component.spec.ts` — clicking `✕` dispatches `removeBlacklistItem` with the exact item; badge text is `RULE` for `**/*.ts` and `MANUAL` for `apps/foo`.

**Automated Verification**:
- [x] All new specs pass: `npm test`.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

---

## Phase 4: Wire layout, remove old code, migrate e2e

Mounts the drawer in the app layout, removes the old search panel, deletes obsolete state, and updates affected end-to-end tests.

**Tasks**:

- [x] In `codeCharta.component.html`: wrap `<cc-code-map>` together with `<cc-sidebar-explorer>` in a flex row inside the existing `@if (isInitialized())` block (see "Layout integration" section). Order: nav-bar → ribbon-bar → file-extension-bar → row{ sidebar-explorer, code-map } → legend → spinner → changelog → bottom-bar.
- [x] In `codeCharta.component.ts`: add `SidebarExplorerComponent` to `imports`.
- [x] In `ui/codeMap/codeMap.component.scss`: change `#codeMap { left: 0; width: 100%; }` to `#codeMap { left: var(--cc-explorer-width, 0); width: calc(100% - var(--cc-explorer-width, 0)); }`. The `--cc-explorer-width` var is set on the drawer's host element.
- [x] In `ui/ribbonBar/ribbonBar.component.html`: delete line 1 `<cc-search-panel></cc-search-panel>`.
- [x] In `ui/ribbonBar/ribbonBar.component.ts`: drop the `SearchPanelComponent` import + entry from the `imports` array.
- [x] **Delete** `app/codeCharta/ui/ribbonBar/searchPanel/` directory (every file: searchPanel, searchBar, searchPanelModeSelector, mapTreeView, mapTreeViewLevel, mapTreeViewItemIcon, mapTreeViewItemName, mapTreeViewItemOptionButtons, mapTreeViewNodeSelector, blacklistPanel, matchingFilesCounter, sortingButton, sortingOption, thumbTackButton).
- [x] **Delete** `app/codeCharta/state/store/appSettings/isSearchPanelPinned/` (actions, reducer, selector, spec).
  - [x] `state/store/appSettings/appSettings.reducer.ts:39` — drop the `isSearchPanelPinned` reducer/default import.
  - [x] `state/store/appSettings/appSettings.reducer.ts:52` — drop `isSearchPanelPinned` from the `combineReducers` map.
  - [x] `state/store/appSettings/appSettings.reducer.ts:87` — drop `isSearchPanelPinned: defaultIsSearchPanelPinned` from the default-state object.
  - [x] `state/store/appSettings/appSettings.actions.ts:20` — drop the `setIsSearchPanelPinned, toggleIsSearchPanelPinned` import.
  - [x] `state/store/state.manager.ts` — verify `defaultState` and `appReducers` still type-check; no manual edits expected since they re-export from `appSettings.reducer.ts`.
  - [x] Remove the `isSearchPanelPinned: boolean` field from the `AppSettings` interface in `codeCharta.model.ts:164`.
  - [x] `services/loadInitialFile/loadInitialFile.service.ts:384` — delete the `case "isSearchPanelPinned":` branch in the per-key dispatch switch; update the corresponding test name in `loadInitialFile.service.spec.ts:378`.
  - [x] Remove `isSearchPanelPinned` from `util/dataMocks.ts` (lines ~2211 and ~2272) so test fixtures match the new shape.
- [x] Add new page objects:
  - [x] `features/sidebarExplorer/components/sidebarExplorer/sidebarExplorer.po.ts` — drawer root locator (always present, no toggle method).
  - [x] `features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po.ts` — port of `mapTreeView.level.po.ts` with selectors updated to the new `cc-explorer-tree-level` markup. Methods kept: `openContextMenu`, `openFolder`, `hoverNode`, `nodeExists`, `isNodeMarked`, `hasMarkedClass`, `hoverNodeWithoutScrolling`, `getNumberOfFiles`.
- [x] Rename `mapTreeView.level.e2e.ts` → `explorerTreeLevel.e2e.ts`, move into `features/sidebarExplorer/components/explorerTreeLevel/`, drop every `await searchPanel.toggle()` call, and import the new page objects. Test bodies otherwise unchanged.
- [x] Update `app/codeCharta/ui/nodeContextMenu/nodeContextMenu.e2e.ts`:
  - Replace `import { MapTreeViewLevelPageObject } from "../ribbonBar/searchPanel/mapTreeView/mapTreeView.level.po"` (line 4) with `import { ExplorerTreeLevelPageObject } from "../../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"`.
  - Delete `import { SearchPanelPageObject } from "../ribbonBar/searchPanel/searchPanel.po"` (line 6).
  - In every test (lines 19, 31, 46, 61): delete `const searchPanel = new SearchPanelPageObject(page)` and the subsequent `await searchPanel.toggle()` call. Replace `MapTreeViewLevelPageObject` instantiations with `ExplorerTreeLevelPageObject`.
- [x] Search the codebase for any residual references: `grep -rn "searchPanel\|cc-search-panel\|MapTreeView" app/` should yield only the new feature folder and rendered class names.

**Automated Verification**:
- [x] `npm run build` succeeds.
- [x] `npm test` passes.
- [ ] `npm run e2e:ci` passes — the migrated `explorerTreeLevel.e2e.ts` and the unchanged `nodeContextMenu.e2e.ts` both pass.
- [x] `npm run format:check` passes.
- [x] `! grep -rn "isSearchPanelPinned" app/` (zero hits).
- [x] `! grep -rn "ribbonBar/searchPanel" app/` (zero hits).

**Manual Verification** (`npm run dev`):
- [ ] Drawer is visible on the left at all times, ~288 px wide. The codemap fills the remaining width without overlap.
- [ ] `EXPLORER` header shows `SHOWN`, `FLATTENED`, `HIDDEN` chips with integer counts that match the loaded `.cc.json` (verify against a known sample, e.g. `sample1.cc.json` with no blacklist → flattened/hidden = 0, shown = total leaf count).
- [ ] Typing a search pattern (e.g. `**/*.ts`) updates `SHOWN` and highlights matching tree rows.
- [ ] The 3-dot menu in the search bar adds the current pattern to flatten or exclude; counts update; the chip popover (next bullet) lists the new rule.
- [ ] Clicking the `FLATTENED` chip opens a popover titled "FLATTENING RULES". Each row shows `RULE` (for patterns with `*`) or `MANUAL` (for concrete paths), the path text, the affected leaf count, and an `✕`. Clicking `✕` removes the rule and the count decreases; the codemap re-renders.
- [ ] Clicking the `HIDDEN` chip opens a popover titled "HIDDEN RULES" with the same interactions for `exclude` items.
- [ ] Sort dropdown lists "Name", "Number of Files", "Area Size". Selecting a sort option re-orders the tree. The asc/desc toggle flips the order.
- [ ] Clicking a tree row toggles its open state; the matching 3D building is selected (ring highlight). Hovering syncs scene hover highlight with tree row hover. Right-click opens the existing `NodeContextMenu`.
- [ ] Adding/removing files via the navbar updates the tree, counts, and chip popover content.
- [ ] No console warnings or errors related to popovers, change detection, or destroyed signals.
- [ ] Resizing the browser window keeps the drawer at fixed width and the codemap fluid.

---

## Steps

- [x] Complete Phase 1: Scaffold feature, add data layer
- [x] Complete Phase 2: Build drawer UI (header, search bar, tree)
- [x] Complete Phase 3: Build rule popovers (FLATTENED / HIDDEN chips)
- [x] Complete Phase 4: Wire layout, remove old code, migrate e2e

## Notes

- Drawer width (`w-72` ≈ 18 rem ≈ 288 px) is intentionally fixed — toggle/resize is out of scope.
- Components are written zoneless-compatible (signals + OnPush + no `async` pipe + no `setTimeout` in CD-relevant paths) but the app bootstrap remains Zone-based; flipping to `provideZonelessChangeDetection` is a future plan.
- `SortingOption` enum is unchanged (Name / Number of Files / Area Size). Mockup label "Complexity ↓" is illustrative only.
- The `RULE` / `MANUAL` badge is purely a display derivation (`isPatternRule(path)`); the `BlacklistItem` shape is unchanged.

## References

- Reference images: `RestyleImages/Sidebar.png`, `RestyleImages/Flatten:hidden.png`
- Current explorer entry point: `app/codeCharta/ui/ribbonBar/searchPanel/searchPanel.component.ts:14-63`
- Current sortable tree selector: `app/codeCharta/ui/ribbonBar/searchPanel/mapTreeView/mapTreeViewNodeSelector/mapTreeViewNode.selector.ts:10-19`
- Current tree level (behaviour to mirror): `app/codeCharta/ui/ribbonBar/searchPanel/mapTreeView/mapTreeViewLevel/mapTreeViewLevel.component.ts:34-103`
- Current counts logic (formula reused): `app/codeCharta/ui/ribbonBar/searchPanel/matchingFilesCounter/selectors/matchingFilesCounter.selector.ts:17-32`
- Current blacklist item selector (per-type filtering): `app/codeCharta/ui/ribbonBar/searchPanel/blacklistPanel/createBlacklistItemSelector.ts:5-12`
- Pattern-to-blacklist conversion (3-dot menu): `app/codeCharta/ui/ribbonBar/searchPanel/searchBar/utils/parseBlacklistItems.ts:1-25`
- Per-rule path matching helper (reused for affected counts): `app/codeCharta/util/codeMapHelper.ts` (`isPathBlacklisted`)
- Feature pattern reference (signals + OnPush + DaisyUI): `app/codeCharta/features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.ts`
- Popover anchoring pattern: `app/codeCharta/features/labelSettings/components/labelSettingsButton/labelSettingsButton.component.html`
- DaisyUI + Tailwind config: `app/tailwind.css`
- Codemap viewport CSS to adjust: `app/codeCharta/ui/codeMap/codeMap.component.scss`
- Bootstrap (Zone-based, unchanged): `app/main.ts:7`
- Previous restyle plan (template/format reference): `plans/2026-04-29-restyle-navbar.md`
