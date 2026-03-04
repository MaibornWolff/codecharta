# PRD: Refactor Label Services

**Status:** Complete
**Author:** Christian Huehn
**Date:** 2026-03-04

## Problem Statement

`LabelCreationService` and `LabelCollisionService` in the label settings feature mix multiple concerns: imperative DOM creation, 3D position calculation, CSS style manipulation, and Three.js scene management. They share duplicated constants (`BASE_OFFSET_PX`), both directly manipulate DOM elements and inline styles, and the collision service reaches into the creation service's internal label structure (`cssObject.element.firstElementChild`). This tight coupling and concern-mixing makes both services hard to maintain, test, and extend.

## Goals & Success Criteria

- Separate DOM/visual concerns from 3D positioning and collision logic
- Replace imperative DOM construction with Angular components ("the Angular way")
- Eliminate duplication between the two services (shared constants, style manipulation)
- Reduce coupling — collision service should not reach into creation service internals
- All existing tests continue to pass; no visual regression

## Scope

### In Scope
- Refactor `labelCreation.service.ts` (~170 lines)
- Refactor `labelCollision.service.ts` (~354 lines)
- Extract shared constants and types
- Replace imperative DOM creation with Angular component(s)
- Update existing tests to match new structure

### Out of Scope
- New label features or behavior changes
- Performance optimization (beyond what naturally improves from cleaner architecture)
- Changes to other label settings services (amountOfTopLabels, colorLabels, etc.)
- Changes to the ngrx state/store layer

## Functional Requirements

### 1. Angular Label Component
- Create an Angular component to replace `createLabelElement()` and `createBadge()`
- Component renders name text, metric text, and optional "+N more" badge
- Styles defined in component stylesheet instead of inline `style.cssText`
- Component used via `CSS2DObject` (Three.js CSS2D renderer supports Angular-rendered elements)

### 2. Shared Label Constants
- Extract duplicated `BASE_OFFSET_PX`, `LABEL_GAP_PX`, and related layout constants to a shared location
- Both services reference the same constants

### 3. Clean Service Boundaries
- **LabelCreationService**: Responsible for creating/destroying labels, managing label-to-node mapping, and 3D positioning
- **LabelCollisionService**: Responsible for collision detection, layout resolution, connector drawing
- Collision service interacts with labels through a clean interface (not by reaching into DOM internals)
- Introduce a method on `InternalLabel` or creation service that exposes label rect/visibility without requiring `firstElementChild` access

### 4. Style Manipulation Consolidation
- Opacity and transform changes currently happen in both services
- Consolidate into one place — either the label component (via inputs/CSS classes) or a single service method

## User Stories / Workflows

**Developer maintaining labels:**
1. Wants to change label appearance → edits the Angular component template/styles
2. Wants to change collision behavior → edits collision service only, no DOM knowledge needed
3. Wants to add a new label data field → adds an `@Input()` to the component

## Edge Cases & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSS2DObject may not play well with Angular component lifecycle | Labels don't render or leak memory | Spike/prototype the CSS2DObject + Angular component integration first |
| Collision service performance depends on direct DOM access | Layout jank if indirection adds overhead | Benchmark before/after; keep hot path lean |
| Suppressed label opacity animation timing may change | Visual regression in hover behavior | Test suppress/restore flow manually and in e2e |

## Dependencies

- Three.js `CSS2DRenderer` / `CSS2DObject` — must verify Angular component compatibility
- Existing test suites for both services (`labelCreation.service.spec.ts`, `labelCollision.service.spec.ts`)

## Open Questions

- Can `CSS2DObject` host an Angular component's native element directly, or does it need a wrapper approach (e.g., `ViewContainerRef.createComponent` → attach `nativeElement`)?
- Should connector drawing (Three.js `LineSegments`) stay in the collision service or be extracted to its own service?
