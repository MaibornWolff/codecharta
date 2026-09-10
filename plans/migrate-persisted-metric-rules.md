---
name: Migrate persisted state to carry metric rules
issue: -
state: complete
version: -
---

## Goal

A session saved by a version without metric rules (vis-2.2.0, DB v19) reports `metricRules` as "not restored" on
load. Migrate the persisted state forward instead, so an upgrade restores silently.

## Tasks

### 1. v20 migration
- Seed `sharedView.metricRules` with its default when the persisted `sharedView` lacks it
- Bump `DB_VERSION` to 20 and register the step

### 2. Tests
- Unit tests for the v20 step (seeds, leaves existing rules, passes nullish through)
- Upgrade test: a v19 blob without `metricRules` reads back with `metricRules: []`

## Steps

- [x] Complete Task 1: v20 migration
- [x] Complete Task 2: Tests

## Notes

- stg and prd share one origin, so once stg opens the DB at v20, prd (v19) cannot open it until the next release
- No changelog entry: metric rules are unreleased, so the false "not restored" dialog never shipped
