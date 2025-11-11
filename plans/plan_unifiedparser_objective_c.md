---
name: Add Objective-C Language Support to UnifiedParser
issue: #4361
state: todo
version: 1.0
---

## Goal

Add Objective-C language support to the UnifiedParser by integrating the tree-sitter-objc implementation from io.github.bonede, creating language-specific queries for Objective-C syntax, and ensuring all supported metrics are calculated correctly for Objective-C source files.

## Tasks

### 1. Add tree-sitter-objc Dependency

Add the tree-sitter-objc library from io.github.bonede to the project dependencies via libs.versions.toml. This follows the established pattern used for other languages (Kotlin, Java, TypeScript, Swift, etc.).

- Add version entry in `[versions]` section of `analysis/gradle/libs.versions.toml`
- Add library entry in `[libraries]` section of `analysis/gradle/libs.versions.toml`
- Follow naming pattern: `tree-sitter-objc = "X.Y.Z"` for version, `treesitter-objc = { group = "io.github.bonede", name = "tree-sitter-objc", version.ref = "tree-sitter-objc"}` for library
- Verify the latest available version on Maven Central before adding
- Add dependency to UnifiedParser's build.gradle.kts

### 2. Create ObjectiveCNodeTypes Class

Create a new ObjectiveCNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to Objective-C that correspond to each metric.

- Create `ObjectiveCNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Implement all required node type definitions:
  - `logicComplexityNodeTypes`: if, switch/case, loops (for, while, do-while), ternary operator (?:), logical operators (&&, ||), @try/@catch, nil checks
  - `functionComplexityNodeTypes`: function definitions, method declarations, blocks, C function definitions
  - `commentLineNodeTypes`: single-line comments (//), multi-line comments (/* */), documentation comments (///, /** */)
  - `numberOfFunctionsNodeTypes`: method declarations, function declarations, blocks
  - `functionBodyNodeTypes`: method bodies, function bodies, block bodies
  - `functionParameterNodeTypes`: method parameters, function parameters, block parameters
- Research Objective-C's tree-sitter grammar to identify correct node type names (use tree-sitter-objc documentation or inspect Objective-C code parse trees)
- Consider Objective-C-specific constructs: message sends, category/protocol definitions, properties with getters/setters, @property/@synthesize, blocks (closures), nil checks, @try/@catch/@finally

### 3. Create ObjectiveCCollector Class

Create a minimal ObjectiveCCollector class that extends MetricCollector and uses the tree-sitter-objc parser with ObjectiveCNodeTypes.

- Create `ObjectiveCCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the simple pattern from SwiftCollector/KotlinCollector: pass TreeSitterObjc() and ObjectiveCNodeTypes() to parent constructor
- No custom logic needed initially unless Objective-C requires special handling (can be added later if tests reveal issues)

### 4. Add Objective-C FileExtension Enum

Add OBJECTIVE_C entry to the FileExtension enum to recognize .m and .h files (when containing Objective-C code).

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `OBJECTIVE_C(".m")` entry following the pattern of other languages
- Note: .h headers are shared between C and Objective-C. The parser will need to handle this appropriately based on content or default to Objective-C when appropriate
- Place alphabetically (likely after C and before PHP)

### 5. Register Objective-C in AvailableCollectors

Register the new ObjectiveCCollector in the AvailableCollectors enum to make it accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `OBJECTIVE_C(FileExtension.OBJECTIVE_C, ::ObjectiveCCollector)` entry
- Place alphabetically

### 6. Create Test File and ObjectiveCCollectorTest

Create comprehensive tests for the ObjectiveCCollector following the TDD approach and existing test patterns.

- Create test Objective-C sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/objectiveCample.m` with examples of:
  - Methods (instance and class methods)
  - C functions
  - Classes, categories, protocols
  - Control flow (if, switch, loops, @try/@catch)
  - Objective-C-specific features (message sends, blocks, properties, @property/@synthesize)
  - Comments (single-line, multi-line, documentation)
  - Blocks (Objective-C closures)
- Create `ObjectiveCCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific Objective-C constructs:
  - Methods (instance and class) are counted as functions
  - Blocks are counted as functions
  - @try/@catch statements contribute to complexity
  - Nil checks and logical operators count correctly
  - Message send syntax doesn't incorrectly inflate metrics
  - Properties and synthesized getters/setters are handled correctly
  - C functions within Objective-C files are counted
  - Documentation comments are counted
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 7. Update Documentation

Update the UnifiedParser README to include Objective-C in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| Objective-C | .m |`
- Place alphabetically
- Consider adding a note about .h header file handling if needed

### 8. Verify and Run Tests

Run all tests to ensure Objective-C support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust ObjectiveCNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green

### 9. Update "Adding a New Language" Guide

Verify the guide in the README is accurate and up-to-date based on the Objective-C implementation experience.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md` in the "Extending the UnifiedParser > Adding a new language" section
- Ensure the guide accurately describes all steps performed
- Add any additional clarifications discovered during Objective-C implementation
- Ensure consistency with Swift implementation learnings

## Steps

- [ ] Complete Task 1: Add tree-sitter-objc dependency to libs.versions.toml and build.gradle.kts
- [ ] Complete Task 2: Create ObjectiveCNodeTypes class with all required node type definitions
- [ ] Complete Task 3: Create ObjectiveCCollector class
- [ ] Complete Task 4: Add Objective-C to FileExtension enum
- [ ] Complete Task 5: Register ObjectiveCCollector in AvailableCollectors enum
- [ ] Complete Task 6: Create test sample file and comprehensive ObjectiveCCollectorTest
- [ ] Complete Task 7: Update README.md documentation
- [ ] Complete Task 8: Run and verify all tests pass
- [ ] Complete Task 9: Verify "Adding a New Language" guide in README.md

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Version Research Required**: The exact version of tree-sitter-objc from io.github.bonede needs to be verified on Maven Central before implementation. It should follow the same version pattern as other tree-sitter libraries in the project (0.2x.x).

- **Objective-C Tree-Sitter Grammar**: The Objective-C grammar node types will need to be researched. Useful resources:
  - https://github.com/amaanq/tree-sitter-objc (tree-sitter grammar)
  - https://github.com/bonede/tree-sitter-ng (Java bindings project)
  - Use tree-sitter playground or CLI to inspect Objective-C parse trees

- **Objective-C-Specific Considerations**:
  - Methods (both instance `-` and class `+`) should be counted as functions
  - Blocks (Objective-C closures using `^`) should be counted as functions
  - @try/@catch/@finally blocks should contribute to complexity
  - Message send syntax `[object method:arg]` should not inflate complexity
  - Properties declared with @property and synthesized with @synthesize need appropriate handling
  - C functions within Objective-C files should be counted
  - Header files (.h) may contain both C and Objective-C code
  - Protocols and categories are important language features to handle

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific Objective-C construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in ObjectiveCNodeTypes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Future Enhancements**: If initial implementation doesn't handle all Objective-C constructs perfectly, document known limitations in README.md (similar to Ruby's lambda issue). These can be addressed in future iterations.

- **C vs Objective-C Header Files**: The .h extension is used by both C and Objective-C. The implementation may need to consider how to handle this overlap, potentially defaulting to C parser for .h files unless they contain obvious Objective-C syntax.
