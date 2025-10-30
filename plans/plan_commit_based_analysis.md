---
name: Multi-Commit Analysis Feature
issue: 4274
state: todo
version: 1.0
---

## Goal

Enable users to generate CodeCharta maps for multiple commits in a single command, making it easier to compare how the codebase evolved over time using GitLogParser, UnifiedParser, or RawTextParser.

## Architecture Decision: Wrapper/Orchestrator Approach

Create a **new Tool** called `MultiCommitAnalyser` that orchestrates existing parsers rather than modifying each parser individually.

**Rationale:**
- Single source of truth for Git operations
- No code duplication across multiple parsers
- Easier to extend to future parsers
- Follows separation of concerns and pipes-and-filters architecture
- Simpler testing and maintenance

## Tasks

### 1. Create Module Structure
- Create new Gradle module in `analysis/analysers/tools/MultiCommitAnalyser/`
- Set up dependencies: AnalyserInterface, dialogProvider, model, picocli, kotter
- Register module in `settings.gradle.kts`
- Register tool in `Ccsh.kt` subcommands list

### 2. Implement GitOperations Utility
- Check Git installation (`git --version`)
- Check if directory is Git repo (`.git` folder exists)
- Validate commits exist and resolve to short SHAs (`git rev-parse --short=7 <commit>`)
- Get current HEAD state (`git rev-parse HEAD` or `git symbolic-ref HEAD`)
- Stash operations (`git stash push -u -m "CodeCharta MultiCommit temporary stash - <timestamp>"`, `git stash pop`)
- Checkout commits (`git checkout <commit>`)
- Restore original state (checkout original branch/SHA)
- Handle detached HEAD states
- Use ProcessBuilder pattern from GitAdapter

### 3. Implement ParserExecutor
- Receive parser name, parsed arguments, and commit SHA from MultiCommitAnalyser
- Validate parser name exists in Picocli's subcommand registry (any parser currently in the analysers/parsers/ folder)
- Check if parsed arguments contain `--output` or `-o` flag:
  - If present: Show warning that it will be ignored, remove it from parser arguments
  - Warning message: "Warning: --output flag in parser string will be ignored. Use --output at multicommit level instead."
- Inject output parameter: Add `--output <short-commit-sha>_<base-filename>` to parser arguments (use first 7 characters of commit SHA)
- Before invoking parser: Log message "Executing [parser-name] for commit [short-commit-sha]..." using Logger
- Invoke parser using Picocli's subcommand lookup and `CommandLine.execute()` with modified arguments
  - Parser's stdout, stderr, and Logger output will pass through to console automatically
  - Progress bars and real-time output from parser will display normally
- Handle parser errors and exit codes

### 4. Implement MultiCommitAnalyser Tool
- CLI parameters:
  - `--commits`: Comma-separated list of commit SHAs/refs
  - `--output`: Base output filename (optional); if provided, each commit generates `<short-commit-sha>_<filename>`. If not provided, output to stdout in format `<short-commit-sha>:<json-content>`
  - `--parser`: Quoted parser string containing parser name and its arguments, WITHOUT --output flag (e.g., "unified --file-extensions=java,kt")
  - `--stash`: Optional flag to stash/restore uncommitted changes
- Validation workflow:
  - Check Git installation
  - Check is Git repository
  - Check working directory is clean (or --stash provided)
  - Check for piped input: If stdin is being piped, show warning "Piped input is not yet supported by multicommit" and exit
  - Validate all commits can be resolved to SHAs using `git rev-parse`:
    - If commit cannot be resolved: Show error "Commit '<commit>' does not exist in the repository"
    - If resolved ref is not a commit SHA (e.g., tag to tree): Show warning or error
  - Resolve all commit identifiers to short SHAs (first 7 characters)
- Output handling:
  - **File output mode** (when `--output` is provided):
    - If output filename doesn't end with `.cc.json`, append it (same behavior as other analysers)
    - Parse output path to separate directory path and filename:
      - If path contains directory (e.g., `./output/file.cc.json` or `/abs/path/file.cc.json`): Preserve directory, prefix only the filename with commit SHA
      - If only filename provided (e.g., `file.cc.json`): Save in current working directory with commit SHA prefix
      - Result: `<directory>/<commit-sha>_<filename>` or `<commit-sha>_<filename>` if no directory
    - Ensure output path handling is consistent with other analysers
  - **Stdout mode** (when `--output` is NOT provided):
    - Output each commit's JSON to stdout in format: `<short-commit-sha>:<json-content>`
    - Each line contains one complete cc.json output prefixed with its commit SHA
    - This allows piping to other tools or processing multiple results sequentially
