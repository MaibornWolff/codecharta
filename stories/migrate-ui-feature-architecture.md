# Migrate Remaining UI to the New Feature Architecture

**As a** developer of the visualization
**I want** the remaining UI parts migrated to the new feature architecture (feature slices + facades)
**So that** the codebase is consistent, maintainable, and follows one clear pattern across all features

## Acceptance Criteria
- [ ] Remaining UI parts are reorganized into feature slices following the established structure
- [ ] Each migrated feature exposes its state and actions through a facade rather than reaching into the store directly
- [ ] Migrated components use signals / OnPush and daisyUI (no Material, no legacy patterns)
- [ ] Cross-feature dependencies go through facades/public APIs, not internal files
- [ ] Behavior is preserved for each migrated part (no functional regressions)
- [ ] Tests are updated/added per slice and the full suite passes
