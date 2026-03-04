# PRD: Tooltip-Label Collision Padding

**Status:** Draft
**Author:** Christian Huehn
**Date:** 2026-03-04

## Problem Statement

When the cursor hovers over or near a label on the 3D map, the tooltip appears and overlaps with that label. Other labels further away correctly get displaced by the tooltip, but the label directly under/near the cursor stays in place. This creates a visual collision between the tooltip and the nearby label.

The root cause is that `resolveTooltipCollisions` uses pixel-exact bounding rect overlap. Labels that are very close to the tooltip but not yet technically overlapping (or just barely overlapping) don't get displaced soon enough.

## Goals & Success Criteria

- Labels near the tooltip start displacing before they visually overlap
- No change to existing displacement behavior — just earlier trigger via padding
- No visual regression for labels far from the tooltip

## Scope

### In Scope
- Add configurable padding around the tooltip rect in collision detection
- Apply padding in `resolveTooltipCollisions` in `labelCollision.service.ts`

### Out of Scope
- Changes to tooltip positioning or appearance
- Changes to label-vs-label collision grouping
- New animation or transition behavior

## Functional Requirements

### Tooltip Collision Padding
- Expand the tooltip's bounding rect by a padding value (e.g. 8–16px) on all sides before checking for label overlap
- The padding should be a constant in `label.constants.ts` for easy tuning
- The displacement calculation itself stays the same — only the detection trigger zone gets larger

## Edge Cases & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Too much padding displaces labels unnecessarily | Labels jump around when tooltip is far away | Keep padding small (8–16px), test visually |
| Padding interacts poorly with label grouping | Labels that should group get displaced instead | Grouping runs before tooltip collision, so order is preserved |

## Open Questions

- What's the right padding value? Start with ~12px and tune visually.
