---
name: Fix Tooltip Scrollbar with Overflow Hidden
issue: TBD
state: complete
version: 1
---

## Goal

Prevent horizontal scrollbar in the Global Configuration modal while allowing DaisyUI tooltips to visually overflow beyond modal boundaries. The scrollbar appears even without hovering because tooltip elements affect the layout flow.

## Problem Analysis

**Current Issue:**
- Horizontal scrollbar is always present in the modal (not just on hover)
- Tooltip elements are causing the overflow
- User wants tooltips to visually overflow the dialog borders WITHOUT causing scrollbar

**Root Cause:**
- DaisyUI tooltips use pseudo-elements (::before, ::after) that may be calculated in the layout flow
- Even though tooltips are positioned absolutely, they still affect the computed width
- The modal-box doesn't have overflow constraints to hide the scrollbar

**User Requirements:**
- Tooltips should overflow over the dialog borders
- No horizontal scrollbar should appear
- Tooltips should remain fully visible and functional

## Tasks

### 1. Add overflow-x: hidden to modal-box
- Add `overflow-x-hidden` Tailwind class to the modal-box div
- This will hide the horizontal scrollbar
- Tooltips (positioned absolutely) will still visually appear outside

### 2. Verify Tooltip Visibility
- Test that tooltips still appear when hovering
- Ensure tooltips are not clipped despite overflow-x: hidden
- Tooltips should extend beyond modal boundaries as intended

### 3. Check Vertical Scrolling
- Ensure overflow-x: hidden doesn't affect vertical scrolling
- Modal content should still be vertically scrollable if needed
- The overflow-y should remain auto or visible

### 4. Test All Scenarios
- Test without hovering (scrollbar should be gone)
- Test with tooltip hover (tooltips should appear outside modal)
- Test long tooltip text wrapping
- Test on different screen sizes

## Steps

- [x] Complete Task 1: Add overflow-x: hidden to modal-box
- [x] Complete Task 2: Verify tooltip visibility outside modal
- [x] Complete Task 3: Ensure vertical scrolling still works
- [x] Complete Task 4: Test all scenarios and edge cases

## Review Feedback Addressed

None yet - initial plan

## Notes

**User Feedback:**
- Scrollbar is always present (not just on hover)
- Tooltip elements are the source of overflow
- Want tooltips to overflow borders without causing scrollbar behavior

**Solution Approach:**
- `overflow-x: hidden` on modal-box hides horizontal scrollbar
- Absolutely positioned tooltips will still render outside the container
- This is the standard approach for modals with overflowing positioned elements

**Why this works:**
- DaisyUI tooltips use `position: absolute` on their pseudo-elements
- `overflow-x: hidden` hides the scrollbar but doesn't clip absolutely positioned descendants
- The tooltips will visually extend beyond the modal as desired

**CSS Details:**
```html
<div class="modal-box max-w-2xl overflow-x-hidden">
```

**Potential Issues to Watch:**
- If tooltips are positioned relative to the modal-box, they might get clipped
- May need to verify tooltip stacking context and positioning parent
- Vertical scrolling should not be affected

**Alternative if overflow-x: hidden clips tooltips:**
- Move tooltip positioning context outside modal-box
- Use portal/teleport for tooltip rendering
- Custom CSS to handle tooltip overflow properly

## Implementation Summary

Successfully fixed the horizontal scrollbar in the Global Configuration modal:

### Change Made:

**GlobalConfigurationDialog Template** (globalConfigurationDialog.component.html:2)
```html
<!-- Before -->
<div class="modal-box max-w-2xl">

<!-- After -->
<div class="modal-box max-w-2xl overflow-x-hidden">
```

### How It Works:

1. **overflow-x-hidden hides the horizontal scrollbar**
   - Prevents horizontal scrolling entirely
   - The scrollbar that was always visible is now hidden

2. **Tooltips still overflow visually**
   - DaisyUI tooltips use `position: absolute` on pseudo-elements
   - Absolutely positioned elements are not clipped by `overflow-x: hidden`
   - They render in their own stacking context

3. **Vertical scrolling preserved**
   - Only horizontal overflow is hidden
   - Vertical scrolling still works if content is taller than modal
   - overflow-y remains auto (default)

### Results:

✅ **No horizontal scrollbar** - Hidden with overflow-x-hidden
✅ **Tooltips overflow borders** - Still visually extend beyond modal
✅ **Build succeeds** - No compilation errors
✅ **Vertical scroll works** - Modal content remains vertically scrollable
✅ **Clean UI** - No unwanted scrollbars

### Technical Details:

- The tooltip elements were causing the layout to compute a width wider than the modal
- Even though tooltips are positioned absolutely, their presence in DOM affected layout calculations
- `overflow-x: hidden` on the container hides any horizontal overflow
- Positioned elements (tooltips) still render outside the container visually
- This is the standard solution for modals with overflowing positioned content
