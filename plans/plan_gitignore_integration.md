---
name: Gitignore File Exclusion for UnifiedParser
issue: TBD
state: todo
version: TBD
---

## Goal

Add automatic file exclusion based on .gitignore files to the UnifiedParser, making gitignore rules the default exclusion mechanism with automatic fallback to BUILD_FOLDERS when no .gitignore files exist. Explicit `-e/--exclude` patterns are always applied in addition to the active exclusion method.

## Tasks

UnifiedParser currently uses regex patterns (via `-e/--exclude` flag) to exclude files/folders. This feature changes the default to use .gitignore files from the project tree. If no .gitignore files are found, it automatically falls back to BUILD_FOLDERS exclusion (current behavior). The `--bypass-gitignore` flag forces BUILD_FOLDERS exclusion without attempting gitignore discovery. When `-e/--exclude` patterns are explicitly provided, they are always applied as additional exclusions regardless of which method is active.

### 1. Implement Gitignore Pattern Matcher
- Follow the separate plan in `plan_gitignore_matcher.md`
- Create GitignoreRule, GitignorePatternMatcher, and GitignoreHandler classes
- Ensure zero-dependency implementation using Java's PathMatcher
- Write comprehensive tests for pattern matching logic

### 2. Integrate GitignoreHandler into ProjectScanner
- Initialize GitignoreHandler in ProjectScanner constructor with project root (when gitignore enabled)
- Modify `isPathExcluded()` to check: (gitignore rules OR BUILD_FOLDERS regex) + explicit `-e` patterns
- Default behavior: Try gitignore discovery. If no .gitignore files found, fall back to BUILD_FOLDERS
- With `--bypass-gitignore`: Skip gitignore discovery, use BUILD_FOLDERS directly (if `!includeBuildFolders`)
- Explicit `-e/--exclude` patterns are ALWAYS applied when provided, regardless of flag or fallback
- Handle gitignore initialization errors gracefully (log warnings, fall back to BUILD_FOLDERS exclusion)
- Log fallback to BUILD_FOLDERS when no .gitignore files found (verbose mode)

### 3. Add CLI Options for Gitignore Control
- Add flag to UnifiedParser: `--bypass-gitignore` (default: false)
- When set to true, skips gitignore discovery and uses BUILD_FOLDERS exclusion directly
- `-e/--exclude` patterns work with or without the flag (always applied when provided)
- Document flag in help text explaining gitignore discovery with automatic BUILD_FOLDERS fallback

### 4. Update ProjectScanner Logic
- Pass gitignore flag from UnifiedParser to ProjectScanner
- Conditionally initialize GitignoreHandler based on flag
- Implement fallback logic: if GitignoreHandler finds no .gitignore files, switch to BUILD_FOLDERS exclusion
- Maintain existing verbose logging for excluded files
- Add logging for gitignore discovery and fallback behavior (verbose mode)

### 5. Write Integration Tests
- Test gitignore discovery and application in real project structure (default behavior)
- Test fallback to BUILD_FOLDERS when no .gitignore files exist (should match old behavior)
- Test with nested .gitignore files (child rules override parent)
- Test `--bypass-gitignore` flag skips gitignore discovery and uses BUILD_FOLDERS directly
- Test that `-e/--exclude` patterns work with gitignore (combined exclusion)
- Test that `-e/--exclude` patterns work with BUILD_FOLDERS fallback (combined exclusion)
- Test that `-e/--exclude` patterns work with `--bypass-gitignore` (combined with BUILD_FOLDERS)
- Test that explicit `-e` patterns are always applied regardless of flag or fallback state

### 6. Update Documentation
- Update UnifiedParser help text explaining new default behavior (gitignore with BUILD_FOLDERS fallback)
- Document that `-e/--exclude` patterns are always applied as additional exclusions
- Add examples showing gitignore + explicit `-e` patterns
- Document automatic fallback to BUILD_FOLDERS when no .gitignore exists
- Document `--bypass-gitignore` flag to force BUILD_FOLDERS exclusion (skip gitignore discovery)
- Update README and CHANGELOG noting behavior change (mostly backward compatible due to fallback)

## Steps

- [ ] Complete Task 1: Implement gitignore pattern matcher (see plan_gitignore_matcher.md)
- [ ] Complete Task 2: Integrate GitignoreHandler into ProjectScanner
- [ ] Complete Task 3: Add CLI options for gitignore control
- [ ] Complete Task 4: Update ProjectScanner logic
- [ ] Complete Task 5: Write integration tests
- [ ] Complete Task 6: Update documentation

## Review Feedback Addressed

(To be filled in after review)

## Notes

- **Mostly backward compatible**: Automatic fallback to BUILD_FOLDERS when no .gitignore exists
- Exclusion logic: (gitignore OR BUILD_FOLDERS) + explicit `-e` patterns
- Default behavior (no flags):
  - If .gitignore files found: use gitignore rules
  - If no .gitignore found: fall back to BUILD_FOLDERS (old behavior)
- With `-e` patterns: base exclusion (gitignore or BUILD_FOLDERS) + explicit `-e` patterns (combined)
- With `--bypass-gitignore`: Skip gitignore discovery, use BUILD_FOLDERS directly (if `!includeBuildFolders`)
- With `--bypass-gitignore` + `-e`: BUILD_FOLDERS + explicit `-e` patterns
- **Explicit `-e/--exclude` patterns are ALWAYS applied when provided**, regardless of flags or fallback
- Error handling: if gitignore discovery fails (errors), fall back to BUILD_FOLDERS exclusion and log warning
- Fallback handling: if gitignore discovery succeeds but finds no files, fall back to BUILD_FOLDERS
- Performance: GitignoreHandler loads .gitignore files once at initialization
- Breaking change impact: Only affects projects WITH .gitignore files that want BUILD_FOLDERS exclusion (need `--bypass-gitignore`)
- Migration: Projects WITHOUT .gitignore continue working exactly as before (automatic fallback)
- Migration: Users already using `-e/--exclude` patterns don't need changes (patterns still work)
- Existing `--include-build-folders` flag still controls BUILD_FOLDERS exclusion (applies to fallback and bypass modes)
- ProjectScanner.isPathExcluded() is the main integration point
- Log gitignore discovery, fallback, and bypass in verbose mode for transparency
