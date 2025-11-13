---
name: Add Scala Language Support to UnifiedParser
issue: #<issue-id>
state: todo
version: 1.0
---

## Goal

Add Scala language support to the UnifiedParser by integrating the tree-sitter-scala implementation from io.github.bonede, creating language-specific queries for Scala syntax, and ensuring all supported metrics are calculated correctly for Scala source files.

## Tasks

### 1. Add tree-sitter-scala Dependency

Add the tree-sitter-scala library from io.github.bonede to the project dependencies via libs.versions.toml. This follows the established pattern used for other languages (Kotlin, Java, TypeScript, Swift, etc.).

- Add version entry in `[versions]` section of `analysis/gradle/libs.versions.toml`
- Add library entry in `[libraries]` section of `analysis/gradle/libs.versions.toml`
- Follow naming pattern: `tree-sitter-scala = "X.Y.Z"` for version, `treesitter-scala = { group = "io.github.bonede", name = "tree-sitter-scala", version.ref = "tree-sitter-scala"}` for library
- Verify the latest available version on Maven Central before adding
- Add dependency to UnifiedParser's build.gradle.kts

### 2. Create ScalaNodeTypes Class

Create a new ScalaNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to Scala that correspond to each metric.

- Create `ScalaNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Implement all required node type definitions:
  - `logicComplexityNodeTypes`: if, match/case (pattern matching), while, do-while, for comprehensions, try/catch, logical operators (&&, ||, &, |), ternary-like expressions, Option operations (getOrElse, fold, etc.)
  - `functionComplexityNodeTypes`: functions (def), methods, lambdas, anonymous functions, constructors, apply methods, partial functions
  - `commentLineNodeTypes`: single-line comments (//), multi-line comments (/* */), scaladoc comments (/** */)
  - `numberOfFunctionsNodeTypes`: function declarations (def), lambda expressions, anonymous functions, methods
  - `functionBodyNodeTypes`: function bodies, lambda bodies, method bodies
  - `functionParameterNodeTypes`: function parameters, implicit parameters
- Research Scala's tree-sitter grammar to identify correct node type names (use tree-sitter-scala documentation or inspect Scala code parse trees)
- Consider Scala-specific constructs: pattern matching, for comprehensions, implicit parameters, partial functions, case classes, traits, objects

### 3. Create ScalaCollector Class

Create a minimal ScalaCollector class that extends MetricCollector and uses the tree-sitter-scala parser with ScalaNodeTypes.

- Create `ScalaCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the simple pattern from KotlinCollector: pass TreeSitterScala() and ScalaNodeTypes() to parent constructor
- No custom logic needed initially unless Scala requires special handling (can be added later if tests reveal issues)

### 4. Add Scala FileExtension Enum

Add SCALA entry to the FileExtension enum to recognize .scala files.

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `SCALA(".scala")` entry following the pattern of other languages
- Place alphabetically (likely after RUBY and before SWIFT)

### 5. Register Scala in AvailableCollectors

Register the new ScalaCollector in the AvailableCollectors enum to make it accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `SCALA(FileExtension.SCALA, ::ScalaCollector)` entry
- Place alphabetically

### 6. Create Test File and ScalaCollectorTest

Create comprehensive tests for the ScalaCollector following the TDD approach and existing test patterns.

- Create test Scala sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/scalaSample.scala` with examples of:
  - Functions, methods, lambdas, anonymous functions
  - Classes, case classes, traits, objects, companion objects
  - Pattern matching (match/case expressions)
  - For comprehensions
  - Control flow (if, while, do-while, try/catch)
  - Scala-specific features (implicit parameters, partial functions, Option/Either)
  - Comments (single-line, multi-line, scaladoc)
- Create `ScalaCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific Scala constructs:
  - Pattern matching with multiple cases contributes to complexity correctly
  - For comprehensions are counted appropriately
  - Lambda expressions are counted as functions
  - Implicit parameters are counted correctly
  - Partial functions contribute to complexity
  - Case guards in pattern matching count correctly
  - Scaladoc comments are counted
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 7. Update Documentation

Update the UnifiedParser README to include Scala in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| Scala | .scala |`
- Place alphabetically

### 8. Verify and Run Tests

Run all tests to ensure Scala support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust ScalaNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green

## Steps

- [ ] Complete Task 1: Add tree-sitter-scala dependency to libs.versions.toml and build.gradle.kts
- [ ] Complete Task 2: Create ScalaNodeTypes class with all required node type definitions
- [ ] Complete Task 3: Create ScalaCollector class
- [ ] Complete Task 4: Add Scala to FileExtension enum
- [ ] Complete Task 5: Register ScalaCollector in AvailableCollectors enum
- [ ] Complete Task 6: Create test sample file and comprehensive ScalaCollectorTest
- [ ] Complete Task 7: Update README.md documentation
- [ ] Complete Task 8: Run and verify all tests pass

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Version Research Required**: The exact version of tree-sitter-scala from io.github.bonede needs to be verified on Maven Central before implementation. Based on other tree-sitter libraries in the project, it should follow the 0.2x.x version pattern.

- **Scala Tree-Sitter Grammar**: The Scala grammar node types will need to be researched. Useful resources:
  - https://github.com/tree-sitter/tree-sitter-scala (original grammar)
  - https://github.com/bonede/tree-sitter-ng (Java bindings project)
  - Use tree-sitter playground or CLI to inspect Scala parse trees

- **Scala-Specific Considerations**:
  - Pattern matching (match/case) should contribute to complexity based on number of cases
  - Case guards (case x if condition) should add complexity
  - For comprehensions should be analyzed for complexity
  - Implicit parameters need to be counted correctly
  - Partial functions should be counted as functions
  - Anonymous functions and lambdas should be counted as functions
  - Higher-order function calls don't inherently add complexity
  - Companion objects and regular objects handled correctly
  - Scaladoc comments should be recognized

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific Scala construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in ScalaNodeTypes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Future Enhancements**: If initial implementation doesn't handle all Scala constructs perfectly, document known limitations in README.md (similar to Ruby's lambda issue). These can be addressed in future iterations. Consider:
  - Macro definitions
  - Type-level programming constructs
  - Complex pattern matching with extractors
  - By-name parameters
