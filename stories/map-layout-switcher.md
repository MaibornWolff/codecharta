# On-Map Layout Switcher

**As a** user exploring a code map
**I want** the map layout option to be visible directly on the map as a small 3-way switcher (3D | Street | Mixed)
**So that** I can switch layouts at a glance without opening the settings panel

## Acceptance Criteria
- [ ] A compact 3-way switcher is overlaid on the map with three options: `3D`, `Street`, `Mixed`
- [ ] The switcher reflects the current layout setting and stays in sync with the layout option in the settings panel (changing one updates the other)
- [ ] Selecting an option re-renders the map with the corresponding layout algorithm
- [ ] The currently active layout is clearly highlighted
- [ ] The switcher is unobtrusive and does not block interaction with the map underneath
