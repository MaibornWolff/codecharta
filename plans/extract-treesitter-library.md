---
name: Extract TreeSitter Library
issue: N/A
state: progress
version: 1
---

## Goal

Extract the TreeSitter-based metric calculation from CodeCharta's UnifiedParser into a standalone Kotlin library (`TreeSitterLibrary`). The library provides a simple API: `parse(file) -> Map<String, Double>` supporting all 14 languages.

## Tasks

### 1. Set up Gradle project structure
- Initialize Kotlin Gradle project in `/home/chris/Projects/SHC/TreeSitterLibrary`
- Configure build.gradle.kts with TreeSitter dependencies (tree-sitter-ng + 14 language bindings)
- Set up test framework (JUnit 5 / Kotest)
- Configure publishing for Maven artifact

### 2. Extract core metric calculation interfaces
- Copy and adapt `MetricCalc`, `MetricPerFileCalc`, `MetricPerFunctionCalc` interfaces
- Copy `CalculationContext` and `CalculationExtensions`
- Copy `TreeNodeTypes`, `NestedNodeType` classes
- Remove any CodeCharta-specific imports (should be minimal)

### 3. Extract metric calculator implementations
- Copy all 6 metric calculators:
  - `ComplexityCalc`
  - `CommentLinesCalc`
  - `NumberOfFunctionsCalc`
  - `ParametersPerFunctionCalc`
  - `RealLinesOfCodeCalc`
  - `MessageChainsCalc`
- Copy `MetricsToCalculatorsMap` orchestration

### 4. Extract language node type configurations
- Copy all 14 language NodeTypes files:
  - Java, Kotlin, TypeScript, JavaScript, Python, Go, PHP, Ruby, Swift, Bash, C#, C++, C, Objective-C
- Copy `MetricNodeTypes` interface

### 5. Create simplified MetricCollector
- Extract tree walking logic from existing `MetricCollector`
- Remove `MutableNode` return type - return `Map<String, Double>` instead
- Remove checksum calculation (or make optional)
- Remove CodeCharta-specific attribute processing

### 6. Create public API
- Design simple entry point class (e.g., `TreeSitterMetrics`)
- API should be:
  ```kotlin
  fun parse(file: File): MetricsResult
  fun parse(content: String, language: Language): MetricsResult

  data class MetricsResult(
      val metrics: Map<String, Double>,
      val perFunctionMetrics: Map<String, FunctionMetrics>?
  )
  ```
- Language detection from file extension
- Support direct content parsing with explicit language

### 7. Create language registry
- Extract `AvailableCollectors` concept into `SupportedLanguages` enum
- Map file extensions to TreeSitter languages and NodeTypes
- Create collector factory pattern

### 8. Write tests
- Unit tests for each metric calculator
- Integration tests parsing real files for each language
- Copy relevant tests from UnifiedParser test suite

### 9. Update UnifiedParser to use library
- Add TreeSitterLibrary as dependency to UnifiedParser
- Refactor UnifiedParser to use library API
- Map library output back to `MutableNode` for CodeCharta compatibility
- Keep existing CodeCharta-specific features (directory scanning, .gitignore, checksums)

## Steps

- [x] Complete Task 1: Set up Gradle project structure
- [x] Complete Task 2: Extract core metric calculation interfaces
- [x] Complete Task 3: Extract metric calculator implementations
- [x] Complete Task 4: Extract language node type configurations
- [x] Complete Task 5: Create simplified MetricCollector
- [x] Complete Task 6: Create public API
- [x] Complete Task 7: Create language registry
- [x] Complete Task 8: Write tests
- [ ] Complete Task 9: Update UnifiedParser to use library

## Notes

- Keep package structure similar but under new namespace (e.g., `io.treesitter.metrics`)
- No Picocli or Kotter dependencies - pure library
- No CodeCharta model dependencies (Project, Node, etc.)
- Metrics included: complexity, logic_complexity, comment_lines, rloc, loc, number_of_functions, long_method, long_parameter_list, excessive_comments, comment_ratio, message_chains, plus per-function aggregates
- TreeSitter dependency: `org.treesitter:tree-sitter-ng` + language-specific bindings
