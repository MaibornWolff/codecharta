---
name: Migrate Gradient Mode Selector to DaisyUI
issue: #4291
state: complete
version: 1.0
---

## Goal

Rebuild the gradient mode selector using DaisyUI select component and Angular signals, eliminating the visual dividing line issue from Material Design.

## Background

The gradient mode selector appears in the Color Settings Panel (ribbon bar) when clicking "Color Metric Options". Currently uses Material Design `mat-select` which has a problematic dividing line through the control.

## Current Implementation

- **Location**: `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.html`
- **Technology**: Material Design `mat-form-field` + `mat-select`
- **Issues**:
  - Visual dividing line through the selector
  - Material CSS variables causing layout conflicts
  - Part of Material Design migration to DaisyUI

## New Implementation Requirements

### Technology Stack
- Angular 20 standalone component (or inline in colorSettingsPanel)
- Angular signals for reactive state
- DaisyUI select component
- Tailwind CSS v4 utility classes
- Native HTML select element (better performance)

### Styling Requirements
- Use DaisyUI's `select` and `select-bordered` classes
- Clean, borderless design OR single consistent border
- Proper label positioning with `label` and `label-text`
- Responsive width using `w-full`
- NO dividing lines

### Component Features
- Label: "Gradient Mode"
- Options: Absolute, Focused Gradient, Weighted Gradient, True Gradient
- Emit change events to update color mode state
- Proper focus states

### Component Structure
Option 1: Inline in colorSettingsPanel
Option 2: Separate component:
```typescript
- gradientModeSelector.component.ts (with signals)
- gradientModeSelector.component.html (DaisyUI select)
- gradientModeSelector.component.scss (minimal)
- gradientModeSelector.component.spec.ts (tests)
```

## Tasks

### 1. Design new DaisyUI select
- Review DaisyUI form control documentation
- Test different select styles to find cleanest (no dividing lines)
- Design label positioning (above or inline)
- Ensure accessibility (labels, focus states)

### 2. Create new implementation with signals
Option A: Inline replacement in colorSettingsPanel.component.html
```html
<div class="gradient-mode-selector">
  <label class="label">
    <span class="label-text">Gradient Mode</span>
  </label>
  <select
    class="select select-bordered w-full"
    [value]="colorMode()"
    (change)="handleColorModeChange($event)"
  >
    <option value="absolute">Absolute</option>
    <option value="focusedGradient">Focused Gradient</option>
    <option value="weightedGradient">Weighted Gradient</option>
    <option value="trueGradient">True Gradient</option>
  </select>
</div>
```

Option B: Create standalone component

### 3. Update colorSettingsPanel component
- Remove Material imports (MatFormField, MatLabel, MatSelect, MatOption)
- Convert to signals if not already using them
- Update event handler for native change event
- Remove all Material CSS variables from SCSS

### 4. Test thoroughly
- Visual testing: verify NO dividing line
- Test all gradient mode selections
- Verify state updates correctly
- Test keyboard navigation
- Test in both normal and delta states

### 5. Replace old implementation
- Remove Material select markup
- Remove Material imports
- Update tests
- Verify no regressions

## Success Criteria

- [ ] NO visual dividing line in selector
- [ ] Uses DaisyUI select component
- [ ] Clean, modern appearance
- [ ] All gradient modes selectable
- [ ] Proper focus states
- [ ] Keyboard accessible
- [ ] Works in both normal and delta states
- [ ] All tests pass
- [ ] Material Design imports removed

## Files to Modify

- `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.html`
- `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.ts`
- `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.scss`
- `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.spec.ts`

## Files to Potentially Create

- `app/codeCharta/ui/ribbonBar/gradientModeSelector/` (if separate component preferred)

## Investigation Steps

### Step 1: Identify dividing line source
Before rebuilding, use browser DevTools to:
1. Inspect the current Material select
2. Identify which CSS rule creates the dividing line
3. Screenshot for reference

### Step 2: Test DaisyUI select in isolation
1. Create minimal test component with DaisyUI select
2. Verify NO dividing line appears
3. Test different DaisyUI select variants (bordered, ghost, etc.)
4. Choose cleanest option

### Step 3: Build and test
1. Implement chosen solution
2. Verify dividing line is gone
3. Test all functionality

## Notes

- **CRITICAL**: Must eliminate dividing line completely
- Use native select for better performance vs Material
- DaisyUI select is just styled native select
- Consider using `select-ghost` if `select-bordered` has issues
- Test on different browsers
- May need to override DaisyUI defaults if line persists
- Document any custom CSS overrides needed

## Debug Tips if Line Persists

1. Check for inherited borders from parent containers
2. Check DaisyUI version and known issues
3. Try `border: none !important` temporarily to isolate
4. Check for box-shadow creating line appearance
5. Inspect ::before and ::after pseudo-elements
6. Check for hr or border elements nearby
