# Known Issues

## Confirmed Issues

### Cycles Between Languages and Extractors

**Severity: High**

Circular dependencies exist between `languages/` and `features/extraction/extractors/languagespecific/`:

- Language definitions (e.g., `JavaDefinition.kt`) import language-specific extractors from `features/extraction/extractors/languagespecific/`
- This violates the intended architecture where `languages/` should be at a lower layer than `features/`

**Affected files:**
- `languages/JavaDefinition.kt` imports `extractInstanceofPatternVariable`, `extractLambdaSingleParameter`
- Similar patterns in `BashDefinition.kt`, `CDefinition.kt`, `CppDefinition.kt`, and other language definitions

**Impact:** Makes the codebase harder to understand and maintain. Language definitions contain too many implementation details that should be abstracted.

**Proposed fix:** Either:
1. Move language-specific extractors to `languages/` as part of the language definition
2. Make extractors injectable via the `LanguageDefinition` interface
3. Define extraction strategies in `shared/domain/` and reference them from language definitions

### API Layer Does More Than Pure Delegation

**Severity: Low**

`TreeSitterMetrics` and `TreeSitterExtraction` in `api/` do more than simple facade delegation:

1. **Orchestration**: Both resolve language definitions via `LanguageRegistry` before calling feature facades
2. **Result transformation**: `TreeSitterMetrics.parse()` filters metrics into `perFunctionMetrics` vs `fileMetrics` (lines 77-83)

**Current pattern:**
```kotlin
fun parse(content: String, language: Language): MetricsResult {
    val definition = LanguageRegistry.getLanguageDefinition(language)
    val treeSitterLanguage = LanguageRegistry.getTreeSitterLanguage(language)
    val metrics = MetricsFacade.collectMetrics(content, treeSitterLanguage, definition)
    // ... filtering logic ...
    return MetricsResult(fileMetrics, perFunctionMetrics)
}
```

**Pure delegation would be:**
```kotlin
fun parse(content: String, language: Language): MetricsResult {
    return MetricsFacade.parse(content, language)
}
```

**Impact:** Minor. The orchestration is reasonable for an API layer, and keeps feature facades decoupled from the `Language` enum. However, metric filtering is business logic that belongs in `MetricsFacade`.

**Proposed fix:** Move language resolution and result transformation into the feature facades, accepting `Language` directly.

---

---

## Accepted Limitations

### Delphi (v1)

**Severity: Low**

Known scope limits of the Delphi language support. None are blockers for DC's current use cases; tracked here so external consumers know not to rely on them.

- **Multi-constraint generics with comma separator capture only the trailing constraint.** `TFoo<T: TBase, U: IFoo>` produces `IFoo` only because tree-sitter-pascal 0.10.2 ERROR-recovers the leading constraint into a sibling node. Use the semicolon form `TFoo<T: TBase; U: IFoo>` to capture both constraints. Single-constraint generics (`TFoo<T: TBase>`) are unaffected.

See `plans/add-delphi-dependency-support.md` ("Accepted v1 limitations") for the full list and rationale.

---

## Previously Suspected (Not Confirmed)

The following issues were investigated but **not found**:

- **Facades avoided**: Facades (`MetricsFacade`, `ExtractionFacade`) are correctly used. API layer delegates to facades (though with orchestration - see above).
- **Magic values**: Constants are properly extracted to `companion object` blocks (e.g., `LONG_METHOD_THRESHOLD`, `MESSAGE_CHAINS_THRESHOLD`)
- **Excessive comments**: Comments are appropriate and explain non-obvious logic
- **Unused variables**: All declared variables are used
- **Complex if conditions**: Multi-condition checks exist but are well-formatted with each condition on its own line
