# Release Workflows Documentation

This document explains the release workflows and processes for CodeCharta.

## TL;DR how to make a release
- Go to Actions → "Prepare Release - Visualization/Analysis" → "Run workflow"
- Input repository and type of version increment
- Click "Run workflow"
- This automatically triggers everything else necessary and opens a PR for the release
- Go to "Pull requests"
- Wait for test pipelines to run (around 10-15 min)
- Approve PR if everything works
- Final release should be done after around 10 min

## Overview

CodeCharta uses several GitHub Actions workflows to manage releases for both the Visualization and Analysis components. These workflows handle:
- Preparing releases
- Publishing releases
- Staging deployments
- Unpublishing releases (if needed)

## Release Process

Before releasing:
1. Ensure all changes are merged to main
2. Verify tests pass
3. Check changelog entries are complete
4. Ensure you have required permissions

### 1. Prepare Release Workflow

The prepare release workflow (`prepare-release.yml`) is triggered manually and handles:

- Updating version numbers
- Creating changelog entries
- Creating release posts
- Opening a pull request for the release

**Usage:**
1. Go to Actions → "Prepare Release - Visualization/Analysis" → "Run workflow"
2. Select:
   - Repository (Visualization or Analysis)
   - Version type (Follow [Semantic Versioning](http://semver.org/))
     - **Patch**: Bug fixes, backward compatible
     - **Minor**: New features, backward compatible
     - **Major**: Breaking changes
3. Run workflow

The workflow will:
- Use the version manager to update versions
- Add appropriate labels
- Update documentation
- Create a release PR

### 2. Main Release Workflows

#### Visualization Release (`release-visualization.yml`)

Triggered when:
- The release PR from previous step is merged

The workflow will:
1. Build artifacts
2. Create GitHub release
3. Publish to npm
4. Publish to Docker Hub
5. Deploy to GitHub Pages

#### Analysis Release (`release-analysis.yml`)

Similar to visualization but the workflow will:
1. Build artifacts
2. Create GitHub release
3. Publish node wrapper to npm
4. Publish to Docker Hub

### Post-Release

After a release:
1. Verify all artifacts are published
2. Check documentation is updated
3. Verify staging deployments
4. Monitor for any issues

## Staging Workflows

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

## Unpublish Workflow

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

The version manager script ([version-manager.ts](../.github/workflows/scripts/version-manager.ts)) handles:
- Version updates
- Changelog management
- Release post creation
- Documentation updates

### Key Functions:

1. `updateVersion`: Updates version numbers across all relevant files
2. `extractChangelog`: Extracts changelog entries for releases
3. `updateReadme`: Updates version numbers in README.md

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
