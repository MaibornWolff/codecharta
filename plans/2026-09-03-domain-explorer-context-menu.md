---
name: domain-explorer-context-menu
issue: none
state: todo
version: 1
---

## Goal

Give the domain explorer a right-click context menu that reuses the existing node context menu, so
both views feel the same, and let the user jump from a domain node to the metrics view (and back)
with that node selected and revealed there.

## Clarified decisions

- Reuse `features/nodeContextMenu` for the domain view instead of building a second menu
- Domain shows only the copy-path header and "Show in Metrics" — no focus/highlight/flatten/exclude/marking
- Which entries render is driven by a `NODE_CONTEXT_MENU_CAPABILITIES` token, mirroring `EXPLORER_CAPABILITIES`
- The jump selects the node in the target view and reveals it in that view's explorer
- The metrics menu gets the reciprocal "Show in Domain", hidden while no domain data is loaded
- The clamp-to-viewport + dismiss behavior duplicated by the node menu and the word menu is extracted first

## Tasks

### 1. Extract the floating menu shell (structural)
- New `cc-floating-menu` in `features/shared`: anchor input, `dismissed` output, viewport clamping,
  close on outside pointerdown / wheel / resize, `contextmenu` suppressed
- Migrate `NodeContextMenuComponent` and `DomainWordMenuComponent` onto it, dropping their copies

### 2. Capability-driven node context menu (structural)
- `NODE_CONTEXT_MENU_CAPABILITIES` token with `showMapActions` and `jumpTargetView`
- Metrics view provides the defaults plus the domain jump target; entries gate on the capabilities
- Extract the shared `ExplorerContextMenu` implementation both views need; metrics keeps its area check

### 3. Cross-view node handoff (behavioral)
- Root `ViewHandoffStore` holding the node path handed to a view
- Shared explorer directive that, on arriving at its view, selects the handed-off node via
  `EXPLORER_SELECTION` and reveals it; hosted by both view components

### 4. Domain explorer menu + jumps (behavioral)
- `DomainExplorerContextMenu` provided by the domain view; domain view renders `cc-node-context-menu`
- "Show in Metrics" / "Show in Domain" hand the node over and navigate; the domain entry only
  appears while domain data is available

## Steps

- [ ] Complete Task 1: Extract the floating menu shell
- [ ] Complete Task 2: Capability-driven node context menu
- [ ] Complete Task 3: Cross-view node handoff
- [ ] Complete Task 4: Domain explorer menu + jumps
- [ ] Update CHANGELOG.md and the domain view docs

## Notes

- Both views resolve nodes from the same structure tree, so a path handed over always resolves
- A node excluded from the metrics map has no explorer row there; the reveal then just does nothing
