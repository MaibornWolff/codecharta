---
name: Fix UnifiedParser Tests for TreesitterLibrary
issue: n/a
state: complete
version: 1
---

## Goal

Update all UnifiedParser tests to use the new TreesitterLibrary API after the migration removed individual language collectors and metric node types.

## Tasks

### 1. Update Collector Test Files (14 files)

All test files in `src/test/kotlin/.../metriccollectors/` need these changes:

**Imports to remove:**
- `import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics`
- `import org.treesitter.TSParser`
- `import org.treesitter.TreeSitter<Language>` (e.g., `TreeSitterJava`, `TreeSitterPython`, etc.)

**Imports to add:**
- `import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics`
- `import de.maibornwolff.treesitter.excavationsite.api.Language`

**Code changes:**
- Replace `private val collector = <Language>Collector()` with `private val collector = TreeSitterLibraryCollector(Language.<LANGUAGE>)`
- Remove `private var parser = TSParser()` field
- Remove `@BeforeEach` setup that called `parser.setLanguage(TreeSitter<Language>())`

Files to update:
- `JavaCollectorTest.kt` → `Language.JAVA`
- `KotlinCollectorTest.kt` → `Language.KOTLIN`
- `TypescriptCollectorTest.kt` → `Language.TYPESCRIPT`
- `JavascriptCollectorTest.kt` → `Language.JAVASCRIPT`
- `PythonCollectorTest.kt` → `Language.PYTHON`
- `GoCollectorTest.kt` → `Language.GO`
- `PhpCollectorTest.kt` → `Language.PHP`
- `RubyCollectorTest.kt` → `Language.RUBY`
- `SwiftCollectorTest.kt` → `Language.SWIFT`
- `BashCollectorTest.kt` → `Language.BASH`
- `CSharpCollectorTest.kt` → `Language.CSHARP`
- `CppCollectorTest.kt` → `Language.CPP`
- `CCollectorTest.kt` → `Language.C`
- `ObjectiveCCollectorTest.kt` → `Language.OBJECTIVE_C`

### 2. Update Code Smell Test Files (5 files)

All test files in `src/test/kotlin/.../codesmells/` need these changes:

**Imports to remove:**
- `import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.<Language>Collector`
- `import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics`

**Imports to add:**
- `import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TreeSitterLibraryCollector`
- `import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics`
- `import de.maibornwolff.treesitter.excavationsite.api.Language`

**Code changes:**
- Replace `private val collector = JavaCollector()` with `private val collector = TreeSitterLibraryCollector(Language.JAVA)`

Files to update:
- `LongMethodTest.kt`
- `LongParameterListTest.kt`
- `ExcessiveCommentsTest.kt`
- `CommentRatioTest.kt`
- `MessageChainsTest.kt`

### 3. Eliminate Magic Values

Ensure all metric name references use the enum constants instead of hardcoded strings:
- Use `AvailableFileMetrics.COMPLEXITY.metricName` instead of `"complexity"`
- Use `AvailableFileMetrics.COMMENT_LINES.metricName` instead of `"comment_lines"`
- Apply to all metric assertions in tests

For per-function metrics, create constants or use a consistent pattern:
- `"max_complexity_per_function"`, `"mean_parameters_per_function"`, etc.
- Consider extracting these to a companion object if they appear in multiple test files

### 4. Verify Tests Pass

- Run `./gradlew :analysers:parsers:UnifiedParser:test` to verify all tests compile and pass
- Run `./gradlew test` for full test suite

## Steps

- [x] Complete Task 1: Update all 14 collector test files
- [x] Complete Task 2: Update all 5 code smell test files
- [x] Complete Task 3: Eliminate magic values in metric assertions (tests already use enum constants)
- [x] Complete Task 4: Verify tests pass

## Notes

- `AvailableFileMetrics` enum exists in TreesitterLibrary with the same structure and metric names
- `AvailableFunctionMetrics` enum provides base names (`parameters`, `complexity`, `rloc`) for per-function metrics
- Per-function metric keys follow pattern: `{max|min|mean|median}_{metricName}_per_function`
- The `TreeSitterLibraryCollector` class uses `Language` enum from TreesitterLibrary API
- Test logic and assertions remain unchanged; only imports and collector instantiation change
