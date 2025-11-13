---
name: Refactor MetricThresholdChecker to Use UnifiedParser
issue: TBD
state: complete
version: 1.0
---

## Goal

Fix the architectural issue where MetricThresholdChecker duplicates UnifiedParser's scanning logic. MetricThresholdChecker should use UnifiedParser as a library to analyze code, then validate the resulting Project against thresholds.

## Current Problem

**Current architecture (wrong):**
```
MetricThresholdChecker
  ├─> ProjectScanner (direct usage, duplicated logic)
  ├─> Manually add AttributeDescriptors (easy to forget)
  └─> Validate thresholds
```

**Why this is wrong:**
1. Code duplication between MetricThresholdChecker and UnifiedParser
2. Bug: AttributeDescriptors weren't being added (fixed with workaround)
3. Any improvements to UnifiedParser don't benefit MetricThresholdChecker
4. Two places to maintain the same scanning logic
5. MetricThresholdChecker should be a consumer of UnifiedParser, not reimplementing it

## Correct Architecture

**Target architecture:**
```
MetricThresholdChecker
  └─> UnifiedParser.parse(file, options) → Project
      └─> ProjectScanner (internal implementation)
      └─> Returns complete Project with metrics + AttributeDescriptors
  └─> ThresholdValidator validates Project
  └─> ViolationFormatter reports violations
```

## Benefits

1. **Single source of truth** - UnifiedParser owns all analysis logic
2. **No duplication** - MetricThresholdChecker doesn't reimplement scanning
3. **Automatic improvements** - Any UnifiedParser enhancements benefit MetricThresholdChecker
4. **Can't forget descriptors** - UnifiedParser always includes them
5. **Clearer separation** - Parser vs Validator responsibilities
6. **Reusable** - Other tools can also use UnifiedParser as a library

## Tasks

### 1. Extract UnifiedParser Public API

Create a public method in UnifiedParser that can be called programmatically:

```kotlin
// In UnifiedParser.kt
companion object {
    /**
     * Parse source code files and generate metrics.
     *
     * @param inputFile File or directory to analyze
     * @param excludePatterns Regex patterns to exclude files/folders
     * @param fileExtensions File extensions to analyze (empty = all)
     * @param bypassGitignore Whether to bypass .gitignore files
     * @param verbose Enable verbose output
     * @return Project with all metrics and attribute descriptors
     */
    fun parse(
        inputFile: File,
        excludePatterns: List<String> = emptyList(),
        fileExtensions: List<String> = emptyList(),
        bypassGitignore: Boolean = false,
        verbose: Boolean = false
    ): Project {
        // Call the current private scanInputProject logic
        // Or extract it to a shared implementation
    }
}
```

### 2. Refactor UnifiedParser Internals

Extract `scanInputProject()` logic so it can be:
- Called from the CLI `call()` method
- Called from the public `parse()` method
- Properly handles all the parameters

Options:
- Make `scanInputProject()` public (simplest)
- Create a separate `UnifiedParserService` class (cleaner)
- Make UnifiedParser instance-based with configuration (most flexible)

**Recommendation:** Make a static `parse()` method that instantiates UnifiedParser internally with the right config.

### 3. Update MetricThresholdChecker

Replace ProjectScanner usage with UnifiedParser:

**Before:**
```kotlin
private fun analyzeProject(inputPath: File): Project {
    val projectBuilder = ProjectBuilder()
    val projectScanner = ProjectScanner(
        inputPath, projectBuilder, excludePatterns,
        fileExtensions, emptyMap(), useGitignore
    )
    projectScanner.traverseInputProject(verbose)
    projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
    return projectBuilder.build()
}
```

**After:**
```kotlin
private fun analyzeProject(inputPath: File): Project {
    return UnifiedParser.parse(
        inputFile = inputPath,
        excludePatterns = excludePatterns,
        fileExtensions = fileExtensions,
        bypassGitignore = bypassGitignore,
        verbose = verbose
    )
}
```

### 4. Remove Workaround Code

Remove the manual `addAttributeDescriptions()` call we added as a workaround - UnifiedParser.parse() will always include them.

### 5. Update Tests

- Update MetricThresholdChecker tests to verify it uses UnifiedParser
- Add tests for the new UnifiedParser.parse() public API
- Ensure attribute descriptors are always present (can't be forgotten)

### 6. Update Dependencies

Ensure MetricThresholdChecker's build.gradle.kts properly depends on UnifiedParser module.

## Implementation Steps

- [ ] Step 1: Create UnifiedParser.parse() public static method
- [ ] Step 2: Extract shared scanning logic (avoid duplication with call() method)
- [ ] Step 3: Add tests for UnifiedParser.parse() method
- [ ] Step 4: Update MetricThresholdChecker.analyzeProject() to use UnifiedParser.parse()
- [ ] Step 5: Remove the manual addAttributeDescriptions() workaround
- [ ] Step 6: Run all tests to verify behavior is unchanged
- [ ] Step 7: Update documentation if needed

## Migration Path

1. **Phase 1** (this refactor): Make UnifiedParser.parse() available but keep existing code
2. **Phase 2**: Update MetricThresholdChecker to use new API
3. **Phase 3**: Verify tests pass and behavior unchanged
4. **Phase 4**: Remove old duplicated code

## Testing Strategy

- Unit tests for UnifiedParser.parse() with various configurations
- Integration tests verifying MetricThresholdChecker still works correctly
- Test that AttributeDescriptors are always present (regression test for original bug)
- Test with exclude patterns, file extensions, verbose mode, gitignore options

## Risks & Considerations

### Risk: Breaking Changes
If other code depends on UnifiedParser internals, this could break them.
**Mitigation:** Make the new API additive - don't remove anything yet.

### Risk: Performance
If UnifiedParser.parse() creates unnecessary overhead.
**Mitigation:** Measure performance before/after with benchmarks.

### Risk: Configuration Complexity
UnifiedParser has many options (baseFileNodes, merge logic, etc).
**Mitigation:** Start with simple API, add options as needed. Most MetricThresholdChecker doesn't need piping/merging.

## Alternative Approaches Considered

### Alternative 1: Keep Current Code (rejected)
Continue using ProjectScanner directly and manually manage AttributeDescriptors.
**Rejected because:** Code duplication, maintenance burden, already caused bugs.

### Alternative 2: Extract Shared Service (considered)
Create a `CodeAnalysisService` both tools use.
**Not chosen because:** UnifiedParser already exists and is the natural owner of this logic.

### Alternative 3: Make ProjectScanner Smarter (rejected)
Have ProjectScanner automatically add AttributeDescriptors.
**Rejected because:** ProjectScanner is lower-level infrastructure. AttributeDescriptors are UnifiedParser's responsibility.

## Future Enhancements

Once this refactoring is done:
- Other tools can use UnifiedParser.parse() as a library
- Easier to add new analysis tools
- Could create a `CodeMetricsService` facade for even simpler usage
- Could support streaming/incremental analysis

## Notes

### Why This Bug Happened

The original bug (missing descriptions) happened because:
1. MetricThresholdChecker duplicated UnifiedParser logic
2. The AttributeDescriptor registration step was easy to miss
3. No forcing function to ensure descriptors are included

This refactoring makes the bug impossible by ensuring UnifiedParser always provides complete Projects.

### Principle: DRY (Don't Repeat Yourself)

This refactoring follows the DRY principle:
- Single source of truth for code analysis
- Reuse instead of duplicate
- Easier to maintain and extend
