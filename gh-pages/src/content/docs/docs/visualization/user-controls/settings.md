---
title: "Settings"
---

The **Settings** dialog, titled **Global Configuration**, holds application-wide preferences that affect how the map is laid out and rendered, independent of which file is loaded. Open it from the **Settings** entry in the top-right navigation. Unlike per-map metric controls, the options here are remembered across sessions and apply to whatever map you view next.

![Global Configuration dialog](/assets/images/docs/visualization/user-controls/settings.jpeg)

## Map Layout

The **Map Layout** dropdown selects the algorithm used to arrange the buildings of the treemap. The available options are:

- **Squarified TreeMap** – the default, traditional treemap layout that packs buildings into rectangles with aspect ratios close to squares for easy comparison.
- **StreetMap** – a street-like layout that places buildings along paths, mirroring the folder hierarchy as a network of streets.
- **TreeMapStreet** – a hybrid layout that combines the treemap and street approaches.

When **TreeMapStreet** is selected, an additional **Maximum TreeMap Files** control appears (a slider plus a number input, range 1–1000) that limits how many files are rendered as a treemap before the street layout takes over.

## Display and behavior options

Each of the following toggles switches a single global preference on or off:

- **Hide Flattened Buildings** – when enabled, buildings that have been flattened (for example via the search/filter "hide" action) are removed from view instead of being shown as flattened, low blocks.
- **Reset camera when map layout changes** – when enabled, the camera position is reset to its default view whenever the map layout changes (for example after loading a new file). Disable it to keep your current camera angle and zoom.
- **White Background** – switches the 3D scene background between the default dark background and a white background. The white background is useful for screenshots and printing.
- **Enable Experimental Features** – turns on features that are still in development and not yet considered stable. Leave this off for normal use unless you specifically want to try out unreleased functionality.
- **Screenshot to clipboard** – sets the default destination for screenshots taken from the map. When enabled, the screenshot action copies the image to the clipboard; when disabled, it saves the image to a file. (Both destinations remain reachable via their respective screenshot hotkeys; this toggle only controls the default. Copying to the clipboard is not supported in Firefox.)

## Resetting

The dialog provides two reset buttons with different scopes:

- **Reset global settings** – restores only the global preferences in this dialog (map layout, maximum treemap files, hide flattened buildings, white background, and reset-camera behavior) to their defaults. The loaded map and selected metrics are left untouched.
- **Reset map to default** – performs a full reset: uploaded maps, selected metrics, and settings are all returned to their defaults. Because this is destructive, it first asks for confirmation ("Confirm reset map to default") before clearing your current session.

## External links

At the bottom of the dialog are quick links to the project's **Website**, **Documentation**, and **GitHub** repository, which open in a new tab. Use the **Close** button to dismiss the dialog.
