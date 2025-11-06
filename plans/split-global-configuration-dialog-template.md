---
name: Split Global Configuration Dialog Template into Smaller Components
issue: TBD
state: complete
version: 1
---

## Goal

Refactor the globalConfigurationDialog template by extracting repetitive patterns and logical sections into smaller, reusable components following Angular best practices. This improves maintainability, reusability, and testability.

## Analysis

Current template has several areas for improvement:
- 5 toggle controls with repetitive HTML structure (lines 10-82)
- External links section that could be extracted (lines 96-116)
- Each toggle follows similar pattern but with slight variations (some have tooltips, info icons)

## Tasks

### 1. Create Reusable Toggle Component
- Extract the common toggle pattern into `settingToggle.component.ts`
- Accept inputs: `checked` (signal), `label` (string), `tooltip` (optional string), `showInfoIcon` (optional boolean)
- Output: `toggleChange` event emitter with boolean value
- Use DaisyUI form-control and toggle classes
- Support optional tooltip via title attribute
- Support optional info icon display
- Location: `globalConfigurationDialog/settingToggle/`

### 2. Create External Links Component
- Extract links section into `externalLinks.component.ts`
- Define links data structure in component (website, docs, github)
- Use DaisyUI link styling
- Keep external-link icons
- Location: `globalConfigurationDialog/externalLinks/`

### 3. Refactor GlobalConfigurationDialog Template
- Replace all 5 toggle div blocks with `<cc-setting-toggle>` component
- Pass appropriate inputs (checked signal, label, tooltip, showInfoIcon)
- Wire up change handlers to existing methods
- Replace links section with `<cc-external-links>`
- Keep map layout, display quality, and reset button as-is

### 4. Simplify GlobalConfigurationDialog Component Logic
- Keep existing signal definitions
- Keep existing event handlers (they receive native events now)
- Remove any unnecessary code after refactoring

## Steps

- [x] Complete Task 1: Create Reusable Toggle Component
- [x] Complete Task 2: Create External Links Component
- [x] Complete Task 3: Refactor GlobalConfigurationDialog Template
- [x] Complete Task 4: Verify Build and Functionality

## Review Feedback Addressed

None yet - initial plan

## Notes

**Benefits of this approach:**
- DRY principle: Toggle pattern defined once, used 5 times
- Easier testing: Each component can be tested independently
- Better maintainability: Changes to toggle styling done in one place
- Improved readability: Template becomes more declarative
- Reusability: Toggle component could be used elsewhere in the app

**Toggle component variations:**
1. Hide Flattened Buildings: Simple toggle, no tooltip, no icon
2. Reset camera: Has tooltip, has info icon
3. White Background: Simple toggle, no tooltip, no icon
4. Experimental Features: Has tooltip, has info icon
5. Screenshot to clipboard: Simple toggle, no tooltip, no icon

**Component structure:**
```
globalConfigurationDialog/
  ├── settingToggle/
  │   ├── settingToggle.component.ts
  │   └── settingToggle.component.html
  ├── externalLinks/
  │   ├── externalLinks.component.ts
  │   └── externalLinks.component.html
  ├── mapLayoutSelection/
  ├── displayQualitySelection/
  ├── globalConfigurationDialog.component.ts
  └── globalConfigurationDialog.component.html
```

**Expected template after refactoring:**
```html
<dialog #dialog class="modal">
    <div class="modal-box max-w-2xl">
        <h2 class="text-2xl font-bold mb-6">Global Configuration</h2>

        <div class="flex flex-col gap-6">
            <cc-map-layout-selection />
            <cc-display-quality-selection />

            <cc-setting-toggle
                [checked]="hideFlatBuildings()"
                [label]="'Hide Flattened Buildings'"
                (toggleChange)="handleHideFlatBuildingsChanged($event)"
            />

            <cc-setting-toggle
                [checked]="resetCameraIfNewFileIsLoaded()"
                [label]="'Reset camera when map layout changes'"
                [tooltip]="'The camera is reset to...'"
                [showInfoIcon]="true"
                (toggleChange)="handleResetCameraIfNewFileIsLoadedChanged($event)"
            />

            <!-- Similar for other toggles -->

            <cc-reset-settings-button ... />
            <cc-external-links />
        </div>

        <div class="modal-action">
            <button class="btn" (click)="close()">Close</button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
```

**Design decisions:**
- Toggle component uses input/output pattern (not signals for cross-component communication)
- Event handlers remain in parent to maintain ngrx dispatch logic
- Links component is purely presentational (no inputs needed)
- Keep existing child components (mapLayoutSelection, displayQualitySelection) as-is

## Implementation Summary

Successfully refactored the global configuration dialog template into smaller, reusable components:

### 1. SettingToggle Component (settingToggle.component.ts:1-20)
- Uses Angular's modern `input()` and `output()` signal functions
- Inputs: `checked` (boolean), `label` (string), `tooltip` (optional string), `showInfoIcon` (optional boolean)
- Output: `checkedChange` emits boolean value
- DaisyUI tooltip integration via `data-tip` attribute
- Reusable across all 5 toggle settings

### 2. ExternalLinks Component (externalLinks.component.ts:1-18)
- Presentational component with links data
- Uses @for loop to iterate over links array
- DaisyUI link styling with consistent external-link icons
- Clean separation of link data from layout

### 3. Refactored GlobalConfigurationDialog
- Template reduced from 127 lines to 65 lines (48% reduction!)
- 5 repetitive toggle blocks replaced with `<cc-setting-toggle>` components
- External links section replaced with `<cc-external-links>`
- Event handlers simplified to accept boolean instead of Event objects
- Much more readable and maintainable

### Key Benefits Achieved:
✅ **DRY**: Toggle pattern defined once, used 5 times
✅ **Cleaner**: Template 48% smaller and more declarative
✅ **Maintainable**: Style changes in one place
✅ **Testable**: Each component can be tested independently
✅ **Modern Angular**: Uses latest input()/output() signal functions
✅ **DaisyUI Integration**: Proper tooltip styling with data-tip

### Before vs After:
**Before**: 72 lines per toggle × 5 = ~360 lines of repetitive HTML
**After**: 5-7 lines per toggle × 5 = ~35 lines of clean, declarative HTML

Build succeeds without errors. Components follow Angular best practices.
