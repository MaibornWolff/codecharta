---
name: Use AttributeDescriptors from cc.json in MetricThresholdChecker
issue: TBD
state: complete
version: 1.0
---

## Goal

Use the attribute descriptors already present in the analyzed cc.json Project instead of hardcoded metric explanations. Display the description from attributeDescriptors inline after the metric name when violations occur.

## Tasks

### 1. Revert MetricMetadata/MetricCatalog Changes
Remove the hardcoded MetricCatalog approach:
- Delete `MetricMetadata.kt` file
- Delete `MetricCatalogTest.kt` file
- Revert ViolationFormatter changes that reference MetricCatalog

### 2. Pass AttributeDescriptors to ViolationFormatter
Modify the data flow to pass Project's attributeDescriptors:
- Update `MetricThresholdChecker.printResults()` to pass `project.attributeDescriptors`
- Update `ViolationFormatter.printResults()` signature to accept attributeDescriptors
- Update `ViolationFormatter.printViolations()` to look up descriptions from attributeDescriptors

### 3. Display AttributeDescriptor Description Inline
When printing violations:
- Look up metric name in `attributeDescriptors` map
- If found, display `attributeDescriptor.description` after metric name
- If not found, don't display any explanation (no fallback)
- Keep description on same line or wrapped appropriately

### 4. Update Tests
Modify existing tests:
- Update ViolationFormatterTest to pass mock attributeDescriptors
- Test cases for metrics with descriptors
- Test cases for metrics without descriptors (no explanation shown)
- Remove MetricCatalogTest references

## Steps

- [x] Delete MetricMetadata.kt and MetricCatalogTest.kt files
- [x] Revert ViolationFormatter to remove MetricCatalog usage
- [x] Update MetricThresholdChecker.printResults() to pass project.attributeDescriptors
- [x] Modify ViolationFormatter to accept and use attributeDescriptors parameter
- [x] Update ViolationFormatter to display description inline after metric name
- [x] Update ViolationFormatterTest with new test cases
- [x] Verify output shows descriptions from cc.json's attributeDescriptors
- [x] Move variables closer to usage (totalMetrics moved inside if block)
- [x] Apply ktlint formatting (line length, proper line breaks)
- [x] Flatten wrapAndPrint() loop structure for better readability
- [x] Extract magic values to constants (console width, separator, indent, table layout)
- [x] Extract all text strings to companion object methods/constants
- [x] Fix output stream usage (success to stdout, violations to stderr)

## Review Feedback Addressed

### Code Style Improvements
- **Variable Placement**: Moved `totalMetrics` variable inside the if block where it's used (printSummary method)
- **Line Length**: Split long lines to comply with ktlint 120 character limit:
  - `printViolations()` parameter list split across multiple lines
  - `headerFormat` and `rowFormat` strings split with proper indentation
  - `thresholdValue` assignment split to new line
  - Repeat calculation for table separator split to new line
- **Code Quality**: Variables now defined closer to their usage point
- **Loop Complexity**: Refactored `wrapAndPrint()` method to flatten nested if/else:
  - Extracted complex condition into `wouldExceedMaxWidth` variable
  - Used early `continue` to avoid nested else block
  - Reduced nesting from 3 levels to 2 levels
  - Improved readability with guard clause pattern
- **Magic Values Elimination**: Extracted all magic values to named constants:
  - Created `TableLayout` data class for column widths (minPathWidth: 20, valueWidth: 15, thresholdWidth: 20, excessWidth: 15)
  - Added companion object constants: `CONSOLE_WIDTH` (78), `SEPARATOR_WIDTH` (60), `TABLE_INDENT` ("  "), `WORD_SEPARATOR_LENGTH` (1)
  - Single source of truth for all layout dimensions
  - Easier to adjust output formatting in future
- **Text Strings Extraction**: Extracted all text content to companion object (idiomatic Kotlin approach):
  - ANSI color codes moved to companion object constants (RED, GREEN, YELLOW, RESET, BOLD)
  - Special characters extracted (CHECK_MARK ✓, CROSS_MARK ✗, SEPARATOR_LINE ═, TABLE_LINE ─, ELLIPSIS)
  - All text content extracted (header title, messages, labels, prefixes)
  - Table column headers extracted to named constants (COLUMN_HEADER_PATH, etc.)
  - Threshold prefixes (THRESHOLD_MIN_PREFIX, THRESHOLD_MAX_PREFIX) and excess signs (EXCESS_POSITIVE, EXCESS_NEGATIVE)
  - Formatted message methods created (getSuccessMessage(), getViolationCountMessage(), getMetricHeader(), etc.)
  - All text and formatting in one place for easy maintenance and potential i18n
  - Colors and symbols included with text strings as requested
- **Output Stream Separation**: Fixed semantic correctness of output streams:
  - Success case (no violations): All output to stdout (`output`) - this is normal informational output
  - Failure case (violations found): All output to stderr (`error`) - this is error/diagnostic output
  - Aligns with Unix convention: stdout for normal output, stderr for errors
  - Allows proper shell redirection and piping

## Notes

### Example Output Format

```
═══════════════════════════════════════════════════════════
✗ 2 violation(s) found!
═══════════════════════════════════════════════════════════

Violations:

Metric: rloc (2 violations)
Number of lines that contain at least one character which is neither a
whitespace nor a tabulation nor part of a comment

  Path                  Actual Value  Threshold     Exceeds By
  ────────────────────────────────────────────────────────────
  src/LargeFile.kt      523          max: 500       +23
  src/BigClass.kt       510          max: 500       +10

```

### Benefits of This Approach

- **Single Source of Truth**: Uses definitions from parsers themselves
- **Always Accurate**: Descriptions match what the parser actually measures
- **Extensible**: Works with any metric from any parser automatically
- **No Duplication**: Don't maintain separate explanations
- **User Control**: Users see explanations based on what was actually analyzed

### Data Flow

```
Project (from analysis)
  └── attributeDescriptors: Map<String, AttributeDescriptor>
       └── "rloc" → AttributeDescriptor(description = "Number of lines...")

MetricThresholdChecker.call()
  └── project.attributeDescriptors passed to printResults()
       └── ViolationFormatter uses it to display inline descriptions
```
