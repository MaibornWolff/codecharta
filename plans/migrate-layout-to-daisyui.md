---
name: Migrate Layout to DaisyUI
issue: #4368
state: todo
version: 1.0
---

## Goal

Migrate the main layout components (ToolBar, RibbonBar, and CodeMap) to use DaisyUI styling with Angular signals for a modern, zoneless architecture.

## Tasks

### 1. Migrate ToolBar component
- Convert observables to signals
- Replace SCSS with Tailwind/DaisyUI utility classes
- Remove `toolBar.component.scss`

### 2. Migrate RibbonBar component
- Convert observables to signals
- Replace MatCard with DaisyUI card div
- Replace SCSS with Tailwind/DaisyUI utility classes
- Remove `ribbonBar.component.scss`

### 3. Migrate RibbonBarPanel component
- Replace MatCard styling with DaisyUI card classes
- Replace SCSS with Tailwind/DaisyUI utility classes
- Remove `ribbonBarPanel.component.scss`

### 4. Migrate CodeMap component
- Convert observables to signals
- Replace hardcoded positioning with responsive layout
- Remove `codeMap.component.scss`

### 5. Update related panel components
- Migrate any remaining SCSS in RibbonBarPanelSettings and RibbonBarMenuButton

### 6. Test and verify
- Test layout responsiveness and growth behavior
- Verify all SCSS files are removed
- Run tests and update snapshots

## Steps

- [ ] Migrate ToolBar component
- [ ] Migrate RibbonBar component
- [ ] Migrate RibbonBarPanel component
- [ ] Migrate CodeMap component
- [ ] Update related panel components
- [ ] Test layout and verify SCSS removal
- [ ] Run all tests and update snapshots

## Review Feedback Addressed

None yet - initial plan

## Notes

- Layout should grow correctly with content (ToolBar, RibbonBar, and CodeMap positioning)
- Use Tailwind theme colors instead of hardcoded values
- All reactivity via signals for zoneless architecture
