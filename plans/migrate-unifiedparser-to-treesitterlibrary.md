---
name: Migrate UnifiedParser to TreesitterLibrary
issue: n/a
state: complete
version: 1
---

## Goal

Replace the UnifiedParser's internal TreeSitter implementation with the extracted TreesitterLibrary. This eliminates code duplication while maintaining full backward compatibility with all existing tests and functionality.

## Tasks

### 1. Add TreesitterLibrary as Composite Build Dependency

- Add `includeBuild` directive to `analysis/settings.gradle.kts` to reference TreesitterLibrary
- Update UnifiedParser's `build.gradle.kts`:
  - Remove all direct TreeSitter dependencies (lines 11-25: `libs.treesitter.*`)
  - Add dependency on TreesitterLibrary: `implementation("de.maibornwolff.treesitter.excavationsite:TreesitterLibrary:0.1.0")`
- Verify the composite build resolves correctly with `./gradlew :analysers:parsers:UnifiedParser:dependencies`

### 2. Create Adapter Layer for TreesitterLibrary Integration

- Create a new `TreeSitterAdapter.kt` in `metriccollectors/` package that:
  - Maps file extensions to TreesitterLibrary's `Language` enum
  - Calls `TreeSitterMetrics.parse(fileContent, language)` to get `MetricsResult`
  - Converts `MetricsResult` to the existing `MutableNode` format with correct attribute names
- Ensure metric names match exactly:
  - `complexity` -> `complexity`
  - `logic_complexity` -> `logic_complexity`
  - `comment_lines` -> `comment_lines`
  - `number_of_functions` -> `number_of_functions`
  - `message_chains` -> `message_chains`
  - `rloc` -> `rloc`
  - `loc` -> `loc`
  - `long_method` -> `long_method`
  - `long_parameter_list` -> `long_parameter_list`
  - `excessive_comments` -> `excessive_comments`
  - `comment_ratio` -> `comment_ratio`
  - Per-function metrics: `max_complexity_per_function`, `mean_parameters_per_function`, etc.

### 3. Refactor MetricCollector to Use TreeSitterAdapter

- Remove TreeSitter parsing logic from `MetricCollector.kt`
- Replace `collectMetricsForFile()` implementation to use TreeSitterAdapter
- Remove now-unused imports: `TSLanguage`, `TSParser`, `TSNode`, `TSTreeCursor`
- Keep `ChecksumCalculator` integration for caching support
- Maintain the same `MutableNode` return type with identical attributes

### 4. Update AvailableCollectors to Use TreesitterLibrary's Language Enum

- Modify `AvailableCollectors.kt` to map `FileExtension` to TreesitterLibrary's `Language`
- The `collectorFactory` can now return a single generic collector using the adapter
- Alternative: Keep enum but have each entry delegate to adapter with appropriate language

### 5. Delete Obsolete Code

Delete the following packages/files that are now provided by TreesitterLibrary:

**metriccalculators/** (entire package except any CodeCharta-specific extensions):
- `CalculationContext.kt`
- `CalculationExtensions.kt`
- `CommentLinesCalc.kt`
- `ComplexityCalc.kt`
- `MessageChainsCalc.kt`
- `MetricCalc.kt`
- `MetricPerFileCalc.kt`
- `MetricPerFunctionCalc.kt`
- `MetricsToCalculatorsMap.kt`
- `NumberOfFunctionsCalc.kt`
- `ParametersPerFunctionCalc.kt`
- `RealLinesOfCodeCalc.kt`

**metricnodetypes/** (entire package):
- `MetricNodeTypes.kt`
- `BashNodeTypes.kt`
- `CNodeTypes.kt`
- `CSharpNodeTypes.kt`
- `CppNodeTypes.kt`
- `GoNodeTypes.kt`
- `JavaNodeTypes.kt`
- `JavascriptNodeTypes.kt`
- `KotlinNodeTypes.kt`
- `ObjectiveCNodeTypes.kt`
- `PhpNodeTypes.kt`
- `PythonNodeTypes.kt`
- `RubyNodeTypes.kt`
- `SwiftNodeTypes.kt`
- `TypescriptNodeTypes.kt`

**Individual collectors** (if using single adapter approach):
- `BashCollector.kt`
- `CCollector.kt`
- `CppCollector.kt`
- `CSharpCollector.kt`
- `GoCollector.kt`
- `JavaCollector.kt`
- `JavascriptCollector.kt`
- `KotlinCollector.kt`
- `ObjectiveCCollector.kt`
- `PhpCollector.kt`
- `PythonCollector.kt`
- `RubyCollector.kt`
- `SwiftCollector.kt`
- `TypescriptCollector.kt`

### 6. Update Tests

- Existing collector tests (`JavaCollectorTest.kt`, etc.) should pass with no changes if adapter maps correctly
- If tests fail, verify metric value mappings are correct
- Run full test suite: `./gradlew :analysers:parsers:UnifiedParser:test`
- Run all analysis tests: `./gradlew test`
- Run integration tests: `./gradlew integrationTest`

### 7. Verify No Regressions

- Compare output from old vs new implementation on sample projects
- Ensure all 14 languages still produce identical metrics
- Verify checksum-based caching still works in ProjectScanner

## Steps

- [x] Complete Task 1: Add TreesitterLibrary as composite build dependency
- [x] Complete Task 2: Create TreeSitterAdapter for MetricsResult -> MutableNode conversion
- [x] Complete Task 3: Refactor MetricCollector to use adapter
- [x] Complete Task 4: Update AvailableCollectors enum
- [x] Complete Task 5: Delete obsolete code (calculators, node types, collectors)
- [x] Complete Task 6: Update and verify tests pass
- [x] Complete Task 7: Run full regression testing

## Notes

- TreesitterLibrary group: `de.maibornwolff.treesitter.excavationsite`
- TreesitterLibrary provides identical metrics to current UnifiedParser (was extracted from it)
- TreesitterLibrary location relative to codecharta: `../../TreesitterLibrary`
- Key API: `TreeSitterMetrics.parse(content: String, language: Language): MetricsResult`
- `MetricsResult` has convenience properties matching all expected metrics
- Per-function metrics available via `result.perFunctionMetrics` map
- TreesitterLibrary already includes all TreeSitter language bindings transitively
