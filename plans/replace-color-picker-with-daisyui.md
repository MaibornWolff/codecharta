---
name: Migrate Color Picker to DaisyUI
issue: #4291
state: complete
version: 1.0
---

## Goal

Rebuild the labelled color picker component using modern DaisyUI styling and Angular signals, providing proper spacing and consistent design.

## Background

The color picker component displays a color swatch with label, used throughout the application (legend panel, color settings panel). Currently has no margin between instances, causing cramped appearance.

## Current Implementation

- **Component**: `app/codeCharta/ui/labelledColorPicker/`
- **Technology**: Angular standalone component with custom SCSS
- **Features**: Color swatch, hover effect (paint brush icon), label with RTL text handling
- **Issues**: No margin-bottom, causing tight spacing between pickers

## New Implementation Requirements

### Technology Stack
- Angular 20 standalone component
- Angular signals for reactive state
- DaisyUI components and utilities
- Tailwind CSS v4 utility classes

### Styling Requirements
- Use DaisyUI's color utilities and spacing
- Apply proper margins (`mb-2` or `mb-4`)
- Modern, accessible color picker trigger
- Maintain hover effects with DaisyUI transitions
- Use DaisyUI's border utilities

### Component Features
- Color swatch display with border
- Hover state showing paint brush icon
- Label with proper text overflow handling
- RTL text support (preserve existing logic)
- Click to open color picker popup

### Component Structure
```typescript
- labelledColorPicker.component.ts (with signals)
- labelledColorPicker.component.html (DaisyUI markup)
- labelledColorPicker.component.scss (minimal utilities)
- labelledColorPicker.component.spec.ts (tests)
```

## Tasks

### 1. Design new DaisyUI-based color picker
- Review DaisyUI button, badge components for trigger design
- Design clean color swatch with DaisyUI borders
- Plan hover states using DaisyUI opacity/transition utilities
- Ensure WCAG color contrast compliance

### 2. Create new implementation with signals
- Build fresh component alongside existing one
- Use signals for hover state management
- Use DaisyUI classes: `btn`, `badge`, `border`, `rounded`, spacing
- Implement proper margin-bottom spacing
- Preserve RTL label functionality

### 3. Test new component
- Unit tests for hover states
- Test color change events
- Verify label truncation and RTL handling
- Test in legend panel and color settings contexts

### 4. Replace old implementation
- Update all usages to new component
- Remove old component files
- Update integration tests

## Success Criteria

- [ ] Color pickers use DaisyUI styling
- [ ] Proper spacing (8px) between color pickers
- [ ] Hover effect works smoothly
- [ ] Paint brush icon appears on hover
- [ ] Labels display and truncate correctly
- [ ] RTL text handling works
- [ ] Color picker popup opens correctly
- [ ] All tests pass
- [ ] No visual regressions

## Files to Create/Modify

- `app/codeCharta/ui/labelledColorPicker/` (rebuild with signals)
- `app/codeCharta/ui/colorPickerForMapColor/` (update if needed)
- `app/codeCharta/ui/legendPanel/legendPanel.component.html` (update references)
- `app/codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.component.html` (update references)

## Notes

- Use Angular signals for reactive hover state
- Keep RTL label logic from original
- DaisyUI transition utilities for smooth hover
- Maintain accessibility (ARIA labels, keyboard support)
- Test with various label lengths