- Parser string parsing:
  - Parse parser string to extract parser name and arguments
  - Handle shell quoting/escaping properly
  - Pass parser name and arguments to ParserExecutor
- Main execution loop:
  - Store original Git state
  - Stash if requested
  - For each commit:
    - Checkout commit
    - Call ParserExecutor with parser name, arguments, short commit SHA, and base output filename
    - Stop on first parser error (fail-fast)
  - Restore original Git state (checkout original branch)
  - Restore stash if applied (ensure stash is popped after returning to original branch to avoid conflicts)
- Error handling with cleanup (always restore Git state on failure)

### 5. Implement Dialog for Interactive Mode
- Prompt for comma-separated commit list
- Prompt for base output filename
- Prompt for parser string (e.g., "unified --file-extensions=java,kt")
- Optionally: Provide parser selection first, then build parser string interactively
- Prompt for stash option (yes/no)
- Display final command that will be executed for review (show example output filenames)

### 6. Write Tests
- GitOperations unit tests
  - Mock ProcessBuilder for Git command execution
  - Test validation methods
  - Test state restoration
- ParserExecutor unit tests
  - Test output parameter injection with short commit SHA prefix (7 characters)
  - Test warning when --output flag found in parser arguments
  - Test removal of --output/-o from parser arguments if present
  - Verify correct parser invocation with injected output
  - Test argument pass-through
- MultiCommitAnalyser integration tests
  - Test full workflow with temporary Git repo
  - Test multiple commits with various formats (SHAs, HEAD~n, tags, branches)
  - Test commit resolution to short SHAs (7 characters)
  - Test each supported parser with parser strings
  - Test parser string parsing edge cases (quotes, special characters)
  - **File output mode tests**:
    - Test that --output at multicommit level works correctly
    - Test .cc.json extension handling (append if missing)
    - Test path handling:
      - Filename only: saves in CWD with commit prefix
      - Relative path: preserves directory, prefixes filename
      - Absolute path: preserves directory, prefixes filename
  - **Stdout mode tests**:
    - Test output format: `<short-commit-sha>:<json-content>`
    - Test multiple commits produce multiple lines
    - Verify each line contains valid JSON after the colon
    - Verify commit SHAs are correct (7 characters)
  - Test warning displayed when --output in parser string
  - Test piped input detection and warning
- Error handling tests
  - Invalid commits that cannot be resolved
  - Tags/refs that don't point to commits
  - Invalid parser name in parser string
  - Malformed parser strings
  - Dirty working directory without --stash
  - Git not installed
  - Not a Git repository
  - Checkout failures
  - Piped input provided
- State restoration tests
  - Verify original branch/commit restored on success
  - Verify original state restored on failure
  - Verify stash restored correctly

### 7. Update Documentation
- Add entry to CHANGELOG.md following keepachangelog.com format
- Update tool's help text and description
- Add example usage to documentation

## Steps

- [x] Complete Task 1: Create Module Structure
- [ ] Complete Task 2: Implement GitOperations Utility
- [ ] Complete Task 3: Implement ParserExecutor
- [ ] Complete Task 4: Implement MultiCommitAnalyser Tool
- [ ] Complete Task 5: Implement Dialog for Interactive Mode
- [ ] Complete Task 6: Write Tests
- [ ] Complete Task 7: Update Documentation

## Acceptance Criteria

