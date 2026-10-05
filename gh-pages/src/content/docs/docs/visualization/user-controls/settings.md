---
title: "Settings"
---

The **Settings** dialog, titled **Global Configuration**, holds application-wide preferences that affect how the map is rendered, independent of which file is loaded. Open it from **Settings** at the right end of the top bar. Unlike per-map metric controls, the options here are remembered across sessions and apply to whatever map you view next.

![Global Configuration dialog](/assets/images/docs/visualization/user-controls/settings.jpeg)

## Display and behavior options

Each of the following toggles switches a single global preference on or off:

- **Hide Flattened Buildings** – when enabled, buildings that have been flattened (for example via the search/filter "hide" action) are removed from view instead of being shown as flattened, low blocks.
- **Reset camera when map layout changes** – when enabled, the camera position is reset to its default view whenever the map layout changes (for example after loading a new file). Disable it to keep your current camera angle and zoom.
- **White Background** – switches the 3D scene background between the default dark background and a white background. The white background is useful for screenshots and printing.
- **Screenshot to clipboard** – sets the default destination for screenshots. When enabled, the screenshot action copies the image to the clipboard; when disabled, it saves the image to a file. (Both destinations remain reachable via their respective screenshot hotkeys; this toggle only controls the default. Copying to the clipboard is not supported in Firefox.)
- **Enable Dependency View (experimental)** – adds the **Dependencies** tab to the top bar for maps that carry dependency data. The view is still in development. See [Dependency View](/docs/visualization/user-controls/dependency-view).

## Resetting

The dialog provides three reset buttons with different scopes:

- **Reset global settings** – restores only the global preferences (hide flattened buildings, white background, reset-camera behavior, and the map layout and maximum treemap files chosen on the [metric bar](/docs/visualization/user-controls/metrics#layout)) to their defaults. The loaded map and selected metrics are left untouched.
- **Reset filters** – removes every flatten and exclude rule and leaves the rest of the map — metrics, colors, camera — as it is. It asks for confirmation first and is disabled while there are no rules.
- **Reset map to default** – performs a full reset: uploaded maps, selected metrics, and settings are all returned to their defaults. Because this is destructive, it first asks for confirmation ("Confirm reset map to default") before clearing your current session.

## External links

At the bottom of the dialog are quick links to the project's **Website**, **Documentation**, and **GitHub** repository, which open in a new tab. Use the **Close** button to dismiss the dialog.
