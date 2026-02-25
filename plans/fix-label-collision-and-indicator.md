---
name: Fix label collision jitter and missing color indicator
issue: none
state: complete
version: 1
---

## Goal

Fix two label UX issues: (1) building labels oscillate/jitter when two labels compete for the same screen position, and (2) there is no indicator when a color category (e.g., negative) has zero matching buildings.

## Phase 1: Stable Label Collision Resolution

### Problem

The collision detection in `codeMap.label.service.ts` sorts labels by `rect.top` (screen Y) and applies a greedy sweep to push colliding labels downward. When two labels have nearly identical screen Y positions, their sort order can flip between frames, causing them to alternately push each other down — resulting in visible oscillation.

### Root Cause

`resolveCollisions()` sorts by `rect.top` only. When two labels have the same (or near-equal) `rect.top`, their relative order is unstable across frames because tiny sub-pixel rendering differences cause them to swap positions.

### Fix

Add a stable tiebreaker to the sort in `resolveCollisions()`. When two labels have the same `rect.top`, break the tie using the node's path (or another deterministic identifier). This ensures the same label always "wins" priority, eliminating oscillation.

### Tasks

#### 1. Add stable tiebreaker to collision sort
- In `resolveCollisions()`, change the sort from `a.rect.top - b.rect.top` to include a secondary sort key (e.g., node path string comparison)
- The `InternalLabel` already holds `node` which has a `path` — use this as tiebreaker
- File: `visualization/app/codeCharta/ui/codeMap/codeMap.label.service.ts`

#### 2. Write tests
- Add test case: two labels at same screen Y should resolve in consistent order
- Add test case: labels should not change relative order between consecutive collision resolution calls

## Phase 2: Color Category Empty Indicator

### Problem

When color labels are enabled for a category (positive/neutral/negative) but no buildings match that color range, the user gets no feedback — no labels appear and the legend shows the range with a dash. There's no way to know *before* enabling a toggle whether it will yield results.

### Fix

Two indicators:

1. **Color label toggles (ribbon bar)**: Show the count of matching buildings next to each toggle, e.g., "Negative (0)", "Positive (12)". When count is 0, visually grey out the toggle.
2. **Legend panel**: When a color category has 0 matching buildings and is selected, show a note like "(no matching buildings)" in the legend row for that color.

### Tasks

#### 3. Add building counts to color label toggles
- In the ribbon bar where color label checkboxes are rendered, compute and display the count of buildings per color category
- Source the counts from `CodeMapRenderService.nodesByColor` (already computed during render)
- Grey out / disable toggles with 0 count
- File: find the component rendering the color label toggles in the ribbon bar

#### 4. Add empty indicator to legend panel
- In `LegendPanelComponent` / `MapColorLabelPipe`, when the range resolves to `-` (no buildings), add text "(no matching buildings)"
- File: `visualization/app/codeCharta/ui/legendPanel/`

#### 5. Write tests
- Test that toggle shows correct count for each color category
- Test that toggle is greyed out when count is 0
- Test that legend shows "(no matching buildings)" when category is empty

## Steps

- [x] Phase 1: Add stable tiebreaker to label collision sort
- [x] Phase 1: Write tests for stable collision resolution
- [x] Phase 2: Add building counts to color label toggles in ribbon bar
- [x] Phase 2: Add empty indicator to legend panel
- [x] Phase 2: Write tests for indicator features

## Notes

- Scope: building leaf labels only (CSS2D), not floor labels
- The `nodesByColor` map in `CodeMapRenderService` already categorizes buildings — reuse this for counts
- The collision fix is minimal and low-risk; Phase 2 is a small UI addition
- `resolveCollisions()` runs every frame via `afterRender$`, so the tiebreaker must be cheap (string comparison on path is fine)
