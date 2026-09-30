---
name: Round up the dependency view
issue: -
state: complete
version: -
---

## Goal

Bring the dependency view in line with the rest of CodeCharta before it grows further: the bar looks like the
metrics bar, edges are picked by type, excluding replaces its own hiding, and the bar remembers its settings.

## Tasks

### 1. Bar popovers styled like the metrics bar
- Drop daisyUI `menu` / `menu-active` (the black boxes) from the choice lists
- Rows like the shared metric list (`metricSelectOption`): plain list, `hover:bg-base-200`, the chosen row
  `bg-base-200 font-semibold` with `aria-pressed`, hints `text-xs opacity-70`
- Applies to Edge style and Line thickness; the checkbox and slider rows keep the metrics bar's form styling

### 2. Edges shown as toggles
- One checkbox per edge colour: Dependency, In a cycle, Points upward, Points upward and closes a cycle
- A header row All / None / Invert, built like the map selector's (`features/navBar/components/mapSelector`);
  nothing of it is shared yet, so extract the reusable part into `features/shared` only if it stays small
- None ticked: only the hovered box's edges show (today's "None")
- The card names the choice: "All", "None", or the ticked types
- Another edge metric: only Dependency applies, the other three are disabled
- Replaces the single-choice `EdgeFilter` in the view store, the scene and the builder

### 3. Exclude instead of hide
- Right-click Exclude writes CodeCharta's shared exclude list (`sharedView` exclude actions through the
  guarded `addExcludedNodesIfNotResultsInEmptyMap`), so the Metric view and the dependency view exclude alike;
  the graph already drops excluded nodes (`buildLeveledTree`)
- The explorer works like the Metric view's: excluded files leave the tree, the header shows the counts with the
  Excluded chip, whose list includes them again
- Reuse the Metric view's explorer rules and counts; views may not import each other, so move what both need
  (rules adapter, counts selector) to a shared place, or give the dependency view its own config pointing at the
  same selectors, as done for search and sort
- Remove the view's own hide: `hiddenPaths`, Hide / Show again, the greyed hidden rows and their hint

### 4. Save the bar's settings
- Edges shown, edge style, middle anchoring, line thickness and width factor survive a reload, stored in
  IndexedDB like the metrics bar settings (the edge metric already is)
- Move them from the view-local `DependencyMapViewStore` into the ngrx state (a preferences or mapState slice),
  add their actions to `actionsRequiringSaveCcState`, restore them in `loadInitialFile.store`, bump the IndexedDB
  version with a migration seeding the defaults
- Opened folders and moved boxes stay per session

## Steps

- [x] Complete Task 1: Bar popovers styled like the metrics bar
- [x] Complete Task 2: Edges shown as toggles
- [x] Complete Task 3: Exclude instead of hide
- [x] Complete Task 4: Save the bar's settings

## Notes

- Decided with the user: shared exclude; the explorer as in the Metric view; one toggle per edge colour with
  All / None / Invert; only the bar settings are saved
- Each task is its own commit; knip, dependency-cruiser and a browser check after each
- Later, not in this plan: switching to the logical path (namespaces, leaves, leafEdges); file-level cycles for the
  blue colour on the physical path
