---
name: fix-label-collision-stacking
issue: n/a
state: complete
version: 1
---

## Problem

When multiple labels overlap on screen, the collision resolution pushes each label further down in a cascade. With 5+ colliding labels (~24px each: 20px height + 4px gap), the bottom labels exceed the 100px `MAX_DISPLACEMENT_PX` threshold and are hidden (`opacity: 0`). This causes entire collision groups to disappear — the user sees labels vanish instead of being readable.

### Root cause

`resolveLabelCollisions` accumulates offsets linearly: label N gets offset ≈ N × 24px. For a group of 5 overlapping labels, the 5th has offset ~96px (borderline), the 6th ~120px (hidden). Since buildings often cluster by height, collision groups of 6+ are common, and most members of the group get hidden.

## Goal

Replace the cascade-and-hide collision behavior with a grouped stacking approach: the highest-priority label in each collision group stays visible at its original position, with a "+N more" badge indicating hidden siblings.

## Behavior

1. **Priority = metric value**: within a collision group, the label with the highest metric value (heightMetric or colorMetric, depending on labelMode) stays visible
2. **Collapse group**: all other labels in the group are hidden, and a "+N more" badge is shown above the visible label
3. **MAX_DISPLACEMENT_PX = 100px**: unchanged — only applies if the winning label itself is displaced by tooltip collision
4. **Connector lines**: always drawn for the visible label in each group (no change needed)

## Steps

- [x] Refactor `resolveCollisions` to identify collision groups (sets of labels whose rects overlap horizontally and vertically)
- [x] Within each group, pick the label with the highest metric value as the "winner"
- [x] Hide non-winner labels (`opacity: 0`) without applying cascade offsets
- [x] Create a "+N more" badge element above/below the winning label showing the count of hidden siblings
- [x] Ensure the badge is cleaned up when labels are cleared
- [x] Update tests

## Notes

- Collision groups are transitive: if A overlaps B and B overlaps C, all three are one group (even if A and C don't directly overlap)
- The "+N more" badge should match the label styling (same font, background, border-radius) but smaller
- The badge should not itself participate in collision detection
- `resolveTooltipCollisions` can remain as-is — it only offsets labels away from the tooltip
