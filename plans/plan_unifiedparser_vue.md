---
name: Add Vue Language Support to UnifiedParser
issue: #4365
state: todo
version: 1.0
---

## Goal

Add Vue language support to the UnifiedParser by integrating the tree-sitter-vue implementation from io.github.bonede, creating language-specific queries for Vue syntax (including template, script, and style sections), and ensuring all supported metrics are calculated correctly for Vue single-file components (.vue files).

## Tasks

### 1. Add tree-sitter-vue Dependency

Add the tree-sitter-vue library from io.github.bonede to the project dependencies via libs.versions.toml. This follows the established pattern used for other languages (Kotlin, Java, TypeScript, etc.).

- Add version entry in `[versions]` section of `analysis/gradle/libs.versions.toml`
- Add library entry in `[libraries]` section of `analysis/gradle/libs.versions.toml`
- Follow naming pattern: `tree-sitter-vue = "X.Y.Z"` for version, `treesitter-vue = { group = "io.github.bonede", name = "tree-sitter-vue", version.ref = "tree-sitter-vue"}` for library
- Verify the latest available version on Maven Central before adding
- Add dependency to UnifiedParser's build.gradle.kts

### 2. Create VueNodeTypes Class

Create a new VueNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to Vue that correspond to each metric.

- Create `VueNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Implement all required node type definitions:
  - `logicComplexityNodeTypes`: if statements, loops (for, while, do-while), switch/case, ternary operators, logical operators (&&, ||, ??), catch clauses, Vue directives (v-if, v-for, v-else-if counted via template parsing)
  - `functionComplexityNodeTypes`: function declarations, arrow functions, method definitions, function expressions, Vue component lifecycle hooks, computed properties, watch functions
  - `commentLineNodeTypes`: single-line comments (//), multi-line comments (/* */), HTML comments (<!-- -->), Vue template comments
  - `numberOfFunctionsNodeTypes`: function declarations, method definitions, function expressions, arrow functions in variable declarators
  - `functionBodyNodeTypes`: statement blocks
  - `functionParameterNodeTypes`: function parameters
  - `messageChainsNodeTypes`: member expressions and call expressions (for Vue method chaining detection)
  - `messageChainsCallNodeTypes`: call expressions
- Research Vue's tree-sitter grammar to identify correct node type names (use tree-sitter-vue documentation or inspect Vue SFC parse trees)
- Consider Vue-specific constructs:
  - Single File Components with template, script, and style sections
  - Vue directives (v-if, v-for, v-bind, v-on, etc.) in templates
  - Component lifecycle hooks (onMounted, onUpdated, etc.)
  - Composition API patterns (setup(), ref(), reactive(), computed(), watch())
  - Options API patterns (data(), methods, computed, watch)

### 3. Create VueCollector Class

Create a minimal VueCollector class that extends MetricCollector and uses the tree-sitter-vue parser with VueNodeTypes.

- Create `VueCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the simple pattern from TypescriptCollector: pass TreeSitterVue() and VueNodeTypes() to parent constructor
- No custom logic needed initially unless Vue requires special handling for SFC structure (can be added later if tests reveal issues)

### 4. Add Vue FileExtension Enum

Add VUE entry to the FileExtension enum to recognize .vue files.

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `VUE(".vue")` entry following the pattern of other languages
- Place alphabetically (likely after TYPESCRIPT and before any other entries)

### 5. Register Vue in AvailableCollectors

Register the new VueCollector in the AvailableCollectors enum to make it accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `VUE(FileExtension.VUE, ::VueCollector)` entry
- Place alphabetically

### 6. Create Test File and VueCollectorTest

Create comprehensive tests for the VueCollector following the TDD approach and existing test patterns.

