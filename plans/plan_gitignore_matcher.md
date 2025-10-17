---
name: Custom Gitignore Pattern Matcher
issue: TBD
state: todo
version: TBD
---

## Goal

Implement a zero-dependency gitignore pattern matcher using Java's PathMatcher API for UnifiedParser, avoiding JGit dependency (~5-10 MB) while supporting nested .gitignore files and standard gitignore pattern rules.

## Tasks

Gitignore patterns use wildcards (`*`, `**`, `?`), negation (`!`), directory-only matching (`/` suffix), and rooted patterns (`/` prefix). Nested .gitignore files override parent rules. Implementation uses Java's PathMatcher to convert gitignore patterns to glob patterns.

### 1. Create GitignoreRule Data Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignoreRule.kt`
- Data class representing a parsed gitignore pattern
- Fields: pattern, isNegation, isDirOnly, isRooted, pathMatcher
- Stores the compiled PathMatcher for efficient matching

### 2. Implement GitignorePatternMatcher Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignorePatternMatcher.kt`
- Convert gitignore patterns to glob patterns (extract flags, convert rooted/non-rooted)
- Parse .gitignore file lines into GitignoreRule objects
- Check if file matches patterns using last-match-wins semantics
- Skip comments and blank lines

### 3. Implement GitignoreHandler Class
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignoreHandler.kt`
- Discover all .gitignore files in project tree
- Load and parse .gitignore files using GitignorePatternMatcher
- Check if file should be ignored by applying rules from root to file's parent
- Handle nested .gitignore files (child rules override parent)

### 4. Write Unit Tests for GitignorePatternMatcher
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignorePatternMatcherTest.kt`
- Test wildcard patterns (`*.log`)
- Test directory-only patterns (`build/`)
- Test rooted vs non-rooted patterns
- Test negation patterns (`!important.log`)
- Test rule ordering (last match wins)

### 5. Write Integration Tests for GitignoreHandler
- Location: `analysis/analysers/parsers/UnifiedParser/.../gitignore/GitignoreHandlerTest.kt`
- Test discovery of multiple .gitignore files
- Test nested gitignore rule application
- Test error handling (missing files, malformed patterns)

### 6. Create Test Resources
- Location: `test/resources/gitignore-test-project/`
- Sample .gitignore files (root and nested)
- Test file structure demonstrating various ignore scenarios

## Steps

- [ ] Complete Task 1: Create GitignoreRule data class
- [ ] Complete Task 2: Implement GitignorePatternMatcher class
- [ ] Complete Task 3: Implement GitignoreHandler class
- [ ] Complete Task 4: Write unit tests for GitignorePatternMatcher
- [ ] Complete Task 5: Write integration tests for GitignoreHandler
- [ ] Complete Task 6: Create test resources

## Review Feedback Addressed

(To be filled in after review)

## Notes

- Use Java's built-in PathMatcher API to avoid adding JGit (~5-10 MB) as dependency
- Load .gitignore files once at initialization for performance
- Use compiled PathMatcher patterns for efficient matching
- Skip comments (`#`) and blank lines when parsing
- Log warnings for malformed patterns, continue processing
- Handle permission errors gracefully
- Gitignore pattern reference: `*` (anything except `/`), `**` (zero or more directories), `?` (single char except `/`), `!` (negation), `/` suffix (directory-only), `/` prefix (rooted)
- Apply gitignore rules in order with last-match-wins semantics (standard gitignore behavior)
- Child .gitignore rules override parent rules for that subtree
