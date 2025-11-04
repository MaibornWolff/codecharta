---
name: Add Swift Language Support to UnifiedParser
issue: #4335
state: todo
version: 1.0
---

## Goal

Add Swift language support to the UnifiedParser by integrating the tree-sitter-swift implementation from io.github.bonede, creating language-specific queries for Swift syntax, and ensuring all supported metrics are calculated correctly for Swift source files.

## Tasks

### 1. Add tree-sitter-swift Dependency

Add the tree-sitter-swift library from io.github.bonede to the project dependencies via libs.versions.toml. This follows the established pattern used for other languages (Kotlin, Java, TypeScript, etc.).

- Add version entry in `[versions]` section of `analysis/gradle/libs.versions.toml`
- Add library entry in `[libraries]` section of `analysis/gradle/libs.versions.toml`
- Follow naming pattern: `tree-sitter-swift = "X.Y.Z"` for version, `treesitter-swift = { group = "io.github.bonede", name = "tree-sitter-swift", version.ref = "tree-sitter-swift"}` for library
- Verify the latest available version on Maven Central before adding
- Add dependency to UnifiedParser's build.gradle.kts

### 2. Create SwiftNodeTypes Class

Create a new SwiftNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to Swift that correspond to each metric.

- Create `SwiftNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Implement all required node type definitions:
  - `logicComplexityNodeTypes`: if, guard, switch/case, loops (for, while, repeat-while), nil-coalescing (??, ??=), logical operators (&&, ||), try/catch
  - `functionComplexityNodeTypes`: functions, methods, closures, initializers, deinitializers, getters, setters
  - `commentLineNodeTypes`: single-line comments (//), multi-line comments (/* */), documentation comments (///)
  - `numberOfFunctionsNodeTypes`: function declarations, method declarations, closures, initializers
  - `functionBodyNodeTypes`: function bodies, closure bodies
  - `functionParameterNodeTypes`: function parameters
- Research Swift's tree-sitter grammar to identify correct node type names (use tree-sitter-swift documentation or inspect Swift code parse trees)
- Consider Swift-specific constructs: optionals, guard statements, defer blocks, property observers (willSet/didSet)

### 3. Create SwiftCollector Class

Create a minimal SwiftCollector class that extends MetricCollector and uses the tree-sitter-swift parser with SwiftNodeTypes.

- Create `SwiftCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the simple pattern from KotlinCollector: pass TreeSitterSwift() and SwiftNodeTypes() to parent constructor
- No custom logic needed initially unless Swift requires special handling (can be added later if tests reveal issues)

### 4. Add Swift FileExtension Enum

Add SWIFT entry to the FileExtension enum to recognize .swift files.

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `SWIFT(".swift")` entry following the pattern of other languages
- Place alphabetically (likely after RUBY and before TYPESCRIPT)

### 5. Register Swift in AvailableCollectors

Register the new SwiftCollector in the AvailableCollectors enum to make it accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `SWIFT(FileExtension.SWIFT, ::SwiftCollector)` entry
- Place alphabetically

### 6. Create Test File and SwiftCollectorTest

Create comprehensive tests for the SwiftCollector following the TDD approach and existing test patterns.

- Create test Swift sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/swiftSample.swift` with examples of:
  - Functions, methods, closures
  - Classes, structs, enums, protocols
  - Control flow (if, guard, switch, loops)
  - Swift-specific features (optionals, property observers, defer)
  - Comments (single-line, multi-line, documentation)
- Create `SwiftCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific Swift constructs:
  - Guard statements contribute to complexity
  - Nil-coalescing operators (??) count correctly
  - Closures are counted as functions
  - Optional chaining doesn't incorrectly inflate metrics
  - Property observers (willSet/didSet) are handled correctly
  - Documentation comments are counted
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 7. Update Documentation

Update the UnifiedParser README to include Swift in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| Swift | .swift |`
- Place alphabetically

### 8. Verify and Run Tests

Run all tests to ensure Swift support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust SwiftNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green

### 9. Update "Adding a New Language" Guide

Review and update the guide in the README to reflect the actual implementation steps, correcting any outdated or missing information.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md` in the "Extending the UnifiedParser > Adding a new language" section
- Verify the guide accurately describes all steps performed (dependency addition, FileExtension enum, AvailableCollectors registration, etc.)
- Add missing steps that weren't documented but were necessary (e.g., adding FileExtension enum, updating build.gradle.kts)
- Correct any terminology mismatches (e.g., "queries" vs "node types", "MetricQueries interface" vs "MetricNodeTypes interface")
- Ensure the guide mentions all files that need to be created/modified
- Add a note about researching tree-sitter grammar node types for the specific language
- Include reference to example implementations (e.g., "see KotlinCollector and KotlinNodeTypes for reference")

## Steps

- [ ] Complete Task 1: Add tree-sitter-swift dependency to libs.versions.toml and build.gradle.kts
- [ ] Complete Task 2: Create SwiftNodeTypes class with all required node type definitions
- [ ] Complete Task 3: Create SwiftCollector class
- [ ] Complete Task 4: Add Swift to FileExtension enum
- [ ] Complete Task 5: Register SwiftCollector in AvailableCollectors enum
- [ ] Complete Task 6: Create test sample file and comprehensive SwiftCollectorTest
- [ ] Complete Task 7: Update README.md documentation
- [ ] Complete Task 8: Run and verify all tests pass
- [ ] Complete Task 9: Update "Adding a New Language" guide in README.md

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Version Research Required**: The exact version of tree-sitter-swift from io.github.bonede needs to be verified on Maven Central before implementation. Based on other tree-sitter libraries in the project, it should follow the 0.2x.x version pattern.

- **Swift Tree-Sitter Grammar**: The Swift grammar node types will need to be researched. Useful resources:
  - https://github.com/alex-pinkus/tree-sitter-swift (original grammar)
  - https://github.com/bonede/tree-sitter-ng (Java bindings project)
  - Use tree-sitter playground or CLI to inspect Swift parse trees

- **Swift-Specific Considerations**:
  - Guard statements should contribute to complexity similar to if statements
  - Defer blocks may need special handling
  - Property observers (willSet, didSet) should be counted as complexity
  - Optional chaining (?.) should not inflate complexity
  - Nil-coalescing operators (??, ??=) should count as logical complexity
  - Closures should be counted as functions

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific Swift construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in SwiftNodeTypes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Future Enhancements**: If initial implementation doesn't handle all Swift constructs perfectly, document known limitations in README.md (similar to Ruby's lambda issue). These can be addressed in future iterations.
