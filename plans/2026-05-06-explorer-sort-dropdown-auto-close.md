---
name: explorer-sort-dropdown-auto-close
issue: ""
state: complete
version: <next>
date: 2026-05-06
git_commit: 4e006b32875d0a540867c949f59aa1d4200a4203
branch: main
topic: "Auto-close the explorer sort dropdown when an item is clicked"
tags: [plan, visualization, sidebar, explorer, daisyui, signals, bugfix]
---

# Auto-close the explorer sort dropdown when an item is clicked

## Goal

Fix `ExplorerSortControlComponent` so the dropdown closes immediately after the user picks a sort key OR toggles ascending/descending. Today the menu stays open because the daisyUI dropdown is purely CSS-driven (`:focus-within`) and the option buttons remain inside the dropdown after click. Migrate the component to the same controlled-signal pattern already in use in `MapSelectorComponent` and `DeltaSelectorComponent`.

## Current State Analysis

`features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.html` uses daisyUI's pure-CSS dropdown:

```html
<div class="dropdown dropdown-start w-full px-2 mt-2">
    <button type="button" class="btn ..."> ... </button>
    <ul class="dropdown-content menu ...">
        @for (option of sortOptions; track option) {
            <li><button (click)="setSortingOption(option)">{{ option }}</button></li>
        }
        <li><button (click)="toggleSortOrder()"> ... </button></li>
    </ul>
</div>
```

daisyUI shows `.dropdown-content` while focus is inside `.dropdown`. The option buttons are still inside `.dropdown`, so clicking one keeps focus there → menu stays open. There is no JS state controlling visibility, no outside-click handler, no explicit close.

The component is `OnPush` and reactive (`toSignal` of `sortState$`). It's already zoneless-compatible per the `features/` rule.

## Desired End State

- Clicking a sort-key option dispatches `setSortingOption(...)` **and** closes the dropdown.
- Clicking the bottom "Sort ascending / Sort descending" toggle dispatches `toggleSortingOrderAscending()` **and** closes the dropdown.
- Clicking the trigger button toggles the dropdown open/closed.
- Clicking outside the component closes the dropdown.
- All existing specs keep passing; new specs cover open / close / outside-click behaviour.

## What We're NOT Doing

- **Not refactoring `MapSelectorComponent` / `DeltaSelectorComponent`** — they already work correctly. This is a surgical fix scoped to the sort control.
- **Not extracting a shared dropdown directive / component**. The pattern is short and repeated in only three places; abstraction can come later if a fourth appears.
- **Not adding Escape-to-close, keyboard navigation, or ARIA improvements** beyond what already exists. Match the behaviour of the two reference dropdowns.
- **Not animating the open/close.** Instant swap, same as today.
- **Not changing the sort logic, store wiring, or `ExplorerSortService`.**

## UI Mockups

### Before — bug

```
Sort: Name  ▾ ↓                    ← user clicks dropdown
  ┌────────────────────────────┐
  │ Name                       │  ← user clicks "Number of files"
  │ Number of files            │  ← dropdown STAYS OPEN
  │ Area Size                  │
  │ ────────────────────────── │
  │ ↑ Sort descending          │
  └────────────────────────────┘
```

### After — fix

```
Sort: Name  ▾ ↓                    ← user clicks dropdown (open)
  ┌────────────────────────────┐
  │ Name                       │
  │ Number of files            │  ← user clicks "Number of files"
  │ Area Size                  │
  │ ────────────────────────── │
  │ ↑ Sort descending          │
  └────────────────────────────┘

Sort: Number of files  ▾ ↓        ← dropdown CLOSED, label updated
```

The visual layout of the dropdown contents is unchanged.

## Architecture and Code Reuse

### Pattern reused from `MapSelectorComponent` / `DeltaSelectorComponent`

```
isOpen = signal(false)
[class.dropdown-open]="isOpen()"  on outer .dropdown
@if (isOpen()) { <dropdown-content/> }   ← optional but matches the two reference components
@HostListener("document:click")     ← close on outside click
toggleOpen() / item-handlers .set(false) on dropdown close
```

References:
- `app/codeCharta/features/navBar/components/mapSelector/mapSelector.component.ts:25` (`isOpen = signal(false)`), `:54-72` (HostListener + toggle), `:132` (close on apply).
- `app/codeCharta/features/navBar/components/deltaSelector/deltaSelector.component.ts:23,49-71` (same pattern with a tri-state signal).

