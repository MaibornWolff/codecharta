---
name: Refactor UnifiedParser to Eliminate Code Duplication
issue: TBD
state: complete
version: 1.0
---

## Goal

Eliminate code duplication between the public `parse()` API and the private `scanInputProject()` method in UnifiedParser by creating a single source of truth for the scanning logic.

## Problem

The public `parse()` API (lines 51-79) duplicates logic from `scanInputProject()` (lines 109-139) but lacks:
1. Automatic build folder exclusion logic when no .gitignore exists
2. Support for `includeBuildFolders` flag
3. Base file nodes support
4. Execution time tracking

The MetricThresholdChecker tool needs to use the full scanning capabilities without code duplication.

## Solution

Create a single private method that both `parse()` and `scanInputProject()` call, exposing all relevant configuration options in the public API.

## Tasks

### 1. Add Missing Parameters to Public API
- Add `includeBuildFolders` parameter to `parse()` (default: false)
- Add optional `baseFileNodeMap` parameter to `parse()` (default: emptyMap())
- Keep the API backward compatible with sensible defaults

### 2. Extract Core Scanning Logic
- Create new private method `performScan()` that accepts all parameters:
  - `inputFile: File`
  - `excludePatterns: List<String>`
  - `fileExtensions: List<String>`
  - `baseFileNodeMap: Map<String, MutableNode>`
  - `useGitignore: Boolean`
  - `includeBuildFolders: Boolean`
  - `verbose: Boolean`
- Move the core logic from both methods into `performScan()`:
  - Create ProjectBuilder
  - Call `determineExclusionPatterns()` with all parameters
  - Create ProjectScanner
  - Call `traverseInputProject()`
  - Check `foundParsableFiles()` and warn if needed
  - Add attribute descriptors
  - Return Project and ProjectScanner (for reporting)

### 3. Refactor `parse()` to Use Core Logic
- Call `performScan()` with parameters from API
- Return the Project directly
- No reporting (keep it simple for library use)

### 4. Refactor `scanInputProject()` to Use Core Logic
- Load base file nodes
- Call `performScan()` with instance fields
- Add CLI-specific logic:
  - Timing (keep start/end time tracking)
  - Reporting methods (reportNotFoundFileExtensions, etc.)
- Return the Project

### 5. Update `determineExclusionPatterns()` Signature
- Accept `includeBuildFolders: Boolean` as parameter instead of using instance field
- Keep the same logic but make it pure (no instance field access)

### 6. Update MetricThresholdChecker
- Add `--include-build-folders` option to MetricThresholdChecker
- Pass the parameter to `UnifiedParser.parse()`

### 7. Write Tests
- Unit test for `parse()` with various parameter combinations
- Verify build folder exclusion works in both public API and CLI
- Test that both paths produce identical results for same inputs

## Steps

- [x] Complete Task 1: Add missing parameters to public API
- [x] Complete Task 2: Extract core scanning logic into `performScan()`
- [x] Complete Task 3: Refactor `parse()` to use `performScan()`
- [x] Complete Task 4: Refactor `scanInputProject()` to use `performScan()`
- [x] Complete Task 5: Update `determineExclusionPatterns()` to accept parameter
- [x] Complete Task 6: Update MetricThresholdChecker to use new parameter
- [x] Complete Task 7: Write tests

## Implementation Notes

### Single Point of Truth
The `performScan()` method becomes the single source of truth for all scanning logic. Both the public API and CLI implementation call this method.

### Backward Compatibility
The public `parse()` API maintains backward compatibility by making new parameters optional with sensible defaults:
- `includeBuildFolders = false` (exclude build folders by default)
- `baseFileNodeMap = emptyMap()` (no base nodes by default)

### CLI-Specific Features
These remain in `scanInputProject()` only:
- Piped input handling
- Execution time tracking and reporting
- Console output for warnings/statistics
- Multiple report methods

### Return Type Consideration
`performScan()` needs to return both Project and ProjectScanner so `scanInputProject()` can call reporting methods. Consider using a data class:
```kotlin
private data class ScanResult(
    val project: Project,
    val scanner: ProjectScanner
)
```

### Testing Strategy
Verify that for identical inputs, both code paths produce identical Projects:
```kotlin
val apiResult = UnifiedParser.parse(inputFile, excludePatterns, ...)
val cliInstance = UnifiedParser()
// configure cliInstance with same parameters
val cliResult = cliInstance.scanInputProject(inputFile)
// Assert projects are equal
```
