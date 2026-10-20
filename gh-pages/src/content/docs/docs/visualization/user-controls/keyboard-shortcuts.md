---
title: "Keyboard and mouse shortcuts"
description: "Every keyboard shortcut and mouse gesture of the CodeCharta Web Studio in one table, for the 3D code map, the word cloud and the dependency graph."
sidebar:
  label: "Shortcuts"
---

All keyboard shortcuts and mouse gestures of the Web Studio, by view. On macOS, Ctrl in the screenshot shortcuts is
the Control key and Alt is Option.

## Everywhere

| Shortcut                     | Action                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Ctrl+Alt+S                   | Save a screenshot of the current view as a file.                                           |
| Ctrl+Alt+F                   | Copy a screenshot of the current view to the clipboard (not in Firefox).                   |
| Escape                       | Close the open settings popover or dialog.                                                 |
| Drag the edge of the Explorer or Inspector | Resize it.                                                                   |
| Left / Right arrow on a focused edge | Resize the Explorer or Inspector in steps of 16 pixels.                            |
| Double-click the edge        | Restore the default width.                                                                 |
| Up / Down arrow, Enter       | Move through and pick an entry in a metric list.                                           |
| Arrow keys, Home, End        | Move the focused thumb of the color range slider by 1, or to its lower or upper end.       |

The screenshot shortcuts are the way to get an open [legend](/docs/visualization/user-controls/legend) into a
screenshot of the Metric view.

## Metric view: 3D layouts

| Shortcut                                  | Action                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Drag with the left mouse button           | Rotate the map.                                                          |
| Drag with the right mouse button          | Pan the map.                                                             |
| Mouse wheel, or drag with the middle button | Zoom towards the pointer.                                              |
| Alt + mouse wheel                         | Zoom towards the center of the view.                                     |
| Arrow keys                                | Pan the map.                                                             |
| Shift, Ctrl or Cmd + arrow keys           | Rotate the map.                                                          |
| Hover a building                          | Show its name and values, and draw its edges.                            |
| Click a building or folder                | Select it and open the [Inspector](/docs/visualization/user-controls/inspector). |
| Double-click a building                   | Open the file's source link, when the map has one.                       |
| Right-click a building or folder          | Open the [context menu](/docs/visualization/user-controls/code-map#context-menu). |
| Click the viewcube                        | Snap the camera to that side, edge or corner.                            |
| Drag the viewcube                         | Rotate the map.                                                          |
| Right-click **Center map**                | Set the zoom that **Center map** fits to.                                |
| Hover a segment of the distribution bar   | Light up the files of that extension.                                    |
| Click the distribution bar                | Switch between percentages and absolute values.                          |
| Right-click a segment of the distribution bar | **Flatten** or **Exclude** that extension.                           |

## Metric view: Sunburst and Radial TreeMap

| Shortcut                  | Action                                               |
| ------------------------- | ---------------------------------------------------- |
| Click a folder            | Step into it.                                        |
| Click the center          | Step out to the parent folder.                       |
| Click a file              | Select it and open the Inspector.                    |
| Hover a segment           | Show its metrics and fade the rest.                  |
| Right-click a segment     | Open the context menu.                               |

## Domain view

| Shortcut                   | Action                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| Mouse wheel                | Magnify the word cloud.                                             |
| Drag                       | Move the word cloud.                                                |
| Hover a word               | Show its frequency and TF-IDF value.                                |
| Click a word               | Open it: mark it in the cloud and pin it in the Explorer.           |
| Click the empty cloud      | Let go of the opened word.                                          |
| Right-click a word         | Copy, **Search word** or **Hide word**.                             |

## Dependencies view

| Shortcut                                  | Action                                                            |
| ----------------------------------------- | ----------------------------------------------------------------- |
| Mouse wheel                               | Zoom.                                                             |
| Drag the background                       | Pan.                                                              |
| Space + drag, or drag with the right mouse button | Pan from anywhere, also from a box.                       |
| Drag a box                                | Move it; **Reset layout** puts it back.                           |
| Hover a box or edge                       | Show what it is, and draw all edges of the box.                   |
| Click a box or edge                       | Select it and show it in the Inspector.                           |
| Double-click a folder, package or file    | Open or close it.                                                 |
| Click a badge                             | Select its box and list its cycles or upward dependencies.        |
| Right-click a box                         | Open the context menu.                                            |
| Tab                                       | Move the keyboard focus into the graph.                           |
| Arrow keys                                | Move the focus from box to box.                                   |
| Enter                                     | Select the focused box.                                           |
| Space                                     | Open or close the focused box.                                    |

See also [The code map](/docs/visualization/user-controls/code-map),
[Domain view](/docs/visualization/user-controls/domain-view) and
[Dependency view](/docs/visualization/user-controls/dependency-view).
