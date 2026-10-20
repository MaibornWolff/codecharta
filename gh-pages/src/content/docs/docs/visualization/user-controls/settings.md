---
title: "Settings"
description: "Set the global preferences of the CodeCharta Web Studio, such as background and screenshot target, and reset filters, settings or the whole session."
---

The **Global Configuration** dialog holds the preferences that apply to every map you open. Open it with **Settings** at
the right end of the top bar. The Web Studio remembers these choices across sessions.

![The Global Configuration dialog with four toggles, three reset buttons and links](/assets/images/docs/visualization/user-controls/settings.jpeg)

## Display and behavior

- **Hide Flattened Buildings**: removes buildings that are flattened, for example by a **Flatten** rule in the
  [Explorer](/docs/visualization/user-controls/explorer), instead of drawing them as low gray blocks.
- **Reset camera when map layout changes**: fits the camera to the map whenever it is laid out anew, for example
  after you change the layout or load other maps. Switch it off to keep your camera angle and zoom. On by default.
- **White Background**: switches the map background to white, which suits screenshots and printing.
- **Screenshot to clipboard**: makes the **Screenshot** tool copy the picture instead of saving it as a file. The
  [keyboard shortcuts](/docs/visualization/user-controls/keyboard-shortcuts) reach both targets either way. Firefox
  does not support copying screenshots to the clipboard.

## Resetting

- **Reset global settings**: restores the toggles above, plus the map layout and **Maximum TreeMap Files** of the
  [layouts](/docs/visualization/user-controls/layouts). Maps and metrics stay as they are.
- **Reset filters**: removes every flatten and exclude rule after a confirmation, so every file comes back onto the
  map. Metrics, colors and the camera stay as they are. Disabled while there are no rules.
- **Reset map to default**: resets the loaded maps, the selected metrics and all settings, after the confirmation
  **Confirm reset map to default**.

## Links

The links at the bottom open the **Website**, the **Documentation** and the **Github** repository in a new tab.
**Close** closes the dialog.
