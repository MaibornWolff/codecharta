---
name: Add Message Chains Code Smell Metric
issue: #4353
state: todo
version: 1
---

## Goal

Add a new "message_chains" code smell metric to the UnifiedParser that detects when a function is called four or more times in a row (e.g., `a().b().c().d()`), which is considered a code smell indicating potential violation of the Law of Demeter across all supported languages.

## Tasks

### 1. Create MessageChainsCalc calculator
Create a new metric calculator that implements `MetricPerFileCalc` interface to detect chained method calls. The calculator should:
- Traverse tree-sitter nodes to identify member access/call expressions
- Count consecutive chains of 4 or more calls
- Use language-specific node types from the node type provider
- Return the count of message chain occurrences per file

### 2. Add node types for all languages
For each of the 13 supported languages, identify and add the appropriate tree-sitter node types that represent member access and method call expressions:
- Javascript/Typescript: `member_expression`, `call_expression`
- Java: `method_invocation`, `field_access`
- Kotlin: `call_expression`, `navigation_expression`
- C#: `member_access_expression`, `invocation_expression`
- C++: `call_expression`, `field_expression`
- C: `call_expression`, `field_expression`
- Python: `attribute`, `call`
- Go: `selector_expression`, `call_expression`
- PHP: `member_call_expression`, `scoped_call_expression`
- Ruby: `call`
- Swift: `call_expression`, `navigation_expression`
- Bash: (investigate if applicable)

Add `messageChainsNodeTypes` to the `MetricNodeTypes` interface and implement in all language-specific node type classes.

### 3. Register metric in enum and calculator map
- Add `MESSAGE_CHAINS("message_chains")` to `AvailableFileMetrics` enum in `MetricNodeTypes.kt`
- Add `messageChainsCalc` instance to `MetricsToCalculatorsMap` class
- Wire up the calculator in the `getPerFileMetricInfo()` map

### 4. Integrate into MetricCollector
- Add `MESSAGE_CHAINS_THRESHOLD = 4` constant to `MetricCollector`
- Extend `countCodeSmells()` method to include message chains calculation
- The metric should count files that contain one or more message chains (binary: 1 if chains exist, 0 otherwise) OR count total occurrences (to be clarified based on code smell pattern)

### 5. Add AttributeDescriptor
Add entry to `AttributeDescriptors.kt` with:
- Title: "Message Chains"
- Description: "Code smell showing occurrences of method call chains with 4 or more consecutive calls (e.g., a().b().c().d()), indicating potential Law of Demeter violations"
- Link: unified parser docs
- Direction: -1 (negative indicator)
- Analyzers: unifiedParser

### 6. Write comprehensive tests
Create tests following Arrange-Act-Assert pattern with "should" naming:
- Test files with no message chains (should return 0)
- Test files with exactly 3 chained calls (should return 0)
- Test files with exactly 4 chained calls (should return count)
- Test files with more than 4 chained calls (should return count)
- Test multiple message chains in same file
- Test chains across multiple languages (sample from JS, Java, Python, etc.)
- Test edge cases like nested chains or chains in different statements

### 7. Update documentation
Add "Message Chains" row to the "Supported Metrics" table in `analysis/analysers/parsers/UnifiedParser/README.md` with description matching the AttributeDescriptor.

## Steps

- [ ] Complete Task 1: Create MessageChainsCalc calculator class
- [ ] Complete Task 2: Add messageChainsNodeTypes to all language NodeTypes classes
- [ ] Complete Task 3: Register metric in AvailableFileMetrics enum and MetricsToCalculatorsMap
- [ ] Complete Task 4: Integrate message chains calculation into MetricCollector
- [ ] Complete Task 5: Add AttributeDescriptor for message_chains metric
- [ ] Complete Task 6: Write comprehensive tests for message chains detection
- [ ] Complete Task 7: Update UnifiedParser README documentation
- [ ] Verify all tests pass: `./gradlew :analysers:parsers:UnifiedParser:test`
- [ ] Run ktlintFormat: `./gradlew ktlintFormat`

## Notes

- **Threshold**: Using 4 calls as the minimum (a().b().c().d()) based on standard code smell definition
- **Metric Type**: Per-file metric counting total occurrences, similar to excessive_comments pattern
- **All Languages**: Must implement for all 13 supported languages
- **Chain Detection Logic**: A chain of N calls means traversing N levels deep in the AST where each parent is a member access/call expression
- **Tree-Sitter Research**: For each language, consult the respective tree-sitter grammar's `node-types.json` to identify correct node type names
- **Testing Strategy**: Prioritize cross-language testing to ensure the metric works consistently across different syntax patterns
