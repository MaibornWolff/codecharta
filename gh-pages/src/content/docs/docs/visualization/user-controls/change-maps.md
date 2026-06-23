---
title: "Change Maps"
---

The map selector in the top toolbar lets you choose which of the currently-loaded maps are shown. Its button shows the name of the selected map (and a count like `+1` when more than one map is selected); clicking it opens a dropdown listing every loaded `.cc.json` file with a checkbox.

![Change Maps dropdown in the top toolbar](/assets/images/docs/visualization/user-controls/change-maps.jpeg)

## Selecting maps

- **Select one map** – check a single map to display it on its own (standard mode).
- **Select multiple maps** – check several maps to combine them into one view. When you have at least two maps loaded, you can switch to the delta view to compare them. See [Compare](/docs/visualization/user-controls/compare) for details on delta mode.

You can load multiple maps via the upload control by holding **Shift** when selecting files.

## Quick-select controls

The buttons at the top of the dropdown change the selection in one click:

- **All** – select every loaded map.
- **None** – clear the selection.
- **Invert** – flip the selection so currently selected maps become unselected and vice versa.

## Applying your changes

Changes you make in the dropdown are not applied immediately. Click **Apply** to update the displayed maps. The **Apply** button stays disabled until you have at least one map selected and your selection differs from what is currently shown. Closing the dropdown without clicking **Apply** discards your changes.

Each entry also has a trash icon to remove that map from the session; use the undo icon to restore it before applying.