✅ CLI accepts `--commits` flag with comma-separated commit IDs\
✅ CLI accepts `--output` flag for base output filename (optional)\
✅ CLI accepts `--parser` flag with quoted parser string (without --output)\
✅ Exit with error "Git is not installed on the system" if Git not available\
✅ Exit with error if not a Git repository\
✅ Exit with error if one or more commits cannot be resolved\
✅ Exit with warning "Piped input is not yet supported by multicommit" if piped input detected\
✅ Exit with error if checkout fails\
✅ Exit with error if parser name in parser string is invalid\
✅ **File output mode**: Generate map for each commit with `<short-commit-sha>_<output>.cc.json` naming (short SHA = first 7 characters)\
✅ **Stdout mode**: When `--output` is not provided, output to stdout in format `<short-commit-sha>:<json-content>` for each commit\
✅ Resolve all commit identifiers (tags, branches, HEAD~n, etc.) to short commit SHAs\
✅ Append `.cc.json` to output filename if not already present (same behavior as other analysers) - only in file output mode\
✅ Support any parser currently in the analysers/parsers/ folder via parser string\
✅ Restore original Git state after completion (success or failure)\
✅ Block execution with error on dirty working directory, mentioning `--stash` flag\
✅ Optional `--stash` flag to stash and restore uncommitted changes\
✅ **Warning on redundant --output**: If --output appears in parser string, show warning and ignore it\
✅ **All parser-specific parameters available**: Every parameter (except --output) that works with the standalone parser must work identically when passed via parser string\
✅ **Clear parameter separation**: Users can easily distinguish between MultiCommitAnalyser parameters and parser parameters

## CLI Usage Examples

```bash
# Basic usage with UnifiedParser - file output mode
ccsh multicommit --commits abc123,def456 --output myproject.cc.json --parser "unified --file-extensions=java,kt"
# Generates: abc1234_myproject.cc.json, def4567_myproject.cc.json

# Stdout mode - output to stdout instead of files
ccsh multicommit --commits abc123,def456 --parser "unified --file-extensions=java,kt"
# Output:
# abc1234:{"nodes":[...],...}
# def4567:{"nodes":[...],...}

# With RawTextParser and all its parameters
ccsh multicommit --commits HEAD~3,HEAD~2,HEAD~1 --output raw.cc.json --parser "rawtextparser --max-indentation-level=10"

# With GitLogParser, stash, and GitLogParser-specific parameters
ccsh multicommit --commits abc123,def456 --output git.cc.json --stash --parser "gitlogparser --add-author --git-directory=./src"

# All parser parameters (except --output) work identically within the parser string
ccsh multicommit --commits v1.0,v2.0 --output release.cc.json --parser "unified --exclude='**/test/**' --compress"

# Using single or double quotes for the parser string
ccsh multicommit --commits abc123,def456 --output myproject.cc.json --parser 'unified'

# With tags/branches (resolved to short commit SHAs):
ccsh multicommit --commits v1.0,v2.0,main --output release.cc.json --parser "unified"
# Output: a1b2c3d_release.cc.json, e4f5g6h_release.cc.json, i7j8k9l_release.cc.json

# Piping stdout mode to another tool for processing
ccsh multicommit --commits abc123,def456 --parser "unified" | while IFS=: read -r commit json; do
  echo "Processing commit $commit"
  echo "$json" | jq '.nodes | length'
done

# If --output is mistakenly included in parser string, a warning is shown:
ccsh multicommit --commits abc123 --output project.cc.json --parser "unified --output wrong.cc.json"
# Warning: --output flag in parser string will be ignored. Use --output at multicommit level instead.
# Generates: abc1234_project.cc.json (not abc1234_wrong.cc.json)

# Extension handling (appends .cc.json if missing):
ccsh multicommit --commits abc123,def456 --output myproject --parser "unified"
# Generates: abc1234_myproject.cc.json, def4567_myproject.cc.json

# Path handling - only filename is prefixed, directory preserved:
ccsh multicommit --commits abc123,def456 --output ./output/project.cc.json --parser "unified"
# Generates: ./output/abc1234_project.cc.json, ./output/def4567_project.cc.json

ccsh multicommit --commits abc123,def456 --output /tmp/results/analysis.cc.json --parser "unified"
# Generates: /tmp/results/abc1234_analysis.cc.json, /tmp/results/def4567_analysis.cc.json

# Clear parameter boundaries:
# └─ multicommit params (incl. output) ─┘  └─── parser string ───┘
```

## Component Structure

