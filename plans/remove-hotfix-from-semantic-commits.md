---
name: Remove hotfix from semantic commit types
issue: N/A
state: complete
version: 1
---

## Goal

Remove hotfix from DefaultSemanticCommitStyle because it's not a true semantic commit type. Unlike semantic commits (feat, fix, docs, etc.) which use StartsWith pattern matching, hotfix uses Contains pattern to match "hotfix" anywhere in the commit message. Keep both hotfix_commits and hotfix_commit_ratio metrics functional by defining hotfix type separately in MetricsFactory.

## Tasks

### 1. Remove hotfix from DefaultSemanticCommitStyle.kt
- Remove the hotfix SemanticCommitType definition from defaultCommitTypes list
- This changes the list from 7 types to 6 types (feat, fix, docs, style, refactor, test)

### 2. Define hotfix type in MetricsFactory.kt
- Create a private function or constant in MetricsFactory to define the hotfix SemanticCommitType
- Use MatchPattern.Contains("hotfix") to maintain existing behavior
- Keep the same name, metricName, and description as before

### 3. Update MetricsFactory to use the new hotfix definition
- Replace `DefaultSemanticCommitStyle.getTypeByName("hotfix")!!` with the new local definition
- Ensure both HotfixCommitRatio and SemanticCommitMetric(hotfix) are still created
- Maintain the same order in the metrics list

### 4. Update SemanticCommitRatio description
- Remove "hotfix" from the description text
- Update from "(feat, fix, docs, style, refactor, test, hotfix)" to "(feat, fix, docs, style, refactor, test)"

### 5. Update DefaultSemanticCommitStyleTest
- Change expected size from 7 to 6 types
- Remove "hotfix" from the containsExactlyInAnyOrder assertion
- Remove or update the getTypeByName test that checks for hotfix
- Remove the should_detect_hotfix_commits_using_contains_pattern test (hotfix-specific tests belong in HotfixCommitRatioTest)

### 6. Update HotfixCommitRatioTest
- Change from getting hotfix type via DefaultSemanticCommitStyle.getTypeByName("hotfix")
- Define the hotfix type directly in the test file or use a consistent approach
- Ensure all tests still pass with the same behavior

## Steps

- [x] Complete Task 1: Remove hotfix from DefaultSemanticCommitStyle.kt
- [x] Complete Task 2: Define hotfix type in MetricsFactory.kt
- [x] Complete Task 3: Update MetricsFactory to use new hotfix definition
- [x] Complete Task 4: Update SemanticCommitRatio description
- [x] Complete Task 5: Update DefaultSemanticCommitStyleTest
- [x] Complete Task 6: Update HotfixCommitRatioTest
- [x] Run tests to verify all changes work correctly

## Review Feedback Addressed

N/A - Initial implementation

## Notes

### Key Decision: Keep hotfix_commits metric
- User confirmed to keep the hotfix_commits metric (raw count)
- Both hotfix_commits and hotfix_commit_ratio will continue to be generated
- Only the location of the hotfix type definition changes

### Key Decision: Define hotfix in MetricsFactory
- User chose to define hotfix type in MetricsFactory rather than a new dedicated file or in HotfixCommitRatio
- This keeps the definition close to where it's used in createAllMetricFactories()

### Pattern Difference
- Semantic commits: Use `MatchPattern.StartsWith()` for conventional commit format
- Hotfix: Uses `MatchPattern.Contains("hotfix")` to match anywhere in message
- This is why hotfix doesn't belong in DefaultSemanticCommitStyle

### Testing Strategy
- Ensure HotfixCommitRatioTest remains comprehensive (already has 15 test cases)
- DefaultSemanticCommitStyleTest should focus only on true semantic commit types
- All existing integration tests should continue to pass

### Verification Steps Performed
- Ran DefaultSemanticCommitStyleTest: All 44 tests passed
- Ran HotfixCommitRatioTest: All 14 tests passed
- Ran full GitLogParser test suite: All 281 tests passed
- Verified DefaultSemanticCommitStyle now returns 6 types instead of 7
- Verified hotfix_commits and hotfix_commit_ratio metrics are still generated via MetricsFactory
- Verified SemanticCommitRatio description no longer references hotfix
