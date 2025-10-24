---
name: Fix SemanticCommitRatio bug and rename SemanticCommitDetector
issue: <issue number if available>
state: complete
version: 1
---

## Goal

Fix bug where SemanticCommitRatio incorrectly excludes hotfix commits (hotfix IS a semantic commit type), eliminate magic "hotfix" string in MetricsFactory, and rename SemanticCommitDetector to prepare for future multi-style support.

## Steps

- [x] Rename `SemanticCommitDetector` to `DefaultSemanticCommitStyle` (preparing for multiple semantic commit style configurations in the future)
- [x] Add `getTypeByName(name: String)` method to eliminate magic string lookups
- [x] Fix bug in `MetricsFactory`: pass ALL semantic types (including hotfix) to `SemanticCommitRatio` constructor
- [x] Update `SemanticCommitRatio` description from "feat, fix, docs, style, refactor, test" to include hotfix or use more generic wording
- [x] Update all imports and references across codebase (primarily in `MetricsFactory`)
- [x] Run tests to verify bug fix and refactoring
- [x] Update any test expectations if needed (semantic commit ratio values will change)

## Summary

Successfully completed all refactoring tasks:

1. **Renamed class and file**: `SemanticCommitDetector` → `DefaultSemanticCommitStyle`
   - Renamed both main file and test file
   - Updated object name and method: `getDefaultCommitTypes()` → `getAllTypes()`

2. **Added new method**: `getTypeByName(name: String)` to eliminate magic string lookups

3. **Fixed critical bug in MetricsFactory.kt**:
   - BEFORE: `SemanticCommitRatio(semanticTypesWithoutHotfix)` - incorrectly excluded hotfix
   - AFTER: `SemanticCommitRatio(commitTypes)` - correctly includes ALL semantic types
   - Removed magic string: `commitTypes.find { it.name == "hotfix" }` → `DefaultSemanticCommitStyle.getTypeByName("hotfix")`

4. **Updated SemanticCommitRatio description**: Now includes hotfix in the list of semantic commit types

5. **Updated all references**: Updated 3 test files with all occurrences of the old name

6. **Tests verification**: All 312 tests pass successfully

7. **Code formatting**: Applied ktlintFormat successfully
