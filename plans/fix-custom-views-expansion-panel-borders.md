---
name: Fix Custom Views expansion panel borders and migrate to DaisyUI
issue: #4293
state: complete
version: N/A
---

## Goal

Migrate the Custom Views dialog from Angular Material to DaisyUI components while fixing the border-radius issue and maintaining all existing functionality.

## Tasks

### 1. Replace Angular Material components with DaisyUI in customConfigList
- [x] Replace `<mat-toolbar>` with custom styled header using `bg-primary`
- [x] Replace `<mat-form-field>` with DaisyUI `input input-bordered`
- [x] Remove Material accordion wrapper components
- [x] Remove all Material imports from TypeScript file

### 2. Replace Angular Material accordion with DaisyUI collapse in customConfigItemGroup
- [x] Replace `<mat-expansion-panel>` with DaisyUI `<div class="collapse collapse-arrow">`
- [x] Change to checkbox-based expansion control
- [x] Replace `<mat-list>` with Tailwind flexbox layout
- [x] Keep `@Input()` decorator approach (not signals) to avoid infinite loop
- [x] Remove Material expansion panel imports
- [x] Keep `MatDialogClose` for mat-dialog-close directive

### 3. Update SCSS styling
- [x] Remove Material variable dependencies from component SCSS files
- [x] Add `.collapse { border-radius: 0; }` to remove rounded borders
- [x] Create custom toolbar class with `background-color: #1b9cfc`
- [x] Set Material dialog container color to `#1b9cfc` in matCustomConfigList.scss

### 4. Update tests to work with DaisyUI components
- [x] Replace Material element selectors with DaisyUI/Tailwind class selectors
- [x] Change button click tests to checkbox click tests for accordion expansion
- [x] Update element queries from `mat-expansion-panel-header` to `.collapse-title`
- [x] Update element queries from `mat-list-item` to `.border-b.border-black.py-2`

### 5. Verify everything works correctly
- [x] Clear Angular build cache to ensure fresh build
- [x] Test visual appearance in the Custom Views dialog
- [x] Run all unit tests (350 test suites, 1868 tests passed)
- [x] Build for production successfully

## Steps

- [x] Complete Task 1: Migrate customConfigList to DaisyUI
- [x] Complete Task 2: Migrate customConfigItemGroup to DaisyUI
- [x] Complete Task 3: Update SCSS styling
- [x] Complete Task 4: Update tests
- [x] Complete Task 5: Verify and test

## Review Feedback Addressed

- User requested to use only DaisyUI components, not mix with Material
- User requested to revert to original @Input() approach after signals caused infinite loop
- User requested toolbar color to be #1b9cfc instead of default purple
- User requested to move Material overrides from tailwind.css to Material SCSS files

## Notes

### Implementation Details
- Replaced all Angular Material components with DaisyUI equivalents
- Used `@Input()` decorators instead of signals to avoid infinite loop in effect()
- DaisyUI collapse components work independently without wrapper
- Dialog container background color set in `matCustomConfigList.scss` for proper organization
- Toolbar uses custom class `.custom-config-toolbar` with explicit `#1b9cfc` background

### Files Modified
- `customConfigList.component.html` - Converted to DaisyUI
- `customConfigList.component.ts` - Removed Material imports
- `customConfigList.component.scss` - Added custom toolbar styling
- `customConfigItemGroup.component.html` - Converted to DaisyUI collapse
- `customConfigItemGroup.component.ts` - Kept @Input() approach
- `customConfigItemGroup.component.scss` - Removed Material dependencies, added border-radius override
- `matCustomConfigList.scss` - Added dialog container color override
- `customConfigList.component.spec.ts` - Updated test selectors
- `customConfigItemGroup.component.spec.ts` - Updated test selectors

### Test Results
- All 350 test suites passed
- 1868 tests passed (6 todo)
- Production build successful
- No TypeScript or SCSS errors
