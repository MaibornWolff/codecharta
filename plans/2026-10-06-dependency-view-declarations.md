---
name: Declarations in the dependency view
issue: -
state: progress
version: -
---

## Goal

The dependency view shows the logical layer of the dependency lens: a file opens into its declarations, a
panel explains the selection, badges mark hidden cycles, and the graph can be framed by folders or by
declared packages. Prototype: https://claude.ai/artifact/A9zyBx3YHn7cAD3kf266eq

## Tasks

### 1. Lens: load the logical layer
- `ccJson2ToCCFile` keeps `namespaces`, `leaves` and `leafEdges`; selectors in `lenses/dependency` merge them
  over the visible files as the levels and edges are merged today
- `hasNamespacesSelector`; a map without the layer behaves exactly as today
- Delta and aggregation carry the layer the way they carry `dependencyLevels`

### 2. Renderer: files open into declarations
- A file is a container: its declarations are leaf boxes inside it, opened by double click or its toggle,
  closed on the first look
- Arrangement inside a file as a setting: stacked by level (default), list, chips
- Edge projection lifts a declaration edge to its visible ends: closed file ↔ closed file stays the file
  edge, an open file shows its declaration edges, an edge inside one open file is drawn inside it
- "Points upward" comes from the parser as delivered: the file edge's flag for anything between two files
  (folded or not), the declaration edge's flag inside one file
- A grey count on a closed file with more than one declaration

### 3. Renderer: declaration kind and kind of use
- Declaration kind as a setting: icon (default), shape, tint, off
- "Line style shows" as a setting: edge type (today's look, default) or kind of use (dash and arrowhead
  per usage kind); in the second the cycle-closing upward edge takes its own colour
- The four edge type colours become editable in "Edges shown", with the dark red as the new default for
  "points upward and closes a cycle"
- A file edge standing for one declaration edge draws that edge's usage style without unfolding
- Legend and tooltip follow the settings

### 4. Cycle badges
- A round blue badge on a closed file, folder or package counting the cyclic declaration edges it hides;
  none when all of them are on screen; a ring on a declaration that takes part in a cycle
- Setting to switch the badges off
- Clicking a badge selects the box and opens the panel on its cycles

### 5. Panel beside the graph
- A panel of the dependency view's own (`features/dependencyMap`), not the sidebar inspector
- File: folder, declared package, declarations, the dependencies inside the file, uses and used by grouped
  by the other file, open/close in graph
- Declaration: kind, file, package, level, uses and used by, its cycles
- Edge (now selectable): the declaration edges it stands for, counts per kind of use, "Unfold in graph"
- Folder or package: its files and declarations, cyclic and upward counts
- Cycles as chains (bounded search inside the strongly connected part, capped), hover highlights the chain,
  "Show in graph" opens the files involved
- Hovering a row highlights its edge; a row's file or declaration is clickable

### 6. Folders or packages
- "Hierarchy" in the bar, shown only when the map has namespaces
- Packages: namespaces as containers with their own levels, files inside the package their declarations
  declare, files without a package under their folders beside the package tree; "points upward" from the
  declaration edges' flags
- Selection and opened files survive the switch
- "Mark what moves" (off by default): files in another container, containers on another level and edges of
  another type between the two hierarchies

### 7. Settings, explorer, wrap-up
- All new bar settings saved with the existing dependency graph preferences (IndexedDB migration with
  defaults); hierarchy, opened files and the panel's state stay per session
- Explorer, search, exclude, focus and screenshot keep working with opened files and in Packages mode
- Keyboard: boxes focusable, Enter selects, Space opens and closes
- CHANGELOG: rewrite the unreleased dependency view entry; all checks green

## Steps

- [x] Complete Task 1: Lens
- [x] Complete Task 2: Files open into declarations
- [ ] Complete Task 3: Declaration kind and kind of use
- [ ] Complete Task 4: Cycle badges
- [ ] Complete Task 5: Panel
- [ ] Complete Task 6: Folders or packages
- [ ] Complete Task 7: Settings, explorer, wrap-up

## Notes

- Decided with the user: everything in one plan on `feature/dependency-declarations`; all three arrangements
  as a setting; declaration kind as a setting, default icon; own panel; edge colours editable and the dash
  meaning a setting; badge counts hidden cyclic dependencies; visualization only; packages with the rest by
  folder; "Mark what moves" included
- Each task is its own commit, structural changes before behavioural ones, tests first
- Only PHP reports more than `usage` today; the other languages light up once the parser carries the usage
  position (separate analysis plan)
- Open from the prototype: edges cross the declarations of an open file and steal their clicks, so routing
  around open files needs solving in task 2; a hub declaration needs a cap on rows in the panel; no level
  exists for declarations within a file, the namespace level is borrowed for the stacked arrangement; in a
  mixed project package levels and folder levels sit side by side and are not comparable
- Exploration and the dropped forms: `2026-10-06-logical-dependency-layer-visual-exploration.md`
