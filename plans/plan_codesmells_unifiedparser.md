---
name: Code Smell Detection in UnifiedParser
issue: #4315
state: progress
version: 1.0
---

## Goal

Add support for detecting two code smells in the UnifiedParser: long methods (functions with >10 real lines of code) and long parameter lists (functions with >4 parameters). These metrics will be calculated by post-processing existing RLOC and Parameters metrics, outputting the count of functions violating each threshold per file.

## Tasks

### 1. Add Code Smell Metric Enums

Add new metric types to the `AvailableFileMetrics` enum in `MetricNodeTypes.kt`:
- `LONG_METHOD` with metric name "long_method"
- `LONG_PARAMETER_LIST` with metric name "long_parameter_list"

**Context**: These enums define the metric identifiers used throughout the UnifiedParser system.

### 2. Implement Code Smell Detection Logic

Modify `MetricCollector.collectMetricsForFile()` to detect code smells after line 50:
- Access existing function-level metrics via `rlocCalc.getMetricPerFunction()` and `parametersPerFunctionCalc.getMetricPerFunction()`
- Count functions where RLOC > 10 (long methods)
- Count functions where parameters > 4 (long parameter lists)
- Add counts to `metricNameToValue` map with appropriate metric names

**Context**: This uses the post-processing pattern already present in MetricCollector (similar to complexity recalculation at lines 42-45). Since code smells are derived metrics, they don't need AST traversal.

**Thresholds**:
- Long Method: RLOC > 10
- Long Parameter List: Parameters > 4

### 3. Register Attribute Descriptors

Add descriptors in `AttributeDescriptors.kt`:
- "long_method": "Number of functions with more than 10 real lines of code"
- "long_parameter_list": "Number of functions with more than 4 parameters"
- Set attribute type as absolute and unidirectional

**Context**: Attribute descriptors provide metadata about metrics for documentation and visualization purposes.

### 4. Write Unit Tests

Create unit tests for the code smell detection logic in `CodeSmellsTest.kt`:
- Test file with no code smells (all functions clean)
- Test file with only long methods
- Test file with only long parameter lists
- Test file with both code smells present
- Test edge cases (exactly 10 rloc, exactly 4 parameters - should NOT trigger)
- Test multiple functions with code smells
- Test that comments are ignored when counting rloc

**Context**: Follow TDD workflow and Arrange-Act-Assert pattern with comments. Test file should be located at `unified/CodeSmellsTest.kt` (same level as UnifiedParserTest) since code smells are a language-agnostic feature.

### 5. Update Golden Test Files

Update all existing golden `.cc.json` files in `src/test/resources/languageSamples/` to include the new code smell metrics:
- Add `"long_method"` attribute with appropriate count for each language sample
- Add `"long_parameter_list"` attribute with appropriate count for each language sample
- Add attribute descriptors for both metrics in the `attributeDescriptors` section

**Context**: The existing `UnifiedParserTest` parameterized tests compare parser output against these golden files for all supported languages. Updating them ensures end-to-end integration testing without requiring new test code. This follows the existing pattern where all metrics are validated through golden file comparison.

## Steps

- [x] Complete Task 1: Add LONG_METHOD and LONG_PARAMETER_LIST to AvailableFileMetrics enum
- [x] Complete Task 2: Implement code smell detection in MetricCollector.collectMetricsForFile()
- [x] Complete Task 3: Register attribute descriptors for both code smell metrics
- [x] Complete Task 4: Write and pass unit tests for code smell detection (CodeSmellsTest.kt)
- [ ] Complete Task 5: Update golden test files with new code smell metrics
- [ ] Verify all existing tests still pass
- [ ] Run ktlintFormat and ensure code style compliance

## Notes

**Architecture Decision**: Using post-processing approach (Pattern 1) rather than creating new calculator classes because:
1. Code smells are derived metrics (combinations of existing metrics)
2. No AST traversal needed - just threshold checks on existing data
3. Simpler implementation with less code duplication
4. Follows existing pattern used for complexity recalculation

**Output Format**: Metrics appear as file-level attributes in cc.json:
- `long_method`: Integer count (e.g., 3 means 3 functions exceed 10 rloc)
- `long_parameter_list`: Integer count (e.g., 2 means 2 functions exceed 4 parameters)

**Key Files**:
- `MetricNodeTypes.kt`: Enum definitions
- `MetricCollector.kt`: Detection logic (after line 50)
- `AttributeDescriptors.kt`: Metric descriptions
- `RealLinesOfCodeCalc.kt`: Source of RLOC data via getMetricPerFunction()
- `ParametersPerFunctionCalc.kt`: Source of parameter data via getMetricPerFunction()

**Important**: Thresholds use "greater than" comparison (not "greater than or equal"):
- Long method: RLOC > 10 (so 11+ triggers)
- Long parameter list: Parameters > 4 (so 5+ triggers)
