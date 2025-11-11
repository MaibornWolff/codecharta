# CodeCharta Scripts

This directory contains utility scripts for the CodeCharta project.

## cleanup-old-plans.js

Automatically cleans up old plan files from the `plans/` directory based on version age.

### Usage

```bash
# Run cleanup for all plans (both analysis and visualization)
npm run plans:cleanup

# Dry run (preview what would be deleted without actually deleting)
npm run plans:cleanup:dry-run

# Clean up only analysis plans
npm run plans:cleanup:analysis

# Clean up only visualization plans
npm run plans:cleanup:visualization

# Advanced usage with custom component filter
node scripts/cleanup-old-plans.js --component=analysis --dry-run
```

### How it works

1. Reads current versions from:
   - Analysis: `analysis/gradle.properties` (currentVersion)
   - Visualization: `visualization/package.json` (version)

2. Scans all plan files in `plans/` directory (excluding `template.md`)

3. Parses frontmatter to check:
   - `state`: Must be `complete`
   - `component`: Must be `analysis`, `visualization`, or `both`
   - `version`: Must be a valid semantic version (e.g., `1.138.0`)

4. Deletes plans that are **2 or more minor versions old**:
   - Example: If current analysis version is `1.138.0`, plans with version `≤ 1.136.0` are deleted
   - For `component: both`, uses the higher of the two current versions

5. Component filtering:
   - `--component=analysis`: Deletes plans with `component: analysis` or `component: both`
   - `--component=visualization`: Deletes plans with `component: visualization` or `component: both`
   - `--component=both` (or no filter): Deletes all old plans regardless of component

6. Skips plans that:
   - Are not marked as `complete`
   - Don't have a `version` field
   - Don't have a `component` field
   - Don't match the component filter (if specified)
   - Are less than 2 minor versions old

### Automated Cleanup

This script runs automatically on every release:
- **Analysis releases**: Runs `npm run plans:cleanup:analysis` (cleans analysis and shared plans)
- **Visualization releases**: Runs `npm run plans:cleanup:visualization` (cleans visualization and shared plans)
- Deleted plans are automatically committed and pushed to the repository

### Manual Usage

Run this script manually:
- **Monthly**: As part of regular maintenance
- **Before releases**: To preview cleanup before version bumps (use `--dry-run`)
- **Ad-hoc**: Whenever the plans folder feels cluttered

### Output

The script provides a detailed summary showing:
- Current versions for analysis and visualization
- Component filter (if specified)
- Plans that will be deleted (with their version and component)
- Plans that were skipped (with reasons)
- Success/failure status for deletions
