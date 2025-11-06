---
name: Remove Tooltips and Info Icons from Global Configuration
issue: TBD
state: complete
version: 1
---

## Goal

Remove all tooltips and info icons from the Global Configuration dialog toggles to simplify the UI and eliminate scrollbar issues.

## Tasks

### 1. Remove Tooltip and Info Icon Props
- Remove `tooltip` prop from "Reset camera when map layout changes" toggle
- Remove `showInfoIcon` prop from "Reset camera when map layout changes" toggle
- Remove `tooltip` prop from "Enable Experimental Features" toggle
- Remove `showInfoIcon` prop from "Enable Experimental Features" toggle

### 2. Remove Overflow-x-hidden
- Remove `overflow-x-hidden` class from modal-box
- No longer needed without tooltips

### 3. Verify Changes
- Build succeeds
- All tests pass
- UI is clean without info icons

## Steps

- [x] Complete Task 1: Remove tooltip and info icon props
- [x] Complete Task 2: Remove overflow-x-hidden class
- [x] Complete Task 3: Build and test verification

## Review Feedback Addressed

User feedback: "okay i dont like this anymore remove the tooltip entirely with the little i icon"

## Implementation Summary

Successfully removed all tooltips and info icons from the Global Configuration dialog:

### Changes Made:

**1. GlobalConfigurationDialog Template** (globalConfigurationDialog.component.html)

Removed tooltip and showInfoIcon props from two toggles:

```html
<!-- Before -->
<cc-setting-toggle
    [checked]="resetCameraIfNewFileIsLoaded()"
    [label]="'Reset camera when map layout changes'"
    [tooltip]="'The camera is reset...'"
    [showInfoIcon]="true"
    (checkedChange)="handleResetCameraIfNewFileIsLoadedChanged($event)"
/>

<!-- After -->
<cc-setting-toggle
    [checked]="resetCameraIfNewFileIsLoaded()"
    [label]="'Reset camera when map layout changes'"
    (checkedChange)="handleResetCameraIfNewFileIsLoadedChanged($event)"
/>
```

Same change for "Enable Experimental Features" toggle.

**2. Removed overflow-x-hidden** (globalConfigurationDialog.component.html:2)

```html
<!-- Before -->
<div class="modal-box max-w-2xl overflow-x-hidden">

<!-- After -->
<div class="modal-box max-w-2xl">
```

### Results:

✅ **No tooltips** - All tooltip props removed
✅ **No info icons** - All showInfoIcon props removed
✅ **No scrollbar** - Modal displays cleanly without overflow
✅ **Build succeeds** - No compilation errors
✅ **All tests pass** - 330 test suites, 1669 tests passing
✅ **Simplified UI** - Cleaner, more straightforward interface

### Components Affected:

- **SettingToggle component** - Still supports tooltips and info icons, just not used in this dialog
- **GlobalConfigurationDialog** - Now uses simple toggle labels only
- No component code changes needed, only template prop removal

### Benefits:

- Cleaner, simpler UI
- No scrollbar issues
- Faster rendering without tooltip positioning calculations
- More straightforward user experience
- Toggle labels are self-explanatory without needing tooltips
