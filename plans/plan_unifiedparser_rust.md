---
name: Add Rust Language Support to UnifiedParser
issue: <to be assigned>
state: todo
version: 1.0
---

## Goal

Add Rust language support to the UnifiedParser by integrating the tree-sitter-rust implementation from io.github.bonede, creating language-specific queries for Rust syntax, and ensuring all supported metrics are calculated correctly for Rust source files.

## Tasks

### 1. Add tree-sitter-rust Dependency

Add the tree-sitter-rust library from io.github.bonede to the project dependencies via libs.versions.toml. This follows the established pattern used for other languages (Swift, Kotlin, Java, TypeScript, etc.).

- Add version entry in `[versions]` section of `analysis/gradle/libs.versions.toml`
- Add library entry in `[libraries]` section of `analysis/gradle/libs.versions.toml`
- Follow naming pattern: `tree-sitter-rust = "X.Y.Z"` for version, `treesitter-rust = { group = "io.github.bonede", name = "tree-sitter-rust", version.ref = "tree-sitter-rust"}` for library
- Verify the latest available version on Maven Central before adding
- Add dependency to UnifiedParser's build.gradle.kts

### 2. Create RustNodeTypes Class

Create a new RustNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to Rust that correspond to each metric.

- Create `RustNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Implement all required node type definitions:
  - `logicComplexityNodeTypes`: if, match expressions and arms, loops (for, while, loop), logical operators (&&, ||), if let, while let, try/catch equivalents (Result/Option pattern matching)
  - `functionComplexityNodeTypes`: function items, method declarations, closures, impl blocks with methods, trait method implementations
  - `commentLineNodeTypes`: single-line comments (//), multi-line comments (/* */), documentation comments (///, //!)
  - `numberOfFunctionsNodeTypes`: function declarations, closures, methods
  - `functionBodyNodeTypes`: function bodies, closure bodies
  - `functionParameterNodeTypes`: function parameters
- Research Rust's tree-sitter grammar to identify correct node type names (use tree-sitter-rust documentation or inspect Rust code parse trees)
- Consider Rust-specific constructs: match expressions, pattern matching, Result/Option handling, macros, lifetimes, traits

### 3. Create RustCollector Class

Create a minimal RustCollector class that extends MetricCollector and uses the tree-sitter-rust parser with RustNodeTypes.

- Create `RustCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the simple pattern from KotlinCollector/SwiftCollector: pass TreeSitterRust() and RustNodeTypes() to parent constructor
- No custom logic needed initially unless Rust requires special handling (can be added later if tests reveal issues)

### 4. Add Rust FileExtension Enum

Add RUST entry to the FileExtension enum to recognize .rs files.

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `RUST(".rs")` entry following the pattern of other languages
- Place alphabetically (likely after RUBY)

### 5. Register Rust in AvailableCollectors

Register the new RustCollector in the AvailableCollectors enum to make it accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `RUST(FileExtension.RUST, ::RustCollector)` entry
- Place alphabetically

### 6. Create Test File and RustCollectorTest

Create comprehensive tests for the RustCollector following the TDD approach and existing test patterns.

- Create test Rust sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/rustSample.rs` with examples of:
  - Functions, methods, closures
  - Structs, enums, traits, impl blocks
  - Control flow (if, match, loops, if let, while let)
  - Rust-specific features (Result/Option handling, pattern matching, iterators)
  - Comments (single-line, multi-line, documentation)
- Create `RustCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific Rust constructs:
  - Match expressions with multiple arms contribute to complexity
  - if let and while let patterns count correctly
  - Closures are counted as functions
  - Pattern matching is handled correctly
  - Result/Option chaining (?, unwrap) are counted appropriately
  - Documentation comments (/// and //!) are counted
  - Macro invocations don't incorrectly inflate metrics
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 7. Update Documentation

Update the UnifiedParser README to include Rust in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| Rust | .rs |`
- Place alphabetically

### 8. Verify and Run Tests

Run all tests to ensure Rust support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust RustNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green

## Steps

- [ ] Complete Task 1: Add tree-sitter-rust dependency to libs.versions.toml and build.gradle.kts
- [ ] Complete Task 2: Create RustNodeTypes class with all required node type definitions
- [ ] Complete Task 3: Create RustCollector class
- [ ] Complete Task 4: Add Rust to FileExtension enum
- [ ] Complete Task 5: Register RustCollector in AvailableCollectors enum
- [ ] Complete Task 6: Create test sample file and comprehensive RustCollectorTest
- [ ] Complete Task 7: Update README.md documentation
- [ ] Complete Task 8: Run and verify all tests pass

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Version Research Required**: The exact version of tree-sitter-rust from io.github.bonede needs to be verified on Maven Central before implementation. Based on other tree-sitter libraries in the project, it should follow the 0.2x.x version pattern.

- **Rust Tree-Sitter Grammar**: The Rust grammar node types will need to be researched. Useful resources:
  - https://github.com/tree-sitter/tree-sitter-rust (official grammar)
  - https://github.com/bonede/tree-sitter-ng (Java bindings project)
  - Use tree-sitter playground or CLI to inspect Rust parse trees

- **Rust-Specific Considerations**:
  - Match expressions with multiple arms should contribute to complexity (each arm = +1)
  - if let and while let should count as conditional complexity
  - Closures should be counted as functions
  - Question mark operator (?) for error propagation should not inflate complexity excessively
  - Pattern matching in function parameters should be handled correctly
  - Macro invocations should not incorrectly inflate metrics
  - Documentation comments (/// for items, //! for modules) should all be counted
  - Trait implementations and impl blocks should be traversed correctly

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific Rust construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in RustNodeTypes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Future Enhancements**: If initial implementation doesn't handle all Rust constructs perfectly, document known limitations in README.md. These can be addressed in future iterations. Consider adding support for:
  - Async/await complexity
  - Unsafe blocks (if they should contribute to complexity metrics)
  - Macro definitions (not just invocations)
