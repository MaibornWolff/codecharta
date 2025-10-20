---
name: GitIgnore-Based File Exclusion for UnifiedParser
issue: #4254
state: todo
version: TBD
---

## Goal

Implement automatic gitignore-based file exclusion in UnifiedParser using a custom zero-dependency pattern matcher. Files matching .gitignore patterns (including nested .gitignore files) will be excluded from analysis by default, with an option to disable this behavior.

## Tasks

### 1. Implement Custom GitIgnore Matcher Components

Build a lightweight gitignore pattern matcher using Java's PathMatcher API to avoid JGit dependency (~5-10 MB).

#### 1.1 Create GitignoreRule Data Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignoreRule.kt`
- Fields: pattern, isNegation, isDirOnly, isRooted, pathMatcher
- Stores compiled PathMatcher for efficient matching

#### 1.2 Implement GitignorePatternMatcher Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignorePatternMatcher.kt`
- Convert gitignore patterns to glob patterns
- Parse .gitignore file lines into GitignoreRule objects
- Apply last-match-wins semantics when checking files
- Skip comments (#) and blank lines

#### 1.3 Implement GitignoreHandler Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignoreHandler.kt`
- Discover all .gitignore files in project tree
- Load and cache patterns at initialization
- Check if file should be ignored by applying rules from root to file's parent
- Handle nested .gitignore files (child rules override parent)
- Track statistics (excluded file count, .gitignore file paths)

### 2. Integrate with ProjectScanner

Modify ProjectScanner to use GitignoreHandler for file exclusion.

#### 2.1 Update Constructor
- Add `useGitignore: Boolean = true` parameter
- Initialize GitignoreHandler when enabled

#### 2.2 Modify isParsableFile()
- Add gitignore check before other exclusion checks
- Order: gitignore → patternsToExclude → extension check

#### 2.3 Add Statistics Method
- Implement `getGitIgnoreStatistics()` returning excluded count and .gitignore file list

### 3. Add CLI Support to UnifiedParser

Add command-line parameter for gitignore control.

#### 3.1 Add CLI Parameter
- `--respect-gitignore` (negatable, default: true)
- Allows `--no-respect-gitignore` to disable

#### 3.2 Update scanInputProject()
- Pass `respectGitignore` flag to ProjectScanner
- Report gitignore statistics to stderr after scan
- Include .gitignore file paths in verbose mode

### 4. Add Interactive Dialog Support

Add gitignore question to interactive mode.

#### 4.1 Add Dialog Question
- Location: `Dialog.kt`
- Ask "Should .gitignore files be respected?" (default: yes)
- Add `--no-respect-gitignore` to args if user selects "no"

### 5. Write Comprehensive Tests

#### 5.1 Unit Tests for GitignorePatternMatcher
- Location: `GitignorePatternMatcherTest.kt`
- Test wildcard patterns (`*.log`)
- Test directory-only patterns (`build/`)
- Test rooted vs non-rooted patterns
- Test negation patterns (`!important.log`)
- Test rule ordering (last match wins)

#### 5.2 Unit Tests for GitignoreHandler
- Location: `GitignoreHandlerTest.kt`
- Test discovery of multiple .gitignore files
- Test nested gitignore rule application
- Test error handling (missing files, malformed patterns)
- Test statistics tracking

#### 5.3 Integration Tests for ProjectScanner
- Test gitignore exclusion when enabled
- Test no exclusion when disabled
- Test combination of gitignore + patternsToExclude

#### 5.4 Create Test Resources
- Location: `test/resources/gitignore-test-project/`
- Sample .gitignore files (root and nested)
- Test file structure with various ignore scenarios

#### 5.5 End-to-End Tests
- Test complete UnifiedParser flow with real project structure
- Verify CLI parameters work correctly
- Verify statistics reporting

### 6. Update Documentation

#### 6.1 Update README
- Document gitignore support
- Show usage examples
- Explain how to disable

#### 6.2 Update CHANGELOG
- Add entry for gitignore feature

#### 6.3 Update Architecture Docs
- Document new components in UNIFIED_PARSER_ARCHITECTURE.md

## Steps

- [ ] Complete Task 1.1: Create GitignoreRule data class
- [ ] Complete Task 1.2: Implement GitignorePatternMatcher class
- [ ] Complete Task 1.3: Implement GitignoreHandler class
- [ ] Complete Task 2.1: Update ProjectScanner constructor
- [ ] Complete Task 2.2: Modify isParsableFile() method
- [ ] Complete Task 2.3: Add getGitIgnoreStatistics() method
- [ ] Complete Task 3.1: Add CLI parameter to UnifiedParser
- [ ] Complete Task 3.2: Update scanInputProject() with statistics reporting
- [ ] Complete Task 4.1: Add gitignore question to Dialog
- [ ] Complete Task 5.1: Write GitignorePatternMatcher unit tests
- [ ] Complete Task 5.2: Write GitignoreHandler unit tests
- [ ] Complete Task 5.3: Write ProjectScanner integration tests
- [ ] Complete Task 5.4: Create test resources
- [ ] Complete Task 5.5: Write end-to-end tests
- [ ] Complete Task 6.1: Update README
- [ ] Complete Task 6.2: Update CHANGELOG
- [ ] Complete Task 6.3: Update architecture documentation

## Review Feedback Addressed

(To be filled in after review)

## Notes

### Design Decisions
- **Zero Dependencies**: Using Java's built-in PathMatcher API instead of JGit to avoid ~5-10 MB dependency
- **Default Enabled**: Gitignore processing is enabled by default for better UX
- **Backward Compatible**: Existing `patternsToExclude` continues to work and combines with gitignore
- **Performance**: Load .gitignore files once at initialization, use compiled PathMatcher patterns

### Gitignore Pattern Support (Per Git Specification)

**Wildcards:**
- `*` - matches anything except `/`
- `**` - special behavior for directory matching:
  - Leading `**/` - matches in all directories (e.g., `**/foo` matches `foo` anywhere)
  - Trailing `/**` - matches everything inside (e.g., `abc/**` matches all in `abc/`)
  - Middle `/**/` - matches zero or more directories (e.g., `a/**/b` matches `a/b`, `a/x/b`, etc.)
- `?` - matches single character except `/`
- `[a-z]` - character ranges (bracket notation for matching character sets)

**Special Characters:**
- `!` prefix - negation (re-include previously excluded files). Note: cannot re-include if parent directory excluded
- `#` - comment line (ignored)
- Backslash escaping:
  - `\#` - literal hash character
  - `\!` - literal exclamation mark
  - `\ ` (backslash-space) - preserve trailing spaces
- Trailing spaces - ignored unless quoted with backslash

**Directory Separators (`/`):**
- `/` at end - directory-only matching (e.g., `build/` matches only directories)
- `/` at beginning OR in middle - pattern is relative to .gitignore location (not matched at any depth)
- No `/` - pattern matches at any depth below .gitignore level

### Implementation Details
- Apply rules in order with last-match-wins semantics
- Child .gitignore rules override parent rules for that subtree
- Parse lines without trimming (to preserve backslash-escaped trailing spaces)
- Handle backslash escaping before pattern parsing (`\#`, `\!`, `\ `)
- Don't escape square brackets `[]` (valid in both gitignore and glob)
- Only escape curly braces `{}` (different meaning in glob)
- Distinguish patterns with `/` in middle (rooted) vs no `/` (matches at any depth)
- Log warnings for malformed patterns but continue processing
- Handle permission errors gracefully
- Thread-safe for parallel processing

### Testing Strategy
- Unit tests for individual components
- Integration tests for component interaction
- End-to-end tests with real project structures
- Test all gitignore pattern types
- Test nested .gitignore hierarchy
- Test error handling and edge cases

### Future Enhancements (Out of Scope)
- Global .gitignore support (`~/.gitignore_global`)
- `.git/info/exclude` support
- Custom gitignore path option
- Detailed exclusion statistics per .gitignore file
