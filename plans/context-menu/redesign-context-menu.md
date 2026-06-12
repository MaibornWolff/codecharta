---
name: redesign-context-menu
issue: none
state: complete
version: 1
---

## Goal

Migrate the node context menu (right-click on map buildings and explorer rows) from `ui/nodeContextMenu` (Material, CDK overlay, SCSS) to a new `features/nodeContextMenu` feature — zoneless, signals, OnPush, daisyUI/Tailwind, no SCSS — matching the mock in `redesign-context-menu.png`. Includes a new "Show in Explorer" action and migrating the custom color picker.

## Clarified decisions

- Header row (copy icon + `…/name`) copies the node path **without the leading root/map-name segment**
- Color swatch row stays **folders only** (mock just shows a file)
- "Show in Explorer" does a **full reveal**: open the sidebar if collapsed, expand ancestors, scroll node into view, brief highlight
- "Show in Explorer" is **hidden when the right-click came from the explorer**
- Preset swatches use the **same marking colors as before** (from `mapColors.markingColors` state)
- Custom color: **reuse `inlineColorPicker`** from metricsBar, extracted to a shared location

## Tasks

### 1. Feature scaffold + trigger
- Create `features/nodeContextMenu/` with `components/`, `stores/` following sidebarExplorer/metricsBar conventions
- Keep `setRightClickedNodeData` as the trigger; extend its state value with an `origin: "map" | "explorer"` field (update both dispatch sites: `codeMap.mouseEvent.service` and `explorerTreeLevel`)
- Menu component subscribes via `toSignal`, renders a fixed-positioned native popover at the click coordinates (clamp to viewport); close on outside click, scroll, and node deselect — mirror old close conditions

### 2. Menu content per mock
- Header: copy icon + truncated path (`…/<name>`), click copies path without root/map-name prefix, brief confirmation feedback
- Entries with dividers per mock: Show in Explorer / Focus / Keep Highlight / Flatten / Exclude
- Preserve toggle behavior of the old buttons (Unfocus, Unflatten, Remove Highlight) with state-dependent labels
- Same store actions as the old menu (focusedNodePath, blacklist flatten/exclude, highlight)
- Bottom row (folders only): preset swatches from `mapColors.markingColors`, mark/unmark via `markPackages`/`unmarkPackage`, ×-icon on the active swatch like before

### 3. Show in Explorer
- Add a `revealNode(path)` API to the sidebarExplorer feature (exposed via its `facade.ts`): uncollapse sidebar, expand ancestor folders, scroll into view inside `#explorer-scroll`, transient highlight
- Hide the entry when `origin === "explorer"`

### 4. Shared color picker
- Extract `inlineColorPicker` out of `features/metricsBar/components/colorSettingsPopover/` into a shared features location; update metricsBar imports
- Brush button in the color row opens it; picked color dispatches `markPackages`

### 5. Remove old implementation + tests
- Delete `ui/nodeContextMenu/` (incl. `NodeContextMenuService`), the `openNodeContextMenu` effect, and their wiring; keep `ui/colorPicker` (still used by legendPanel etc.)
- Specs for new components (AAA, "should" naming); migrate/replace nodeContextMenu e2e + po
- Run `npm test`, `npm run lint:architecture`, verify at runtime (map right-click, explorer right-click, reveal, marking colors unchanged)

## Steps

- [x] Complete Task 1: Feature scaffold + trigger
- [x] Complete Task 2: Menu content per mock
- [x] Complete Task 3: Show in Explorer
- [x] Complete Task 4: Shared color picker
- [x] Complete Task 5: Remove old implementation + tests

## Review Feedback Addressed

1. **Clear custom color**: a custom (non-preset) mark color had no unmark affordance — added an ×-button next to the brush that appears when the folder is marked with a color no preset swatch represents
2. **Exclude styling**: was red icon + grey text — now black like the other entries (removed the `isDestructive` styling from `contextMenuItem`)
3. **Show icon**: the unflatten ("Show") entry uses the flatten icon rotated 180° (`fa-rotate-180`)
4. **Color row squish**: when the clear button appeared (custom color set) the row overflowed the `w-64` card and flexbox shrank the swatches together — restructured to two `justify-between` groups with `shrink-0`, swatches at `h-6 w-6` (closer to the mock); verified at runtime that swatch widths stay 24px with the clear button visible
5. **Subagent review** (verdict: mergeable, no critical findings) — applied: deleted leftover verification driver script; added unit tests for the close model (pointerdown outside/inside, wheel, resize), the reveal effect (ancestor expansion, sibling-prefix non-match, flash), unfocus-all, `_getCurrentMarkColor`, and the picker's `triggerIcon` branch; `markFolderRow` now derives the node path from the right-clicked-node store instead of an input (single source of truth with its mark state); brush button title follows `ariaLabel`; pending clamp `requestAnimationFrame` is cancelled on reopen; removed unused `clickOnExclude` from the page object. Confirmed-OK by review: close-condition parity (old click-listener leak fixed), focused-parent prefix false positive fixed, reveal effect ordering, architecture rules, e2e validity

## Notes

- Mock: `plans/context-menu/redesign-context-menu.png`
- `origin: "codeMap" | "explorer"` added to `rightClickedNodeData` — drives the show-in-explorer visibility
- Copy path strips the leading `/root/` segment; for the root node itself the node name is copied
- Reveal: `ExplorerRevealService` (exported via sidebarExplorer facade) holds `revealedNodePath`; each `explorerTreeLevel` opens itself when an ancestor of that path and scrolls/flashes when it is the target; flash clears after 1.5 s
- `inlineColorPicker` moved to `features/shared/components/inlineColorPicker/` with a new optional `triggerIcon` input (brush-button variant); metricsBar imports updated
- Verified at runtime via Electron + Playwright under xvfb (no Playwright chromium for ubuntu26-arm64): map/explorer right-click, reveal+flash, preset colors unchanged (`#FF1D8E #1d8eff #1DFFFF #8eff1d #8e1dff`), custom pick + clear, flatten/show toggle, wheel/outside-click dismissal
- `npm test` 379 suites green; dependency-cruiser 0 errors (80 pre-existing circular warnings)
- Pre-existing, unrelated: `colorBandRow.component.spec` has a tsc-only typing error (`mapColorFor: string`); jest is unaffected
- Explorer hover tooltip stays visible next to an open context menu and shows the metric twice when height and color metric are identical (pre-existing; noticed during verification)
