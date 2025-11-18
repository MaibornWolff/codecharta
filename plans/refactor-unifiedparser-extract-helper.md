---
name: Refactor UnifiedParser - Extract Helper to Eliminate Duplication
issue: N/A
state: todo
version: 1
---

## Goal

Eliminate code duplication between the `parse()` companion function and `scanInputProject()` private function in UnifiedParser.kt by extracting shared scanning logic into a helper function, while keeping each caller's specific responsibilities separate.

## Tasks

### 1. Extract Core Scanning Logic to Helper Function
- Create private companion function `performScan()` with parameters:
  - `inputFile: File`
  - `excludePatterns: List<String>`
  - `fileExtensions: List<String>`
  - `baseFileNodeMap: Map<String, MutableNode>`
  - `useGitignore: Boolean`
  - `includeBuildFolders: Boolean`
  - `verbose: Boolean`
- Encapsulate common logic:
  - Create ProjectBuilder
  - Determine effective exclusion patterns (including gitignore fallback)
  - Create ProjectScanner
  - Call traverseInputProject
  - Check foundParsableFiles and warn if needed
  - Add attribute descriptors
- Return both Project and ProjectScanner (scanner needed for CLI reporting)

### 2. Create ScanResult Data Class
- Define private data class for helper return value:
```kotlin
private data class ScanResult(
    val project: Project,
    val scanner: ProjectScanner
)
```

### 3. Refactor `scanInputProject()` to Use Helper
- Load base file node map (existing logic)
- Call `performScan()` with instance fields
- Extract scanner from result for CLI reporting
- Keep CLI-specific reporting:
  - Execution time tracking
  - reportNotFoundFileExtensions
  - reportIgnoredFileTypes
  - reportGitIgnoreStatistics
  - reportNoParsableFiles
- Return Project from result

### 4. Refactor `parse()` to Use Helper
- Call `performScan()` with provided parameters
- Pass `emptyMap()` for baseFileNodeMap
- Pass `false` for includeBuildFolders
- Extract Project from result and return
- Keep existing simple warning (already in helper)

### 5. Move Exclusion Pattern Logic Into Helper
- Integrate `determineExclusionPatterns()` logic into `performScan()`
- Make it inline or extract as companion helper function
- Ensure gitignore fallback logic is preserved
- Both callers benefit from unified pattern determination

### 6. Verify Tests Pass
- Run existing UnifiedParser tests
- Ensure no behavior changes
- Both public API and CLI paths work correctly

## Steps

- [ ] Complete Task 1: Extract core scanning logic into `performScan()` helper
- [ ] Complete Task 2: Create ScanResult data class
- [ ] Complete Task 3: Refactor `scanInputProject()` to use helper
- [ ] Complete Task 4: Refactor `parse()` to use helper
- [ ] Complete Task 5: Move exclusion pattern logic into helper
- [ ] Complete Task 6: Run tests and verify functionality

## Notes

### Design Principles
- **Helper extracts common logic**: Both functions call shared helper to eliminate duplication
- **Keep parse() simple**: No base nodes, no comprehensive reporting - clean library API
- **Keep reporting CLI-only**: Detailed console output remains in scanInputProject only
- **Single source of truth**: Exclusion pattern logic unified in helper

### What Stays Where
**Helper function (performScan):**
- ProjectBuilder creation
- Exclusion pattern determination
- ProjectScanner creation
- Project traversal
- Basic "no parsable files" warning
- Attribute descriptor addition

**scanInputProject (CLI-specific):**
- Base file node map loading
- Execution time tracking
- Comprehensive reporting methods
- All console output and statistics

**parse (public API):**
- Simple parameters
- No base nodes (passes emptyMap)
- No reporting (relies on helper's basic warning)
- Clean interface for library users

### Code Style Compliance
- Block-body style with braces (no expression-body with `=`)
- Guard clauses with early returns
- Descriptive parameter names
- Extract magic values to constants
- Single responsibility per function
