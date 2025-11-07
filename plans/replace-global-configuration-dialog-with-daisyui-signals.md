---
name: Replace Global Configuration Dialog with DaisyUI and Signals
issue: TBD
state: complete
version: 1
---

## Goal

Build a fresh, modern Global Configuration dialog using DaisyUI styling and Angular signals, following Angular and DaisyUI best practices. Once working, replace the old Material Design implementation.

## Tasks

### 1. Create New GlobalConfigurationButton Component
- Build with signals from the ground up
- Use signal for controlling dialog open/close state
- Style button with DaisyUI classes (btn)
- Keep cc-action-icon for consistency
- Use modern Angular patterns (no observables)

### 2. Create New GlobalConfigurationDialog Component
- Use native HTML `<dialog>` element with DaisyUI styling
- Convert all store selectors to signals using toSignal()
- Use DaisyUI toggle components for all switches
- Use DaisyUI form controls and layout utilities
- Handle open/close via signals passed from parent
- Dispatch ngrx actions directly (store integration stays the same)

### 3. Create New Child Components with Signals
- Build mapLayoutSelection fresh with native select + DaisyUI styling
- Build displayQualitySelection fresh with native select + DaisyUI styling
- Use toSignal() for all store data
- Use Tailwind utilities for layout
- Keep existing slider component for maxTreeMapFiles

### 4. Apply DaisyUI Styling Throughout
- Use dialog, modal-box classes for dialog structure
- Use toggle class for switches
- Use select, select-bordered for dropdowns
- Use btn classes for buttons
- Use Tailwind flex, gap, etc. for layout
- Apply CodeCharta custom theme colors from tailwind.css

### 5. Integrate and Test New Implementation
- Wire up new button to open new dialog
- Test all toggles dispatch correct actions
- Verify dropdowns and slider work
- Test reset settings button integration
- Check external links
- Ensure dialog backdrop and ESC key work

### 6. Replace Old Implementation
- Update imports in parent components to use new components
- Remove old Material-based components and files
- Clean up any unused Material imports
- Remove SCSS files if no longer needed

## Steps

- [x] Complete Task 1: Create New GlobalConfigurationButton Component
- [x] Complete Task 2: Create New GlobalConfigurationDialog Component
- [x] Complete Task 3: Create New Child Components with Signals
- [x] Complete Task 4: Apply DaisyUI Styling Throughout
- [x] Complete Task 5: Integrate and Test New Implementation
- [x] Complete Task 6: Replace Old Implementation and Clean Up

## Review Feedback Addressed

None yet - initial plan

## Notes

- Build fresh, don't try to convert line-by-line
- Use Angular and DaisyUI patterns, not Material patterns
- All store interactions remain the same (ngrx actions/selectors)
- Signal-based, no observables or AsyncPipe
- Native dialog element with proper accessibility
- CodeCharta theme from tailwind.css applies automatically

## Implementation Summary

Successfully replaced all Global Configuration components with modern DaisyUI and signals implementation:

1. **GlobalConfigurationButton** (`globalConfigurationButton.component.ts`):
   - Removed MatDialog dependency
   - Uses viewChild to reference dialog component
   - Styled with DaisyUI btn classes
   - Clean, signal-based architecture

2. **GlobalConfigurationDialog** (`globalConfigurationDialog.component.ts`):
   - Native HTML `<dialog>` element with DaisyUI modal styling
   - All store selectors converted to signals using toSignal()
   - DaisyUI toggles replace Material slide-toggles
   - Native input change events instead of Material-specific events
   - Dialog controlled via .showModal() and .close() methods
   - Maintains all existing ngrx state interactions

3. **MapLayoutSelection** (`mapLayoutSelection.component.ts`):
   - Converted to signals with toSignal()
   - Native `<select>` with DaisyUI styling (select, select-bordered)
   - Computed signal for conditional slider display
   - Native change events with proper type casting

4. **DisplayQualitySelection** (`displayQualitySelection.component.ts`):
   - Converted to signals with toSignal()
   - Native `<select>` with DaisyUI styling
   - Clean, minimal implementation

All Material Design dependencies removed from these components. Build succeeds without errors.
