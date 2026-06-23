---
title: "Metrics"
---

The **metric bar** at the bottom of the CodeCharta Web Studio is where you decide which of your data's metrics drives each visual dimension of the map. Every building (file) and folder is sized and coloured according to the metrics you pick here, so the bar is the main lever for turning raw numbers into a readable 3D treemap.

![The metric bar at the bottom of the Web Studio](/assets/images/docs/visualization/user-controls/metrics-bar.jpeg)

The bar is split into columns, one per visual dimension:

- **Area** – the footprint (base size) of each building.
- **Height** – how tall each building is.
- **Color** – which colour each building is tinted with.
- **Labels** and **Scenarios** – covered on their own pages (see below).

Each metric column shows the chosen metric's name and the summed (Σ) value across the map. Click a column's name to open a searchable list and pick a different metric, or click its **gear icon** to open a settings popover that fine-tunes how that dimension behaves. The small **link icon** sitting between Height and Color ties those two dimensions to the same metric (see [Linking height and color](#linking-height-and-color)).

If your map contains **edges** (connections between buildings, for example call or co-change relationships), an additional edge metric appears in the bar with its own settings popover for previewing and styling those edges.

## Area

The Area metric sets the base footprint of every building – larger values produce larger buildings. A common choice is lines of code (`rloc`), so that bigger files become bigger buildings.

![The Area metric settings popover](/assets/images/docs/visualization/user-controls/metrics-area.jpeg)

Open the gear icon on the Area column to adjust:

- **Margin** – the amount of empty space between buildings, in percent (1–100). A larger margin spreads buildings apart so individual files are easier to distinguish; a smaller margin packs them tightly.
- **Enable Floor Labels** – shows the names of folders ("floors") on the map, helping you orient yourself in the directory structure.
- **Invert Area** – flips the mapping so that small metric values become large buildings and vice versa.
- **Reset area metric settings** – restores all of the above to their defaults.

## Height

The Height metric controls how tall each building rises. Pairing height with a different metric than area (for example complexity over lines of code) lets you spot, at a glance, files that are both large and problematic.

![The Height metric settings popover](/assets/images/docs/visualization/user-controls/metrics-height.jpeg)

Open the gear icon on the Height column to adjust:

- **Height** – a scaling factor (1–25) that exaggerates or compresses the vertical scale of the whole map, making subtle height differences easier or harder to see.
- **Invert Height** – flips the mapping so that low metric values become tall buildings and high values become short ones. (Hidden in Compare/delta mode.)
- **Reset height metric settings** – restores these settings to their defaults.

## Color

The Color metric tints each building so you can categorize files by a metric without changing their size. The popover header reads **"Color by &lt;metric&gt;"** and gives you fine control over how values map to colours.

![The Color metric settings popover](/assets/images/docs/visualization/user-controls/metrics-color.jpeg)

### Color range and distribution

At the top is a **range slider** with two thumbs that split the metric's values into three bands: a *positive* (good) band below the left thumb, a *neutral* band between the thumbs, and a *negative* (critical) band above the right thumb. The numeric inputs on either side let you set the thresholds precisely. Below it, the **Distribution** chart plots the metric across the codebase (value × quantile %), so you can see how files cluster and place the thresholds sensibly.

### Gradient mode

The **Gradient Mode** buttons control how colours are assigned between the thresholds:

- **Absolute** – hard, discrete bands: every building is exactly the positive, neutral, or negative colour with no blending in between.
- **Focused** – a smooth gradient that blends colours only inside the selected range (between the two thumbs), while values outside snap to the solid positive or negative colour.
- **Weighted** – a smooth gradient whose transition zones are derived from the range width, spreading the colour change more gradually around each threshold.
- **Relative** – a continuous (true) gradient across the whole value range, blending positive → neutral → negative from the lowest to the highest value in the data.

### Bands, invert and reset

The **Bands** list shows each colour band with the **count** of buildings that currently fall into it, plus the colour used for a selected building. Below that:

- **Invert colors** – swaps the positive and negative colours, so the band you treat as "good" becomes the other end of the scale.
- **Reset colors** – restores the colour settings to their defaults.

### Folder overrides

Under **Folder Overrides** you can **Pin a folder color…** to tint a specific folder's floor with a fixed colour. The buildings inside still keep their metric-based colours. This is useful for highlighting a team's area or a subsystem on the map. Pinned folders are listed here with a count, and each can be recoloured or unpinned individually.

## Linking height and color

The **link icon** between the Height and Color columns ties both dimensions to the **same** metric. When linked (the icon is highlighted), changing either the height or the color metric updates the other automatically, so buildings that are tall are also coloured by the same value. Click the icon again to unlink them and choose height and color independently.

## Labels and Scenarios

The **Labels** and **Scenarios** columns in the metric bar have their own documentation:

- [Labels](/docs/visualization/user-controls/labels) – control which buildings are labelled on the map and how many.
- [Scenarios](/docs/visualization/custom-views) – save and apply preconfigured combinations of metric and view settings.
