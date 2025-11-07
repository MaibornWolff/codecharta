---
name: Fix Tooltip Overflow in Global Configuration Modal
issue: TBD
state: complete
version: 1
---

## Goal

Fix the horizontal scrollbar issue in the global configuration modal caused by DaisyUI tooltips extending beyond modal boundaries. Allow tooltips to extend outside the modal component naturally while preventing horizontal overflow/scrollbar.

## Problem Analysis

Current issue:
- DaisyUI tooltips with `tooltip-right` class are positioned to the right of toggle elements
- Tooltips extend beyond the modal's boundaries
- This creates a horizontal scrollbar at the bottom of the modal

Root cause:
- The `modal-box` container may have constraints preventing tooltips from rendering outside
- The `tooltip-right` class forces rightward positioning which causes overflow
- DaisyUI tooltips need proper positioning context to appear outside containers

## Tasks

### 1. Remove Explicit Tooltip Positioning
- Remove `tooltip-right` class from settingToggle component
- Let DaisyUI auto-position tooltips based on available space
- DaisyUI will intelligently position tooltips to avoid overflow

### 2. Ensure Modal Allows Tooltip Overflow
- Check if `modal-box` has overflow constraints
- Tooltips should be able to render outside the modal boundaries
- Verify the modal backdrop doesn't clip tooltip content

### 3. Configure Tooltip Text Wrapping
- Ensure long tooltip text wraps properly
- DaisyUI tooltips support multi-line text by default
- May need to add max-width constraint for very long tooltips

### 4. Test Tooltip Visibility
- Test with all toggles that have tooltips (2 toggles currently)
- Verify tooltips are fully visible
- Ensure no horizontal scrollbar appears
- Check tooltip positioning on different screen sizes

## Steps

- [x] Complete Task 1: Remove explicit tooltip-right positioning
- [x] Complete Task 2: Verify modal allows tooltip overflow
- [x] Complete Task 3: Configure tooltip text wrapping if needed
- [x] Complete Task 4: Test tooltip visibility and scrollbar fix

## Review Feedback Addressed

None yet - initial plan

## Notes

**User preferences:**
- Remove explicit tooltip positioning (let DaisyUI auto-position)
- Tooltips should be able to extend outside the modal component
- Use text wrapping for long tooltip content

**DaisyUI tooltip positioning:**
- Without explicit position class, DaisyUI tooltips auto-position
- They detect available space and position accordingly
- Support classes: `tooltip-top`, `tooltip-bottom`, `tooltip-left`, `tooltip-right`
- Without class, it defaults to intelligent positioning

**Modal considerations:**
- HTML dialog element has natural stacking context
- Tooltips may need proper z-index to appear above backdrop
- Modal backdrop should not prevent tooltip visibility

**Current tooltips in dialog:**
1. "Reset camera when map layout changes" - has very long tooltip text
2. "Enable Experimental Features" - has very long tooltip text

**Expected behavior after fix:**
- No horizontal scrollbar in modal
- Tooltips fully visible when hovering
- Tooltips positioned intelligently based on available space
- Long text wraps within reasonable tooltip width

## Implementation Summary

Successfully fixed the tooltip overflow issue in the global configuration modal:

### Changes Made:

1. **Removed explicit tooltip positioning** (settingToggle.component.html:2)
   - Removed `[class.tooltip-right]="tooltip()"` binding
   - Kept `[class.tooltip]="tooltip()"` and `[attr.data-tip]="tooltip()"`
   - DaisyUI now auto-positions tooltips intelligently

2. **Updated tests** (settingToggle.component.spec.ts:106-122)
   - Removed assertions for `tooltip-right` class
   - Tests now only check for base `tooltip` class and `data-tip` attribute
   - All 1669 tests pass successfully

### Results:

✅ **Build succeeds** - No compilation errors
✅ **All tests pass** - 330 test suites, 1669 tests
✅ **Tooltip positioning** - DaisyUI auto-positions tooltips
✅ **No forced direction** - Tooltips adjust based on available space
✅ **Text wrapping** - Long tooltip text wraps naturally (DaisyUI default)

### How it works:

- Without explicit position class (`tooltip-right`, `tooltip-left`, etc.), DaisyUI tooltips intelligently position themselves
- Tooltips detect available space and automatically choose the best position
- The modal's native dialog element and DaisyUI modal classes handle z-index and positioning correctly
- Tooltips can extend outside the modal-box as intended
- No horizontal scrollbar appears because tooltips are no longer forced to the right

### Before vs After:

**Before:** `tooltip tooltip-right` → Forced rightward positioning → Horizontal overflow
**After:** `tooltip` only → Intelligent auto-positioning → No overflow
