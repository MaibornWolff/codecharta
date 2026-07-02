# Software Report View

**As a** user of the visualization
**I want** a new "Report" point added after `Explore | Compare`
**So that** I can see a big software report with different metrics in one consolidated overview

## Acceptance Criteria
- [ ] A new entry is added to the mode switcher, after `Explore` and `Compare` (e.g. `Explore | Compare | Report`)
- [ ] Selecting it opens a dedicated software report view
- [ ] The report aggregates and presents the project's key metrics (e.g. summary stats, distributions, top files) for the loaded data
- [ ] The report reflects the currently loaded file(s) and updates when the data changes
- [ ] The view follows the new feature architecture and daisyUI styling, consistent with the rest of the app
- [ ] Switching between Explore, Compare, and Report preserves loaded data and relevant state
- [ ] Tests cover the new mode and its report content
