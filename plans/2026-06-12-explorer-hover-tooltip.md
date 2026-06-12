---
name: explorer-hover-tooltip
issue: none
state: complete
version: 1
---

## Goal

Show the map's building tooltip (name + active metrics) when hovering files and folders in the sidebar explorer tree, anchored to the right edge of the hovered row.

## Tasks

### 1. Widen tooltip service input
- `CodeMapTooltipService.show()` currently takes layout `Node`; accept a minimal `TooltipNode` (name, optional id/attributes) so `CodeMapNode` works too
- Guard against missing `attributes`

### 2. Wire explorer rows
- `ExplorerTreeLevelComponent.onMouseEnter`: anchor tooltip at the row's right edge via the mouseenter event's currentTarget rect
- `onMouseLeave`: hide tooltip
- Template: pass `$event` to `onMouseEnter`

### 3. Tests + architecture check
- Unit tests for show/hide in explorerTreeLevel spec
- Run `npm run lint:architecture` (dependency-cruiser)

## Steps

- [x] Complete Task 1: Widen tooltip service input
- [x] Complete Task 2: Wire explorer rows
- [x] Complete Task 3: Tests + architecture check

## Notes

- Anchored to row (not mouse-following) per recommendation accepted by user
- Map tooltip is canvas-raycast driven only; no double-trigger from store
- Verified at runtime: tooltip shows for files and folders (aggregated metrics), hides on unhover and on click (consistent with map behavior); map building tooltip unaffected
- dependency-cruiser: 0 errors, 80 warnings — all pre-existing circulars in 3DExports/model, none involve the new sidebarExplorer → ui/codeMap import
- Follow-up: removed the native `[title]` tooltip from explorerTreeItemName — redundant now that the hover tooltip shows the node name
