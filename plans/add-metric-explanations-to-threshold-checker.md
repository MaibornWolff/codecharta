---
name: Add AI-Readable Metric Explanations to MetricThresholdChecker
issue: TBD
state: complete
version: 1.0
---

## Goal

Enhance the MetricThresholdChecker to provide simple, concise explanations for each failed metric, including what the metric means and actionable remediation advice, in an AI-readable format within the existing console output.

## Tasks

### 1. Create MetricMetadata Data Structure
Create a new data class to hold metric information:
- Metric name
- Human-readable description (what the metric measures)
- Remediation advice (what to do when threshold is violated)
- Optional: severity level, reference links

### 2. Build MetricCatalog Registry
Create a hardcoded registry/catalog of common CodeCharta metrics with their metadata:
- `rloc` (Real Lines of Code): Counts non-empty, non-comment lines
- `mcc` / `complexity` (McCabe/Cyclomatic Complexity): Measures code branching complexity
- `parameters` (Parameters per Function): Counts function/method parameters
- `functions` (Number of Functions): Counts functions/methods in a file
- `comment_lines` (Comment Lines): Counts lines with comments
- Include explanations and remediation for each

### 3. Enhance ViolationFormatter Output
Modify ViolationFormatter to include metric explanations:
- After displaying violations grouped by metric, add an "Explanation" section
- For each failed metric, display:
  - What it means
  - Why it matters
  - Recommended actions
- Keep formatting consistent with existing colored output
- Ensure text is clear and concise for AI consumption

### 4. Handle Unknown Metrics Gracefully
Add fallback for metrics not in the catalog:
- Display generic message when metric metadata is unavailable
- Suggest checking metric documentation
- Don't fail or crash when encountering unknown metrics

### 5. Write Tests
Add unit tests for:
- MetricMetadata data class
- MetricCatalog registry (verify all common metrics are present)
- ViolationFormatter with explanations (test output format)
- Unknown metric handling

## Steps

- [x] Complete Task 1: Create MetricMetadata data class in ThresholdConfiguration.kt or new file
- [x] Complete Task 2: Create MetricCatalog object with hardcoded metric explanations
- [x] Complete Task 3: Modify ViolationFormatter.printResults() to display metric explanations
- [x] Complete Task 4: Add graceful fallback for unknown metrics in MetricCatalog
- [x] Complete Task 5: Write comprehensive unit tests for new functionality
- [x] Verify output is clear and AI-readable by testing with actual violations

## Review Feedback Addressed

(Will be filled during PR review)

## Notes

### Common Metrics to Document

Based on UnifiedParser analysis:
- **rloc**: Real Lines of Code (excluding empty lines and comments)
- **complexity** / **mcc**: McCabe/Cyclomatic Complexity (measures control flow)
- **parameters**: Number of parameters per function
- **functions**: Number of functions in a file
- **comment_lines**: Lines containing comments

### Output Format Considerations

The enhanced output should maintain the existing colored table format while adding a clear explanation section. Example structure:

```
═══════════════════════════════════════════════════════════
✗ 5 violation(s) found!
═══════════════════════════════════════════════════════════

Violations:

Metric: rloc (5 violations)

  Path                  Actual Value  Threshold     Exceeds By
  ────────────────────────────────────────────────────────────
  src/large_file.kt     523          max: 500       +23

───────────────────────────────────────────────────────────

📊 Metric Explanations:

rloc (Real Lines of Code)
  What it means: Measures the number of actual code lines, excluding empty
                 lines and comments. High values indicate large files.

  Why it matters: Large files are harder to maintain, test, and understand.

  Recommended actions:
    • Split large files into smaller, focused modules
    • Extract related functions into separate files
    • Consider using composition over large classes
    • Target: Keep files under 500 lines when possible

───────────────────────────────────────────────────────────
```

### Implementation Location

- MetricMetadata: New file `MetricMetadata.kt` in metricthresholdchecker package
- MetricCatalog: New file `MetricCatalog.kt` or add to MetricMetadata.kt
- Enhanced output: Modify `ViolationFormatter.kt`

### Future Enhancements (Out of Scope)

- Allow users to provide custom metric explanations via config file
- Add support for project/folder level metrics (currently only file-level)
- Generate HTML/JSON output format for better AI parsing
