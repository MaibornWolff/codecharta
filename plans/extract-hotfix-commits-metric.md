---
name: Extract hotfix_commits into standalone metric
issue:
state: complete
version: 1
---

## Goal

Refactor `hotfix_commits` from the semantic commit system into a standalone metric class similar to `NumberOfAuthors`, eliminating the dependency on `SemanticCommitType` and simplifying the MetricsFactory.

## Tasks

### 1. Create HotfixCommits metric class
- Create new file `HotfixCommits.kt` in the metrics package
- Implement `Metric` interface directly (similar to `NumberOfAuthors`)
- Track commits containing "hotfix" in the commit message (case-insensitive)
- Return metric name "hotfix_commits" and appropriate description
- Use `AttributeType.ABSOLUTE` for the metric type

### 2. Update MetricsFactory
- Remove `createHotfixType()` method that creates SemanticCommitType for hotfix
- Remove `hotfixType` variable usage in `createAllMetricFactories()`
- Remove `SemanticCommitMetric(hotfixType)` from the metrics list
- Add `{ HotfixCommits() }` factory to the `standardFactories` list

### 3. Remove HotfixCommitRatio
- Delete `HotfixCommitRatio.kt` class file (no longer needed with direct count)
- Delete `HotfixCommitRatioTest.kt` test file
- Remove `{ HotfixCommitRatio(hotfixType) }` from MetricsFactory

### 4. Create tests for HotfixCommits
- Create `HotfixCommitsTest.kt` following existing metric test patterns
- Test that commits containing "hotfix" are counted
- Test case-insensitive matching
- Test that non-hotfix commits are not counted

### 5. Verify changes
- Run GitLogParser tests to ensure all pass
- Verify metric output includes hotfix_commits with correct values

## Steps

- [x] Complete Task 1: Create HotfixCommits.kt metric class
- [x] Complete Task 2: Update MetricsFactory to use HotfixCommits
- [x] Complete Task 3: Remove HotfixCommitRatio and its test (restored later)
- [x] Complete Task 4: Create HotfixCommitsTest.kt
- [x] Complete Task 5: Run tests and verify all pass

## Notes

- This separates "hotfix" from semantic commit types (feat, fix, docs, etc.) since hotfix is not a conventional commit type
- The new metrics are simpler and don't require SemanticCommitType infrastructure
- Maintains backward compatibility - metric names stay "hotfix_commits" and "hotfix_commit_ratio"
- HotfixCommitRatio was initially removed but then restored as a standalone metric (not using SemanticCommitType)
- Both metrics now directly check for "hotfix" in commit messages using case-insensitive matching
- All 292 tests pass successfully
