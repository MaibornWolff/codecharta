# Release Workflows Documentation

This document explains the release workflows and processes for CodeCharta.

## Overview

CodeCharta uses several GitHub Actions workflows to manage releases for both the Visualization and Analysis components. These workflows handle:
- Preparing releases
- Publishing releases
- Staging deployments
- Unpublishing releases (if needed)

## Release Process

### 1. Prepare Release Workflow

The prepare release workflow (`prepare-release.yml`) is triggered manually and handles:

- Updating version numbers
- Creating changelog entries
- Creating release posts
- Opening a pull request for the release

**Usage:**
1. Go to Actions → "Prepare Release - Visualization/Analysis"
2. Select:
   - Repository (Visualization or Analysis)
   - Version type (patch, minor, major)
3. Run workflow

The workflow will:
- Use the version manager to update versions
- Create a release PR
- Add appropriate labels
- Update documentation

### 2. Main Release Workflows

#### Visualization Release (`release-visualization.yml`)

Triggered when:
- A release PR is merged
- Manual trigger with version input

Steps:
1. Builds artifacts
2. Creates GitHub release
3. Publishes to npm
4. Publishes to Docker Hub
5. Deploys to GitHub Pages

#### Analysis Release (`release-analysis.yml`)

Similar to visualization but with analysis-specific steps:
1. Builds artifacts
2. Creates GitHub release
3. Publishes node wrapper to npm
4. Publishes to Docker Hub

### 3. Staging Workflows

#### Visualization Staging (`staging-visualization.yml`)

Triggered on:
- Push to main (visualization files)
- Manual trigger

Deploys:
- Staging npm package
- Staging Docker image
- Staging GitHub Pages

#### Analysis Staging (`staging-analysis.yml`)

Similar to visualization staging but for analysis components.

### 4. Unpublish Workflow

The unpublish workflow (`unpublish-release.yml`) provides options to:
- Unpublish from npm
- Remove Docker images
- Delete GitHub release
- Create revert PR

**Usage:**
1. Go to Actions → "Unpublish Release"
2. Select:
   - Repository
   - Version
   - Unpublish type (all, npm, docker, github)
   - Whether to create revert PR

## Version Manager

The version manager script (`version-manager.ts`) handles:
- Version updates
- Changelog management
- Release post creation
- Documentation updates

### Key Functions:

1. `updateVersion`: Updates version numbers across all relevant files
2. `extractChangelog`: Extracts changelog entries for releases
3. `updateReadme`: Updates version numbers in README.md

## Requirements

Before releasing:
1. Ensure all changes are merged to main
2. Verify tests pass
3. Check changelog entries are complete
4. Ensure you have required permissions

## Release Types

Follow [Semantic Versioning](http://semver.org/):
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

## Post-Release

After a release:
1. Verify all artifacts are published
2. Check documentation is updated
3. Verify staging deployments
4. Monitor for any issues

## Troubleshooting

If a release fails:
1. Check workflow logs
2. Use unpublish workflow if needed
3. Create revert PR if necessary (using the unpublish workflow)

## Notes

- Always use the prepare release workflow instead of manual version updates
- Keep changelogs up to date
- Test staging deployments before releasing
- Monitor release workflows for completion 