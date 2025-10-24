---
name: GitIgnore Support for RawTextParser
issue: #4273
state: progress
version: TBD
---

## Goal

Refactor gitignore functionality from UnifiedParser to a shared location and implement gitignore-based file exclusion in RawTextParser, enabling both parsers to use consistent .gitignore file handling.

## Tasks

### 1. Move Gitignore Components to Shared Location

Extract gitignore-related classes from UnifiedParser to a shared module accessible by both parsers.

- Move `GitignoreRule.kt` from `UnifiedParser/gitignore/` to `analyserinterface/gitignore/`
- Move `GitignorePatternMatcher.kt` from `UnifiedParser/gitignore/` to `analyserinterface/gitignore/`
- Move `GitignoreHandler.kt` from `UnifiedParser/gitignore/` to `analyserinterface/gitignore/`
- Update package declarations in moved files to `de.maibornwolff.codecharta.analysers.analyserinterface.gitignore`
- Update imports in UnifiedParser's `ProjectScanner.kt` to reference new package

### 2. Move Gitignore Tests to Shared Location

Move test files to align with new shared structure.

- Move `GitignorePatternMatcherTest.kt` to `analyserinterface` test directory
- Move `GitignoreHandlerTest.kt` to `analyserinterface` test directory
- Update package declarations in test files
- Move test resources from `UnifiedParser/test/resources/gitignore-test-project/` to shared test resources if needed
- Verify all tests still pass after move

### 3. Add Gitignore Parameter to CommonAnalyserParameters

Extend `CommonAnalyserParameters` with gitignore control flag similar to other common parameters.

- Add `--bypass-gitignore` flag to `CommonAnalyserParameters`
- Add `bypassGitignore` protected property (default: false)
- Add documentation describing the parameter behavior

### 4. Update UnifiedParser to Use CommonAnalyserParameters

Refactor UnifiedParser to use the shared gitignore parameter instead of its local one.

- Remove local `@CommandLine.Option` for `--bypass-gitignore` from `UnifiedParser.kt`
- Update `UnifiedParser` to use inherited `bypassGitignore` from `CommonAnalyserParameters`
- Verify `UnifiedParser.kt` logic still works correctly with shared parameter
- Ensure `Dialog.kt` still references correct parameter
- Run all UnifiedParser tests to ensure they still pass
- Fix any failing tests caused by the refactoring

### 5. Integrate Gitignore into ProjectMetricsCollector

Add gitignore support to RawTextParser's file traversal logic.

- Add `useGitignore` parameter to `ProjectMetricsCollector` constructor (default: true)
- Initialize `GitignoreHandler` when `useGitignore` is true
- Modify `parseProject()` to check gitignore exclusions before other filters
- Update file exclusion order: gitignore → regex patterns → file extensions
- Add statistics tracking for excluded files (similar to UnifiedParser)
- Add method to retrieve gitignore statistics

### 6. Update RawTextParser CLI Integration

Connect gitignore functionality to RawTextParser command-line interface.

- RawTextParser inherits `--bypass-gitignore` flag from `CommonAnalyserParameters` (no local declaration needed)
- Pass `!bypassGitignore` (useGitignore) to `ProjectMetricsCollector` constructor
- Implement logic to determine exclusion patterns similar to UnifiedParser:
  - Check if root .gitignore exists
  - Fall back to DEFAULT_EXCLUDES if no root .gitignore and not bypassed
  - Handle BUILD_FOLDERS based on `includeBuildFolders` flag
- Report gitignore statistics to stderr after parsing
- Show .gitignore file paths in verbose mode

### 7. Add Interactive Dialog Support for RawTextParser

Update RawTextParser's interactive dialog to include gitignore question.

- Add "Should .gitignore files be bypassed?" question to `RawTextParser/Dialog.kt`
- Default answer should be "no" (gitignore enabled by default)
- Add `--bypass-gitignore` to args if user selects "yes"

### 8. Write Tests for RawTextParser Gitignore Integration

Verify gitignore functionality works correctly in RawTextParser.

- Add unit tests for `ProjectMetricsCollector` with gitignore enabled
- Add unit tests for `ProjectMetricsCollector` with gitignore disabled
- Test combination of gitignore + regex patterns (both should apply)
- Test fallback to DEFAULT_EXCLUDES when no root .gitignore exists
- Add integration test with sample project containing .gitignore files
- Verify statistics reporting works correctly

### 9. Update Documentation

Document the new shared gitignore functionality.

- Update RawTextParser README with gitignore support information
- Update UnifiedParser README to reflect shared implementation
- Add usage examples showing `--bypass-gitignore` flag
- Update CHANGELOG.md with gitignore feature for RawTextParser

## Steps

- [x] Complete Task 1: Move gitignore components to shared location
- [x] Complete Task 2: Move gitignore tests to shared location
- [x] Complete Task 3: Add gitignore parameter to CommonAnalyserParameters
- [x] Complete Task 4: Update UnifiedParser to use CommonAnalyserParameters
- [ ] Complete Task 5: Integrate gitignore into ProjectMetricsCollector
- [ ] Complete Task 6: Update RawTextParser CLI integration
- [ ] Complete Task 7: Add interactive dialog support for RawTextParser
- [ ] Complete Task 8: Write tests for RawTextParser gitignore integration
- [ ] Complete Task 9: Update documentation

## Review Feedback Addressed

(To be filled in after review)

## Notes

### Design Decisions

- **Shared Module Location**: Place gitignore components in `analyserinterface` module since it's already used for shared analyzer functionality like `CommonAnalyserParameters`
- **Consistent Behavior**: Both parsers should have identical gitignore behavior for consistency
- **Default Enabled**: Gitignore is enabled by default (bypass flag is false) to match UnifiedParser behavior
- **Smart Fallback**: If no root .gitignore exists, fall back to regex-based exclusion (DEFAULT_EXCLUDES for RawTextParser)
- **Additive Exclusion**: User-specified patterns via `-e` flag apply in addition to gitignore exclusions
- **Backward Compatible**: Existing RawTextParser behavior is preserved when gitignore is bypassed

### Key Differences Between Parsers

**UnifiedParser**:
- Uses `ProjectScanner` class for file traversal
- Has language-specific collectors for different file types
- Falls back to BUILD_FOLDERS when no root .gitignore exists

**RawTextParser**:
- Uses `ProjectMetricsCollector` class for file traversal
- Works with any text file (no language-specific processing)
- Falls back to DEFAULT_EXCLUDES when no root .gitignore exists
- DEFAULT_EXCLUDES includes BUILD_FOLDERS plus additional patterns

### Implementation Approach

1. **Move First**: Relocate all gitignore code to shared location
2. **Update UnifiedParser**: Ensure existing functionality still works
3. **Add to RawTextParser**: Implement similar integration pattern
4. **Test Thoroughly**: Verify both parsers work correctly with shared code

### Testing Strategy

- Ensure UnifiedParser tests still pass after refactoring
- Add parallel tests for RawTextParser gitignore functionality
- Test edge cases: no .gitignore, nested .gitignore, malformed patterns
- Verify statistics reporting for both parsers
- Test interaction between gitignore and regex exclusion patterns
