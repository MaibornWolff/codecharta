---
name: Add TSX/JSX Language Support to UnifiedParser
issue: #4360
state: todo
version: 1.0
---

## Goal

Add TSX (TypeScript with JSX) and JSX (JavaScript with JSX) language support to the UnifiedParser by utilizing the existing tree-sitter-typescript library which provides separate TSX and TypeScript grammars, creating TSX/JSX-specific node type mappings where needed, and ensuring all supported metrics are calculated correctly for .tsx and .jsx files.

## Tasks

### 1. Add TSX and JSX FileExtension Enums

Add TSX and JSX entries to the FileExtension enum to recognize .tsx and .jsx files.

- Edit `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `TSX(".tsx")` entry following the pattern of other languages
- Add `JSX(".jsx")` entry following the pattern of other languages
- Place alphabetically (TSX after TYPESCRIPT, JSX after JAVASCRIPT)

### 2. Create TsxNodeTypes Class

Create a new TsxNodeTypes class that implements the MetricNodeTypes interface. This class defines the tree-sitter node types specific to TSX that correspond to each metric. TSX grammar extends TypeScript grammar with JSX elements.

- Create `TsxNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Can initially inherit from TypescriptNodeTypes or reuse the same node type definitions
- Implement all required node type definitions (same as TypeScript initially):
  - `logicComplexityNodeTypes`: if, loops, ternary, switch/case, catch, logical operators
  - `functionComplexityNodeTypes`: functions, arrow functions, methods, generators
  - `commentLineNodeTypes`: single-line comments, multi-line comments
  - `numberOfFunctionsNodeTypes`: function declarations, method definitions
  - `functionBodyNodeTypes`: statement blocks
  - `functionParameterNodeTypes`: required parameters
- Research TSX's tree-sitter grammar to identify if any JSX-specific node types need special handling (e.g., JSX elements, JSX expressions)
- Note: JSX elements should generally not count as complexity unless they contain logic (conditional rendering, etc.)

### 3. Create JsxNodeTypes Class

Create a new JsxNodeTypes class that implements the MetricNodeTypes interface. JSX grammar extends JavaScript grammar with JSX elements.

- Create `JsxNodeTypes.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metricnodetypes/`
- Can initially inherit from JavascriptNodeTypes or reuse similar definitions
- Follow the same pattern as TypeScript/TSX relationship
- Consider JSX-specific constructs similar to TSX

### 4. Create TsxCollector Class

Create a minimal TsxCollector class that extends MetricCollector and uses the TreeSitterTsx parser with TsxNodeTypes.

- Create `TsxCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Use TreeSitterTsx() as the tree-sitter language parser (separate from TreeSitterTypescript)
- Pass TsxNodeTypes() as the node type provider
- Follow the simple pattern from TypescriptCollector
- Note: The existing tree-sitter-typescript library already provides both TreeSitterTypescript and TreeSitterTsx classes

### 5. Create JsxCollector Class

Create a minimal JsxCollector class that extends MetricCollector and uses the TreeSitterJsx parser with JsxNodeTypes.

- Create `JsxCollector.kt` in `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Research if tree-sitter-javascript provides a separate JSX parser or if JavaScript parser handles JSX
- If separate parser exists: use TreeSitterJsx(), otherwise may need to reuse TreeSitterJavascript()
- Pass JsxNodeTypes() as the node type provider
- May need to investigate if a separate tree-sitter-jsx dependency is required

### 6. Register TSX and JSX in AvailableCollectors

Register the new TsxCollector and JsxCollector in the AvailableCollectors enum to make them accessible to the parser.

- Edit `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/AvailableCollectors.kt`
- Add `TSX(FileExtension.TSX, ::TsxCollector)` entry
- Add `JSX(FileExtension.JSX, ::JsxCollector)` entry
- Place alphabetically

### 7. Create Test Files and Tests

Create comprehensive tests for the TsxCollector and JsxCollector following the TDD approach and existing test patterns.