### Files affected

- `app/codeCharta/features/sidebarExplorer/components/explorerSortControl/`
  - `explorerSortControl.component.ts` — **modified**: add `isOpen` signal, `toggleOpen()`, `HostListener("document:click")`, `ElementRef` injection; close in `setSortingOption` and `toggleSortOrder`.
  - `explorerSortControl.component.html` — **modified**: bind `[class.dropdown-open]` to the outer `.dropdown`, wire `(click)="toggleOpen()"` on the trigger button, wrap the `<ul class="dropdown-content ...">` in `@if (isOpen())`.
  - `explorerSortControl.component.spec.ts` — **modified**: add specs for open/close on trigger click, close after picking an option, close after toggling order, close on outside click. Existing tests stay green (the rendered DOM in the open state is unchanged).

### Component sketch

```ts
// explorerSortControl.component.ts (key bits)
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from "@angular/core"

export class ExplorerSortControlComponent {
    private readonly explorerSortService = inject(ExplorerSortService)
    private readonly elementRef = inject(ElementRef<HTMLElement>)

    readonly isOpen = signal(false)
    readonly sortOptions = Object.values(SortingOption) as SortingOption[]
    readonly sortState = toSignal(this.explorerSortService.sortState$, { requireSync: true })
    readonly currentOption = computed(() => this.sortState()[0])
    readonly isAscending = computed(() => this.sortState()[1])

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent) {
        if (!this.isOpen()) return
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.isOpen.set(false)
        }
    }

    toggleOpen() { this.isOpen.update(v => !v) }

    setSortingOption(value: SortingOption) {
        this.explorerSortService.setSortingOption(value)
        this.isOpen.set(false)
    }

    toggleSortOrder() {
        this.explorerSortService.toggleSortingOrderAscending()
        this.isOpen.set(false)
    }
}
```

```html
<!-- explorerSortControl.component.html (key bits) -->
<div class="dropdown dropdown-start w-full px-2 mt-2" [class.dropdown-open]="isOpen()">
    <button type="button" class="btn btn-ghost btn-sm w-full justify-between normal-case font-normal"
            [title]="'Sort: ' + currentOption()"
            (click)="toggleOpen()">
        <!-- unchanged content -->
    </button>
    @if (isOpen()) {
        <ul class="dropdown-content menu bg-base-100 rounded-box z-20 w-full mx-2 p-2 shadow">
            <!-- unchanged option list and order toggle -->
        </ul>
    }
</div>
```

## Performance Considerations

- One additional signal in the component, read in two host bindings. Negligible.
- `@if (isOpen())` removes the option `<ul>` from the DOM when closed — small CD/perf win versus today's always-rendered list (3 options + 1 separator).

## Migration Notes

- No persisted state; nothing to migrate.
- Default state is **closed**, matching the visual default today.
- Public API of the component is unchanged (selector `cc-explorer-sort-control`, no inputs/outputs).

---

## Tasks

### 1. Convert `ExplorerSortControlComponent` to a controlled dropdown

- [x] Add `ElementRef` and `HostListener` imports; add `signal` import. Inject `ElementRef<HTMLElement>` as `elementRef`.
- [x] Add `readonly isOpen = signal(false)` and a `toggleOpen()` method that flips it.
- [x] Add `@HostListener("document:click", ["$event"]) handleDocumentClick(event)` that sets `isOpen` to `false` when the click target is outside `elementRef.nativeElement`.
- [x] Update `setSortingOption(value)` and `toggleSortOrder()` to call `this.isOpen.set(false)` after dispatching to the service.

### 2. Wire visibility into the template

- [x] Add `[class.dropdown-open]="isOpen()"` to the outer `<div class="dropdown ...">`.
- [x] Add `(click)="toggleOpen()"` to the trigger `<button>`.
- [x] Wrap the `<ul class="dropdown-content ...">` in `@if (isOpen()) { ... }`.

### 3. Cover the new behaviour with specs

