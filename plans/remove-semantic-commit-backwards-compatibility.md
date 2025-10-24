# Remove Semantic Commit Detector Backward Compatibility Methods

**State**: complete
**Created**: 2025-10-19
**Completed**: 2025-10-19

## Problem

SemanticCommitDetector still contains 8 backward compatibility methods (isFeatCommit, isFixCommit, isDocsCommit, isStyleCommit, isRefactorCommit, isTestCommit, isHotfixCommit, isSemanticCommit) that were kept during the initial refactor. These are now unnecessary and should be removed to fully complete the DRY refactor.

## Current Usage

**Production code using these methods:**
- `HotfixCommitRatio.kt:26` - uses `isHotfixCommit(commit.message)`
- `SemanticCommitRatio.kt:26` - uses `isSemanticCommit(commit.message)`

**Test code:**
- `SemanticCommitDetectorTest.kt` - has individual tests for each method

## Solution

Remove all backward compatibility methods and refactor callers to use dependency injection. Pass `SemanticCommitType` configurations to metric constructors to enable future support for custom configurations.

**Design Decision:**
- `HotfixCommitRatio` receives hotfix `SemanticCommitType` in constructor
- `SemanticCommitRatio` receives list of `SemanticCommitType` in constructor
- MetricsFactory provides default configurations from `SemanticCommitDetector.getDefaultCommitTypes()`
- This enables future extension: custom configurations can be injected instead of defaults

## Implementation Steps

### Phase 1: Add Constructor Parameters
- [x] Add `hotfixType: SemanticCommitType` parameter to `HotfixCommitRatio` constructor
- [x] Add `semanticCommitTypes: List<SemanticCommitType>` parameter to `SemanticCommitRatio` constructor
- [x] Update both metrics to use injected configuration instead of calling SemanticCommitDetector methods
- [x] Update MetricsFactory to pass configurations from `SemanticCommitDetector.getDefaultCommitTypes()`
- [x] Run tests to ensure behavior unchanged

### Phase 2: Remove Backward Compatibility Methods
- [x] Remove all individual commit type methods (lines 53-79 in SemanticCommitDetector.kt)
- [x] Remove `isSemanticCommit` method (lines 81-88)
- [x] Update `SemanticCommitDetectorTest.kt` to test configuration-based approach

### Phase 3: Verification
- [x] Run unit tests (`./gradlew test`)
- [x] Run integration/golden tests (`./gradlew integrationTest`)
- [x] Verify no breaking changes (output identical)

## Success Criteria

- [x] All 8 backward compatibility methods removed from SemanticCommitDetector
- [x] HotfixCommitRatio accepts hotfixType in constructor
- [x] SemanticCommitRatio accepts semanticCommitTypes list in constructor
- [x] MetricsFactory updated to inject configurations
- [x] All unit tests passing (312 tests passed)
- [x] All integration/golden tests passing
- [x] Behavior unchanged (identical output)
- [x] ~37 lines of code removed (8 methods)
- [x] Architecture supports future custom configurations

## Implementation Notes

**Current signatures:**
```kotlin
class HotfixCommitRatio : Metric {
    // Uses: SemanticCommitDetector.isHotfixCommit(commit.message)
}

class SemanticCommitRatio : Metric {
    // Uses: SemanticCommitDetector.isSemanticCommit(commit.message)
}
```

**Target signatures:**
```kotlin
class HotfixCommitRatio(private val hotfixType: SemanticCommitType) : Metric {
    // Uses: hotfixType.matchPattern.matches(commit.message)
}

class SemanticCommitRatio(private val semanticCommitTypes: List<SemanticCommitType>) : Metric {
    // Uses: semanticCommitTypes.any { it.matchPattern.matches(commit.message) }
}
```

**MetricsFactory changes:**
- Get commit types once: `val commitTypes = SemanticCommitDetector.getDefaultCommitTypes()`
- Pass to HotfixCommitRatio: `commitTypes.find { it.name == "hotfix" }!!`
- Pass to SemanticCommitRatio: `commitTypes.filter { it.name != "hotfix" }`
  - **Note**: Current `isSemanticCommit()` excludes hotfix, so maintain this behavior

**Files to modify:**
1. `HotfixCommitRatio.kt` - add constructor parameter, update registerCommit()
2. `SemanticCommitRatio.kt` - add constructor parameter, update registerCommit()
3. `MetricsFactory.kt` - update metric instantiation to pass configurations
4. `SemanticCommitDetector.kt` - remove methods (lines 53-88)
5. `SemanticCommitDetectorTest.kt` - refactor tests

## Implementation Summary

### Completed 2025-10-19

Successfully removed all backward compatibility methods from SemanticCommitDetector and refactored to use dependency injection pattern.

**Key Changes:**

1. **Refactored Classes:**
   - `HotfixCommitRatio.kt` - Now accepts `hotfixType: SemanticCommitType` in constructor
   - `SemanticCommitRatio.kt` - Now accepts `semanticCommitTypes: List<SemanticCommitType>` in constructor
   - Both metrics use `matchPattern.matches()` directly instead of calling SemanticCommitDetector methods

2. **Updated Factory:**
   - `MetricsFactory.kt` - Extracts commit types once and injects them into metric constructors
   - `semanticTypesWithoutHotfix` maintains existing behavior (isSemanticCommit excluded hotfix)

3. **Removed Methods:**
   - `isFeatCommit()`, `isFixCommit()`, `isDocsCommit()`, `isStyleCommit()`, `isRefactorCommit()`, `isTestCommit()`, `isHotfixCommit()`, `isSemanticCommit()`
   - Reduced SemanticCommitDetector from 90 lines to 52 lines

4. **Test Updates:**
   - `HotfixCommitRatioTest.kt` - Updated to pass hotfixType parameter
   - `SemanticCommitRatioTest.kt` - Updated to pass semanticCommitTypes list
   - `SemanticCommitDetectorTest.kt` - Refactored to parameterized tests testing configuration directly

**Results:**
- All unit tests passing (312 tests)
- All integration/golden tests passing
- Behavior unchanged (output identical)
- Architecture now supports dependency injection for future custom configurations
- ~37 lines of code eliminated