- Create test TSX sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/tsxSample.tsx` with examples of:
  - React components (function components, class components)
  - JSX elements and fragments
  - Conditional rendering (ternary, &&, etc.)
  - TypeScript types and interfaces in TSX context
  - Hooks and arrow functions
  - Comments (single-line, multi-line, JSDoc)
- Create test JSX sample file in `analysis/analysers/parsers/UnifiedParser/src/test/resources/languageSamples/jsxSample.jsx` with similar React/JSX patterns
- Create `TsxCollectorTest.kt` in `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/de/maibornwolff/codecharta/analysers/parsers/unified/metriccollectors/`
- Create `JsxCollectorTest.kt` in same directory
- Follow the Arrange-Act-Assert pattern with clear comments
- Test specific TSX/JSX constructs:
  - JSX elements don't inflate complexity unnecessarily
  - Conditional rendering (ternary in JSX) counts correctly
  - Arrow functions in components are counted
  - TypeScript types in TSX don't break parsing
  - Comments within JSX are counted correctly
- Test all standard metrics: complexity, logic complexity, comment lines, functions, LOC, RLOC
- Test per-function metrics: parameters, complexity, RLOC (max/min/mean/median)

### 8. Update Documentation

Update the UnifiedParser README to include TSX and JSX in the supported languages table.

- Edit `analysis/analysers/parsers/UnifiedParser/README.md`
- Add row to "Supported Languages" table: `| TSX | .tsx |`
- Add row to "Supported Languages" table: `| JSX | .jsx |`
- Place alphabetically
- Add note explaining that TSX/JSX use the same tree-sitter-typescript library but separate grammars

### 9. Verify and Run Tests

Run all tests to ensure TSX/JSX support works correctly and doesn't break existing functionality.

- Run UnifiedParser tests: `cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test`
- Run integration tests if applicable: `./gradlew integrationTest`
- Fix any failing tests or metric calculation issues
- If tree-sitter node types are incorrect, adjust TsxNodeTypes/JsxNodeTypes based on test results
- Ensure all new tests pass and existing tests remain green
- Verify TypeScript and JavaScript tests still pass (no regression)

## Steps

- [ ] Complete Task 1: Add TSX and JSX to FileExtension enum
- [ ] Complete Task 2: Create TsxNodeTypes class with JSX-aware node type definitions
- [ ] Complete Task 3: Create JsxNodeTypes class
- [ ] Complete Task 4: Create TsxCollector class using TreeSitterTsx
- [ ] Complete Task 5: Create JsxCollector class (research JSX parser availability first)
- [ ] Complete Task 6: Register TsxCollector and JsxCollector in AvailableCollectors enum
- [ ] Complete Task 7: Create test sample files and comprehensive TsxCollectorTest and JsxCollectorTest
- [ ] Complete Task 8: Update README.md documentation
- [ ] Complete Task 9: Run and verify all tests pass

## Review Feedback Addressed

(To be filled in after code review)

## Notes

- **Existing Dependency**: The tree-sitter-typescript library (version 0.23.2) is already included in the project and provides both `TreeSitterTypescript()` and `TreeSitterTsx()` parsers. No new dependency addition is required for TSX support.

- **Separate Grammars**: TSX and TypeScript are treated as separate grammars in tree-sitter-typescript because TypeScript's type assertion syntax (`<Type>value`) conflicts with JSX element syntax (`<Component />`). In TSX files, the type assertion syntax is disabled in favor of the `as` syntax (`value as Type`).

- **JSX Parser Research Needed**: Need to verify if tree-sitter-javascript provides a separate JSX parser or if the JavaScript parser handles JSX natively. May need to check:
  - Maven Central for tree-sitter-jsx or tree-sitter-javascript-jsx
  - tree-sitter-javascript documentation
  - Potentially use tree-sitter-typescript's TSX parser for JSX files as well

- **TSX/JSX-Specific Considerations**:
  - JSX elements (`<div>`, `<Component />`) should not inflate complexity metrics
  - JSX expressions (`{variable}`, `{function()}`) should be counted normally
  - Conditional rendering patterns (ternary, `&&`, `||` in JSX) should count as logic complexity
  - Arrow functions used as component definitions should count as functions
  - TypeScript type annotations in TSX should not break parsing
  - Comments within JSX blocks (`{/* comment */}`) should be counted

- **Testing Strategy**: Follow TDD (Red → Green → Refactor):
  1. Write failing test for specific TSX/JSX construct
  2. Implement minimum node type mapping to pass
  3. Run all tests
  4. Refactor if needed
  5. Commit when all tests pass

- **Code Quality**: Follow project conventions:
  - Use block-body style with braces for functions
  - Add clear section comments in node type classes
  - Use descriptive variable names
  - No magic strings - extract constants if needed
  - Ensure all warnings are resolved

- **Node Type Reuse**: TsxNodeTypes can likely inherit from or delegate to TypescriptNodeTypes, and JsxNodeTypes can do the same with JavascriptNodeTypes. Only override if JSX-specific handling is needed.

- **Future Enhancements**: If initial implementation doesn't handle all JSX constructs perfectly (e.g., JSX fragments, spread attributes), document known limitations in README.md. These can be addressed in future iterations.
