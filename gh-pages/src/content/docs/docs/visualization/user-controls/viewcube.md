---
title: "Viewcube"
---

The **Viewcube** is the navigation widget in the top-right corner of the CodeCharta Web Studio. It mirrors the orientation of the map's camera as a small 3D cube, lets you snap to a fixed viewing angle with a single click, and groups together a row of toolbar buttons and a zoom slider for controlling how you look at the map.

![The Viewcube in the top-right corner, with its toolbar row and zoom slider](/assets/images/docs/visualization/user-controls/viewcube.jpeg)

The cube always reflects the current camera: as you orbit the map, the cube rotates in sync, so it doubles as a compass for the 3D scene. Above the cube sits a row of three small toolbar buttons, and to its right is a vertical zoom slider showing the current zoom level (140% in the screenshot above).

## Changing the camera angle

The cube is divided into clickable regions: its **faces**, **edges**, and **corners**. Clicking any of these snaps the map's camera to the matching perspective:

- **Faces** give you the straight-on views, for example looking down on the map from directly above (top), or head-on from the front or a side.
- **Edges** give you the angled views between two faces, such as a tilted top-front or top-side perspective.
- **Corners** give you the diagonal **isometric** views, looking at the map from above and off to one side at the same time.

As you hover over the cube, the region under the cursor highlights so you can see which perspective you are about to jump to. Clicking it rotates the camera to that fixed orientation. You can also **drag directly on the cube** to orbit the map freely, just as you would by dragging on the map itself.

To return to the default framing, use the **compass** button (the left-most toolbar icon above the cube). It recenters and re-fits the camera so the whole map is in view again. This is the same action referenced in the controls overview: click a side or edge of the Viewcube to change the perspective, or click the compass to reset the view.

## Zooming

The vertical **zoom slider** to the right of the cube controls how close the camera is to the map. It runs from **10%** (zoomed all the way out) to **200%** (zoomed all the way in), and the current value is shown as a percentage beneath the slider.

You can:

- **Drag the slider handle** to set the zoom level directly.
- Use the **`+`** and **`-`** buttons at the top and bottom of the slider to step the zoom in or out in increments of 10%.

The slider stays in sync with zooming you do directly on the map (for example with the mouse wheel), so it always reflects the current zoom level.

## Toolbox

The three buttons in the toolbar row above the cube are, from left to right:

- **Compass (center map).** Recenters and auto-fits the camera so the entire map fits back into view. Use this whenever you have orbited or zoomed away and want to get back to a clean overview of the whole map.
- **Camera (screenshot).** Takes a screenshot of the map. Depending on your settings, it either saves the image as a file or copies it to the clipboard. The same action is available via keyboard shortcuts: **Ctrl+Alt+S** to save as a file and **Ctrl+Alt+F** to copy to the clipboard.
- **Lightbulb (flashlight hover effect).** Toggles a presentation "flashlight" effect: when enabled, hovering over the map lights up buildings under the cursor, which is useful when presenting or demoing a map. The button stays highlighted while the effect is active; click it again to turn the effect off.
