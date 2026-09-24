---
name: Radial map rendering bugs
issue: none
state: complete
version: 1
---

## Goal

Fix three bugs reported on 2026-09-24 in the sunburst and radial treemap: hovering the file extension bar throws,
hovering a big radial treemap redraws it in clockwise sweeps, and on very big maps parts of the map fade to white.

## Tasks

### 1. Extension bar hover without a 3D map
- `ThreeSceneService.applyHighlightingForExtensions` reads the 3D mesh, which never exists when the app starts in a
  radial layout; return early without a mesh

### 2. Hover sweeps on big radial treemaps
- ECharts draws a large custom series in chunks over several frames and redraws it that way on every hover; set
  `progressive: 0` on the radial treemap series (the sunburst series does not draw progressively)

### 3. Faded parts on very big maps
- Pieces thinner than a few borders are covered by their white border, and wedge outlines paint whole regions white
- Keep the white border only where it fits (4× its width); outline thinner pieces in their own colour so sub-pixel
  slivers bleed over the antialiasing gaps; drop wedge outlines that do not fit; same rule in the sunburst

### 4. Tests and changelog
- Unit tests for each fix; changelog Fixed entries only for what 2.6.0 users see (sunburst fade, extension bar error)

## Steps

- [x] Complete Task 1: Extension bar hover without a 3D map
- [x] Complete Task 2: Hover sweeps on big radial treemaps
- [x] Complete Task 3: Faded parts on very big maps
- [x] Complete Task 4: Tests and changelog
- [x] Run format:check, npm test, npm run lint, tsc --noEmit and the e2e suite

## Notes

- Reproduced with a generated 6k-file map (hover: canvas dropped to 25 % drawn for several frames, 0 % after the fix)
  and with `netbeans.cc.json.gz` (92.5k files) booted straight into each radial layout (fade before, full after)