- [x] In `explorerSortControl.component.spec.ts`, add a test that the dropdown content is not rendered initially (`screen.queryByText(SortingOption.AREA_SIZE)` is null).
- [x] Update the existing "should render every sorting option" test (currently asserts every option is in the DOM at render time) to first click the trigger to open the menu, then assert the options are visible. Required because once `@if (isOpen())` is added, the option `<ul>` is hidden by default and `getByText(SortingOption.NUMBER_OF_FILES)` / `getByText(SortingOption.AREA_SIZE)` would throw.
- [x] Add a test that clicking the trigger button reveals the option list (`SortingOption.AREA_SIZE` becomes visible).
- [x] Update the existing "dispatches setSortingOption" test to first click the trigger to open the menu, then click the option, then assert the option list is no longer in the DOM.
- [x] Update the existing "dispatches toggleSortingOrderAscending" test the same way: open, click order toggle, assert closed.
- [x] Add a test that clicking on `document.body` (outside the component) closes an open dropdown.

### 4. Verify

- [x] Run `npm test` from `visualization/`; new and existing specs pass.
- [x] Run `npm run build` from `visualization/`; clean build.
- [x] Run `npm run format:check` from the repo root.
- [x] `npm run dev` and exercise the dropdown manually (see Manual Verification).
- [x] Add a "Fixed 🐞" entry to `visualization/CHANGELOG.md` under `[unreleased]`.

## Steps

- [x] Complete Task 1: Convert `ExplorerSortControlComponent` to a controlled dropdown
- [x] Complete Task 2: Wire visibility into the template
- [x] Complete Task 3: Cover the new behaviour with specs
- [x] Complete Task 4: Verify

## Automated Verification

- [x] New "trigger click opens menu" spec passes.
- [x] Updated "setSortingOption closes menu" spec passes.
- [x] Updated "toggleSortingOrderAscending closes menu" spec passes.
- [x] New "outside click closes menu" spec passes.
- [x] `npm test` passes.
- [x] `npm run build` succeeds.
- [x] `npm run format:check` passes.

### Constraint gates (run from `visualization/`)

- [x] OnPush preserved: `grep -c "ChangeDetectionStrategy.OnPush" app/codeCharta/features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.ts` returns `1`.
- [x] No `setTimeout` / `NgZone` / manual CD in the changed file: `! grep -nE "setTimeout|NgZone|ChangeDetectorRef" app/codeCharta/features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.ts`.
- [x] No new files outside the feature folder: `git diff --name-only main -- ':!visualization/app/codeCharta/features/sidebarExplorer/components/explorerSortControl/' ':!visualization/CHANGELOG.md' | wc -l` returns `0`.

## Manual Verification (`npm run dev`)

- [x] On load, the sort control shows `Sort: Name ↓` (or persisted state) with the dropdown closed.
- [x] Clicking the trigger opens the menu listing `Name`, `Number of files`, `Area Size`, and a `Sort ascending / descending` row.
- [x] Clicking any sort-key option (e.g. `Area Size`) updates the trigger label, re-sorts the file tree, and closes the menu.
- [x] Clicking the order toggle row flips the arrow icon, re-sorts the tree, and closes the menu.
- [x] Clicking the trigger again while the menu is open closes the menu without dispatching anything.
- [x] Clicking anywhere outside the sort control while the menu is open closes the menu.
- [x] No console warnings related to change detection or destroyed signals.

## Notes

- The fix mirrors `MapSelectorComponent` / `DeltaSelectorComponent` exactly so future readers see one consistent pattern in the project for controlled daisyUI dropdowns.
- `@if (isOpen())` (rather than just `[class.dropdown-open]`) was chosen for parity with the two reference components and to avoid keeping the list mounted while hidden — small CD savings, no behavioural difference.
- Default state is **closed**, matching today's visual default.

## References

- Sort control source: `visualization/app/codeCharta/features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.ts:1-27`
- Sort control template: `visualization/app/codeCharta/features/sidebarExplorer/components/explorerSortControl/explorerSortControl.component.html:1-33`
- Reference pattern (single-state): `visualization/app/codeCharta/features/navBar/components/mapSelector/mapSelector.component.ts:25,54-72,132`
- Reference pattern (multi-state): `visualization/app/codeCharta/features/navBar/components/deltaSelector/deltaSelector.component.ts:23,49-71`
- Sidebar redesign that introduced this control: `plans/2026-05-04-sidebar-explorer.md`
