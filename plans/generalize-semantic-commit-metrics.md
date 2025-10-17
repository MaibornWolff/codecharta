
---
name: Generalize Semantic Commit Metrics
issue: N/A
state: todo
version: N/A
---

# Generalize Semantic Commit Metrics

## Goal

Eliminate code duplication across seven semantic commit metric classes (DocsCommits, FeatCommits, FixCommits, HotfixCommits, RefactorCommits, StyleCommits, TestCommits) by creating a single generic `SemanticCommitMetric` class. All seven classes follow identical patterns, differing only in the commit type, description text, and detector method used.

This refactoring will reduce maintenance burden, improve code quality, and follow DRY principles.

## Steps

- [x] Create new `SemanticCommitMetric` class that accepts commit type, description, and detector function as constructor parameters
- [x] Write unit tests for the new generic `SemanticCommitMetric` class
- [x] Update `MetricsFactory` to instantiate semantic commit metrics using the new generic class instead of individual classes
- [x] Update `SemanticCommitMetricsTest` to include all seven semantic commit types (currently only tests 4 of them)
- [x] Remove old individual metric classes: DocsCommits.kt, FeatCommits.kt, FixCommits.kt, HotfixCommits.kt, RefactorCommits.kt, StyleCommits.kt, TestCommits.kt
- [x] Remove old individual test files: DocsCommitsTest.kt, FeatCommitsTest.kt, FixCommitsTest.kt, HotfixCommitsTest.kt, RefactorCommitsTest.kt, StyleCommitsTest.kt, TestCommitsTest.kt
- [ ] Run all tests to verify the refactoring works correctly
- [ ] Run integration tests to ensure end-to-end functionality
- [ ] Verify ktlint passes and code formatting is correct

## Notes

**Current Architecture:**
- All seven classes implement the `Metric` interface
- They all use methods from `SemanticCommitDetector` (e.g., `isDocsCommit()`, `isFeatCommit()`)
- They are instantiated in `MetricsFactory.createAllMetrics()` (lines 41-47)
- Some already have parameterized tests in `SemanticCommitMetricsTest.kt`, which can serve as a template for testing all types

**Generic Class Design:**
The new `SemanticCommitMetric` class should:
- Accept three constructor parameters:
  - `commitType: String` - The type (e.g., "docs", "feat", "fix")
  - `description: String` - The full description text
  - `detector: (String) -> Boolean` - Function reference to the detector method
- Implement the `Metric` interface
- Maintain a private counter for commits
- Use the provided detector function in `registerCommit()`
- Return metric name in the format `{commitType}_commits`

**Example Instantiation:**
```kotlin
SemanticCommitMetric(
    commitType = "docs",
    description = "Docs Commits: Number of documentation commits (starting with 'docs') for this file.",
    detector = SemanticCommitDetector::isDocsCommit
)
```

**Testing Strategy:**
- Leverage existing parameterized tests in `SemanticCommitMetricsTest.kt`
- Ensure all seven types are covered in parameterized tests
- Individual test files can be deleted after verifying generic tests pass
