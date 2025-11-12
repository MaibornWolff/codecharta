---
name: Migrate Legend Block to DaisyUI
issue: #4291
state: complete
version: 1.0
---

## Goal

Rebuild the legend block component using modern DaisyUI styling and Angular best practices, fixing margin issues caused by Tailwind CSS preflight reset.

## Background

The legend panel displays metric information (Area, Height, Edge, Color) with custom blocks. Currently uses custom SCSS with margin issues due to Tailwind preflight removing default browser margins.

## Current Implementation

- **Component**: `app/codeCharta/ui/legendPanel/legendBlock/`
- **Technology**: Angular standalone component with custom SCSS
- **Issues**: Missing margins between blocks due to Tailwind reset

## New Implementation Requirements

### Technology Stack
- Angular 20 standalone component
- DaisyUI components and utilities
- Tailwind CSS v4 utility classes
- Angular signals (if state management needed)

### Styling Requirements
- Use DaisyUI's card or similar component as base
- Apply Tailwind utilities via `@apply` directive in SCSS
- Ensure proper spacing using DaisyUI spacing scale (`mb-2`, `mb-4`, etc.)
- Maintain existing functionality (links, tooltips, external link icon)

### Component Structure
```typescript
- legendBlock.component.ts (with signals if needed)
- legendBlock.component.html (DaisyUI markup)
- legendBlock.component.scss (minimal, mostly @apply)
- legendBlock.component.spec.ts (tests)
```

## Tasks

### 1. Design new DaisyUI-based legend block
- Review DaisyUI card, badge, or alert components for inspiration
- Design clean, modern layout using DaisyUI utilities
- Ensure accessibility (ARIA labels, keyboard navigation)

### 2. Create new implementation
- Build fresh component alongside existing one
- Use DaisyUI classes: `card`, `badge`, `text-sm`, spacing utilities
- Implement with proper TypeScript types and signals if beneficial
- Add proper margins using `mb-2` or `mb-4`

### 3. Test new component
- Unit tests for all functionality
- Visual testing in both normal and delta states
- Verify spacing and responsiveness

### 4. Replace old implementation
- Update `legendPanel.component.html` to use new component
- Remove old component files
- Update any related tests

## Success Criteria

- [ ] Legend blocks use DaisyUI styling
- [ ] Proper spacing between all blocks
- [ ] No unwanted margin before `<hr>` separators
- [ ] External links work correctly
- [ ] Tooltips display properly
- [ ] Works in both normal and delta state views
- [ ] All tests pass
- [ ] No visual regressions

## Files to Create/Modify

- `app/codeCharta/ui/legendPanel/legendBlock/` (rebuild)
- `app/codeCharta/ui/legendPanel/legendPanel.component.html` (update references)

## Notes

- Keep changes focused on this component only
- Follow Angular style guide
- Use DaisyUI semantic class names
- Minimal custom CSS, prefer utilities