```
analysis/analysers/tools/MultiCommitAnalyser/
├── build.gradle.kts
└── src/
    ├── main/kotlin/de/maibornwolff/codecharta/analysers/tools/multicommit/
    │   ├── MultiCommitAnalyser.kt    (main tool, CLI)
    │   ├── Dialog.kt                  (interactive mode)
    │   ├── GitOperations.kt           (checkout, validation, state management)
    │   └── ParserExecutor.kt          (invoke parsers programmatically)
    └── test/kotlin/de/maibornwolff/codecharta/analysers/tools/multicommit/
        ├── MultiCommitAnalyserTest.kt
        ├── GitOperationsTest.kt
        ├── ParserExecutorTest.kt
        └── DialogTest.kt
```

## Notes

- Use ProcessBuilder pattern from GitAdapter for Git command execution
- Set timeout (3 minutes) for Git operations to prevent hanging
- Handle detached HEAD states gracefully
- Fail-fast approach: Stop on first parser error rather than continuing to remaining commits
- Git stash includes untracked files (`git stash push -u`) to ensure clean working directory
- Stash message includes timestamp for better identification: "CodeCharta MultiCommit temporary stash - <timestamp>"
- Use `git rev-parse --short=7` to resolve commit identifiers to short SHAs (7 characters)
- Error messages should be clear and actionable
- Follow existing error handling patterns with Logger.error/warn/info
- **Commit SHA resolution**:
  - All commit identifiers (SHAs, tags, branches, HEAD~n, etc.) are resolved to short SHAs (first 7 characters)
  - If a commit identifier cannot be resolved, show error and exit
  - Short SHAs are used for output filename prefixes
- **Piped input handling**:
  - MultiCommit does not support piped input (since it generates multiple output files or stdout entries)
  - Detect piped input at startup and show warning: "Piped input is not yet supported by multicommit"
- **Parser string parsing**: Simple string splitting with quote handling (can use standard shell-like parsing or build custom)
- **Parser output handling**:
  - Before each parser execution: Log "Executing [parser-name] for commit [short-commit-sha]..." using Logger
  - Parser stdout, stderr, and Logger output pass through to console automatically via Picocli's `CommandLine.execute()`
  - Progress bars and real-time output from parsers display normally
  - This allows users to see which commit is being processed and monitor parser progress
- **Output parameter handling**:
  - `--output` is OPTIONAL and specified at MultiCommit level, NOT in parser string
  - **File output mode** (when `--output` provided):
    - Path handling: Only the filename component is prefixed with commit SHA, directory path is preserved
      - Example: `./output/file.cc.json` → `./output/abc1234_file.cc.json`, `./output/def5678_file.cc.json`
      - Example: `file.cc.json` → `abc1234_file.cc.json`, `def5678_file.cc.json` (saved in CWD)
      - Example: `/abs/path/file.cc.json` → `/abs/path/abc1234_file.cc.json`, `/abs/path/def5678_file.cc.json`
    - MultiCommit injects `--output <directory>/<short-commit-sha>_<filename>` into parser arguments
    - Extension handling: Append `.cc.json` if not already present (same behavior as other analysers)
  - **Stdout mode** (when `--output` NOT provided):
    - Each parser is invoked WITHOUT `--output` flag, causing it to write to stdout
    - MultiCommit captures each parser's stdout output
    - MultiCommit writes to its own stdout in format: `<short-commit-sha>:<json-content>`
    - Each commit's output is on a single line for easy parsing
  - If --output found in parser string: Log warning, remove it, use MultiCommit's --output mode instead
  - Detection: Check for both `--output` and `-o` variants
- **Quote handling**: Support both single and double quotes in parser string, handle escaped quotes if needed
- **Git state restoration**:
  - Always restore original Git state (branch/commit) even on failure
  - Stash is popped AFTER returning to original branch to avoid conflicts
- **Simpler implementation**:
  - Parser string approach eliminates need for Picocli `@Unmatched` annotation tricks
  - No complex regex for output parameter replacement
  - Clean injection of output parameter by MultiCommit
- **Better UX**:
  - Clear visual separation between MultiCommitAnalyser parameters and parser invocation
  - Explicit control of output naming at the orchestration level
  - Principle of least surprise: Tool that manages multiple outputs controls naming
- **Scope rationale**: Using `--parser` (not `--analyser`) is semantically accurate since only parsers (not importers/filters) operate on commit-specific code state
