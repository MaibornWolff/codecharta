---
name: Replace Material Slider with DaisyUI in Global Configuration Dialog
issue: TBD
state: complete
version: 1
---

## Goal

Replace the Material Design slider (cc-slider) in the Map Layout Selection component with a DaisyUI native range input to complete the migration of the Global Configuration dialog to DaisyUI.

## Problem Analysis

**Current State:**
- `mapLayoutSelection.component.html` uses `<cc-slider>` for "Maximum TreeMap Files" setting
- `cc-slider` component uses Material Design components:
  - `MatSlider`, `MatSliderThumb` (slider itself)
  - `MatFormField`, `MatInput` (number input field)
  - `MatLabel` (label)
- This is the last Material Design component remaining in the Global Configuration dialog

**Why Not Replace cc-slider Globally:**
- cc-slider is used in 8+ files across the application:
  - heightSettingsPanel
  - edgeSettingsPanel
  - areaSettingsPanel
  - Other parts of the ribbon bar
- Replacing it globally would be a much larger change outside the scope of this task
- We should only modernize the Global Configuration dialog for now

## Components Status

### ✅ Already DaisyUI-Compliant:
1. **globalConfigurationButton** - DaisyUI button, native dialog
2. **globalConfigurationDialog** - Native HTML dialog element with DaisyUI modal classes
3. **displayQualitySelection** - Native select with DaisyUI classes
4. **mapLayoutSelection** - Select dropdown is DaisyUI (only slider needs fixing)
5. **settingToggle** - DaisyUI form-control and toggle
6. **externalLinks** - DaisyUI link styling

### ⚠️ Needs Update:
1. **mapLayoutSelection slider** - Currently uses Material cc-slider component

### ℹ️ Shared Components (Leave As-Is):
1. **resetSettingsButton** - Shared component used throughout the app
   - Uses custom SCSS styling
   - Has no Material dependencies
   - Updating it would affect other parts of the application
   - Should be left alone for now to avoid scope creep

## Tasks

### 1. Replace cc-slider with DaisyUI Range Input in mapLayoutSelection

**Goal:** Replace the Material slider with DaisyUI's native range input

**Changes needed:**
- Remove `SliderComponent` import from mapLayoutSelection.component.ts
- Replace `<cc-slider>` in mapLayoutSelection.component.html with DaisyUI range input
- Use native `<input type="range">` with DaisyUI classes
- Add a number input for direct value entry (optional but nice-to-have)

**DaisyUI Range Input Structure:**
```html
<div class="form-control w-full">
    <label class="label">
        <span class="label-text">Maximum TreeMap Files</span>
    </label>
    <input
        type="range"
        min="1"
        max="1000"
        [value]="maxTreeMapFiles()"
        (input)="handleChangeMaxTreeMapFiles($event)"
        class="range range-primary"
    />
    <div class="flex justify-between text-xs px-2">
        <span>1</span>
        <span>1000</span>
    </div>
</div>
```

**Optional Enhancement:**
- Add a number input next to the range slider for precise value entry
- This matches the original cc-slider behavior which had both slider and input

### 2. Update Event Handler Signature

**Goal:** Update handler to work with native input events instead of cc-slider callback

**Current:**
```typescript
handleChangeMaxTreeMapFiles = debounce((maxTreeMapFiles: number) => {
    this.store.dispatch(setMaxTreeMapFiles({ value: maxTreeMapFiles }))
}, 400)
```

**New (if needed):**
```typescript
handleChangeMaxTreeMapFiles = debounce((event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    this.store.dispatch(setMaxTreeMapFiles({ value }))
}, 400)
```

OR keep the current signature and wrap it:
```typescript
handleMaxTreeMapFilesInput(event: Event) {
    const value = Number((event.target as HTMLInputElement).value)
    this.handleChangeMaxTreeMapFiles(value)
}
```

### 3. Update Tests

**Goal:** Update mapLayoutSelection tests to work with native range input

**Changes:**
- Remove expectations for cc-slider component
- Use `screen.getByRole("slider")` to query the range input
- Update value setting/reading to use native input properties

### 4. Verify No Material Imports Remain

**Goal:** Ensure no Material Design imports remain in globalConfigurationDialog

**Check:**
- Run grep for `@angular/material` in globalConfigurationDialog directory
- Verify mapLayoutSelection.component.ts has no Material imports
- Confirm all tests pass

## Steps

- [ ] Complete Task 1: Replace cc-slider with DaisyUI range input
- [ ] Complete Task 2: Update event handler for native input events
- [ ] Complete Task 3: Update and run tests
- [ ] Complete Task 4: Verify no Material imports remain

## Questions for User

1. **Range Input Enhancement:** Should we add a number input field next to the range slider for precise value entry (matching original cc-slider behavior), or just use the range slider alone?

2. **Value Display:** Should we display the current value somewhere (e.g., next to the label or below the slider)?

3. **resetSettingsButton:** This is a shared component used throughout the app. Should we leave it as-is, or also update it to use DaisyUI button styling? (Note: updating it would affect other parts of the application outside the Global Configuration dialog)

## Expected Outcome

After completing this plan:
- ✅ Global Configuration dialog fully DaisyUI-compliant
- ✅ No Material Design components in the dialog
- ✅ Consistent styling with rest of the dialog
- ✅ All tests passing
- ✅ Build succeeds