- Create test Vue sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/vueSample.vue` with examples of:
  - Single File Component structure (template, script, style sections)
  - Composition API patterns (setup(), ref(), reactive(), computed(), watch())
  - Options API patterns (data(), methods, computed, watch)
  - Component lifecycle hooks (onMounted, onBeforeUnmount, etc.)
  - Template directives (v-if, v-for, v-bind, v-on, v-model)
  - Control flow in script section (if, loops, switch)
  - Functions, arrow functions, method definitions
  - Comments (single-line, multi-line, HTML comments in template)
  - TypeScript support in script setup
- Create `VueCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific Vue constructs:
  - Template section is parsed correctly
  - Script section functions are counted
  - Lifecycle hooks are counted as functions
  - Computed properties contribute to complexity
  - Watch functions are counted
  - Template directives don't incorrectly inflate function counts
  - HTML comments in templates are counted
  - Both Composition API and Options API patterns work
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 7. Update Documentation

Update the UnifiedParser README to include Vue in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| Vue | .vue |`
- Place alphabetically
- Add note about Vue SFC support (template + script + style sections)

### 8. Verify and Run Tests

Run all tests to ensure Vue support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust VueNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green
- Verify that Vue SFCs are parsed correctly (template, script, and style sections)

### 9. Consider JSX/TSX Compatibility

Vue templates with JSX/TSX syntax may need special handling. Evaluate if additional configuration or node types are needed.

- Test Vue components using JSX/TSX syntax (render functions)
- Verify that metrics are calculated correctly for JSX-style Vue components
- Add additional node types to VueNodeTypes if needed
- Document any limitations or known issues with JSX/TSX Vue components

## Steps

- [ ] Complete Task 1: Add tree-sitter-vue dependency to libs.versions.toml and build.gradle.kts
- [ ] Complete Task 2: Create VueNodeTypes class with all required node type definitions
- [ ] Complete Task 3: Create VueCollector class
- [ ] Complete Task 4: Add Vue to FileExtension enum
- [ ] Complete Task 5: Register VueCollector in AvailableCollectors enum
- [ ] Complete Task 6: Create test sample file and comprehensive VueCollectorTest
- [ ] Complete Task 7: Update README.md documentation
- [ ] Complete Task 8: Run and verify all tests pass
- [ ] Complete Task 9: Evaluate and test JSX/TSX compatibility

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Version Research Required**: The exact version of tree-sitter-vue from io.github.bonede needs to be verified on Maven Central before implementation. Based on other tree-sitter libraries in the project, it should follow the 0.2x.x version pattern.

- **Vue Tree-Sitter Grammar**: The Vue grammar node types will need to be researched. Useful resources:
  - https://github.com/tree-sitter/tree-sitter-vue (if available)
  - https://github.com/bonede/tree-sitter-ng (Java bindings project)
  - Use tree-sitter playground or CLI to inspect Vue SFC parse trees
  - Note: Vue SFCs contain three sections (template, script, style) that may be parsed differently

- **Vue-Specific Considerations**:
  - Single File Components (SFCs) have separate template, script, and style sections - ensure all are parsed
  - Template directives (v-if, v-for, etc.) should not be counted as functions but may contribute to complexity
  - Composition API patterns (setup(), ref(), reactive()) need proper recognition
  - Options API patterns (data(), methods, computed, watch) should be counted appropriately
  - Lifecycle hooks (onMounted, onBeforeUnmount, etc.) should be counted as functions
  - Computed properties may need special handling for complexity
  - Watch functions should be counted as functions
  - HTML comments in templates (<!-- -->) should be counted
  - TypeScript support in script setup should work if tree-sitter-vue supports it
  - JSX/TSX render functions may require additional node types

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific Vue construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in VueNodeTypes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Future Enhancements**: If initial implementation doesn't handle all Vue constructs perfectly (e.g., template directives complexity, Composition API patterns), document known limitations in README.md. These can be addressed in future iterations.

- **Comparison with TypeScript/JavaScript**: Since Vue scripts often use TypeScript or JavaScript, the node types may overlap significantly with TypescriptNodeTypes/JavascriptNodeTypes. The key difference is handling the SFC structure and Vue-specific patterns.
