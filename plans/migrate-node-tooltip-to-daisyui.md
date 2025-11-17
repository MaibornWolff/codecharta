---
name: Migrate Node Tooltip (Attribute Side Bar) to DaisyUI
issue: #4290
state: complete
version: 1.0
---

## Goal

Rebuild the node tooltips (attribute side bar) using modern DaisyUI styling and Angular signals, providing proper spacing and consistent design. The attribute side bar displays node information when users hover or click on buildings in the 3D visualization.

## Tasks

### 1. Analyze current implementation
- Review `attributeSideBar` component and its child components (header section, primary metrics, secondary metrics)
- Identify Material Design dependencies and custom SCSS that need replacement
- Document current state management patterns (observables vs signals)
- Understand the shadow styling and expansion animations

### 2. Migrate to Angular signals
- Convert `AttributeSideBarComponent` to use signal-based inputs where applicable
- Update `AttributeSideBarHeaderSectionComponent` to use signals for node and fileName inputs
- Migrate `AttributeSideBarPrimaryMetricsComponent` to signals
- Migrate `AttributeSideBarSecondaryMetricsComponent` to signals
- Ensure proper reactivity with computed signals where needed

### 3. Replace Material Design with DaisyUI
- Replace Material Design components with DaisyUI equivalents (cards, badges, dividers)
- Update the shadow styling to use DaisyUI shadow utilities or Tailwind classes
- Modernize the expansion/collapse animation using DaisyUI transitions
- Replace custom SCSS with DaisyUI utility classes where possible
- Ensure consistent spacing using DaisyUI spacing scale (gap, padding, margin)

### 4. Improve layout and spacing
- Add proper margins and padding using DaisyUI/Tailwind utilities
- Fix any spacing issues caused by Tailwind's preflight reset
- Ensure consistent typography using DaisyUI text utilities
- Verify responsive behavior on different screen sizes

### 5. Update tests
- Update component tests to work with signal-based API
- Verify all existing tests pass
- Add tests for new signal-based behavior if needed

## Steps

- [x] Complete Task 1: Analyze current implementation and dependencies
- [ ] Complete Task 2: Migrate AttributeSideBarComponent to signals (not needed - only uses observables)
- [x] Complete Task 2: Migrate AttributeSideBarHeaderSectionComponent to signals
- [ ] Complete Task 2: Migrate AttributeSideBarPrimaryMetricsComponent to signals (deferred - uses observables only)
- [ ] Complete Task 2: Migrate AttributeSideBarSecondaryMetricsComponent to signals (deferred - uses observables only)
- [x] Complete Task 3: Replace Material Design with DaisyUI styling (MatTooltip → DaisyUI tooltip)
- [x] Complete Task 4: Improve layout and spacing with DaisyUI utilities (updated shadow)
- [x] Complete Task 5: Update and run all tests
- [x] Verify visual appearance and functionality in running application

## Notes

- The "node tooltip" is implemented as the `attributeSideBar` component
- Component location: `app/codeCharta/ui/attributeSideBar/`
- Child components include header section, primary metrics, and secondary metrics
- Component appears as a side panel when nodes are selected/hovered
- Uses `.cc-shadow` class for styling
- Has expansion animation controlled by `isAttributeSideBarVisibleService`
- Should maintain smooth transitions during show/hide operations
- Focus on consistency with other DaisyUI-migrated components
