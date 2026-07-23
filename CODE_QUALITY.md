# Clean Code Standards

**Status:** ENFORCED during active refactoring  
**Target:** All new code and refactored code must meet these standards before merge  
**Accountability:** Code review will identify violations; fixes required before approval

---

## Overview

This codebase is committed to **clean code as a non-negotiable standard**. The current codebase is undergoing systematic improvement toward these principles. All contributions must exemplify clean code — no exceptions.

### Why Clean Code Matters Here

- **Readability**: Future maintainers (including future you) understand code without detective work
- **Maintainability**: Small, focused functions with clear names are easier to modify and test
- **Correctness**: Clear intent reduces bugs; magic numbers and ambiguous names breed errors
- **Collaboration**: New team members can onboard faster when code is self-explanatory
- **Refactoring Safety**: Well-factored code is safer to refactor without breaking things

---

## Mandatory Standards

### 1. Variable Naming

**RULE:** No single-letter variables (except loop counters in tight loops). All names must reveal intent.

**❌ BAD:**
```kotlin
val a = projectA
val b = projectB
val x = 42
val f = { -> doSomething() }
```

**✅ GOOD:**
```kotlin
val projectAJson = ProjectSerializer.serializeToString(projectA)
val projectBJson = ProjectSerializer.serializeToString(projectB)
val timeout = 42
val createStrategy = { MergeResolverStrategy.recursive(false) }
```

**Exception:** Loop counters in tight ranges are OK:
```kotlin
for (i in 0 until size) { ... }  // OK in 1-2 line loops
```

### 2. Magic Numbers and Strings

**RULE:** No hardcoded numbers or strings. Extract to named constants with context.

**❌ BAD:**
```kotlin
val firstNodes = children.take(3)  // Why 3?
val prefix = filename.substringBefore(".")  // Repeated 3 times
```

**✅ GOOD:**
```kotlin
companion object {
    private const val NODES_TO_SHOW_IN_ERROR = 3
}
val firstNodes = children.take(NODES_TO_SHOW_IN_ERROR)

private fun getFilePrefix(filename: String): String = filename.substringBefore(".")
val prefix = getFilePrefix(filename)
```

### 3. Method Size

**RULE:** Keep methods under 25 lines. If a method exceeds this, split it into focused helpers.

**Typical violations:**
- Multiple concerns in one method (e.g., validation + transformation + I/O)
- Deep nesting (>3 levels)
- Complex boolean logic
- Long chains of transformations

**✅ PATTERN: Split by concern**
```kotlin
fun processInput(data: String): Result {
    val validated = validateInput(data)        // Helper 1
    val transformed = transformData(validated) // Helper 2
    return writeOutput(transformed)             // Helper 3
}

private fun validateInput(data: String): ValidatedData { ... }
private fun transformData(data: ValidatedData): TransformedData { ... }
private fun writeOutput(data: TransformedData): Result { ... }
```

### 4. Comments

**RULE:** The default is **no comment**. Make the code explain itself through naming — rename the
method, extract a named helper, introduce a named constant or intermediate variable. Write a comment
only when that is impossible and a reader would otherwise draw a wrong conclusion; then it explains
*why*, never *what*.

**❌ BAD:**
```kotlin
// Loop through all projects
projects.forEach { project ->
    // Check if API version is compatible
    if (Project.isAPIVersionCompatible(project.apiVersion)) {
        // Add to list
        compatible.add(project)
    }
}
```

**✅ GOOD:**
```kotlin
// Only compatible versions can be merged in a single step; incompatible ones require conversion first.
val compatible = projects.filter { Project.isAPIVersionCompatible(it.apiVersion) }
```

**When to comment:**
- ✅ Non-obvious constraints or invariants
- ✅ Workarounds for specific bugs (reference the issue)
- ✅ Performance trade-offs
- ❌ Explaining obvious code
- ❌ Commented-out code (delete it)
- ❌ Prose that narrates a class, a template section, or a sequence of steps — rename and extract instead
- ❌ Doc comments (KDoc/JSDoc) that only repeat the signature

### 5. Function Parameters

**RULE:** Max 3-4 parameters. If you have more, group related ones into a data class.

**❌ BAD:**
```typescript
function getOutgoingEdgePoint(
    width: number,
    height: number,
    length: number,
    vector: Vector3,
    mapSize: number
): Point { ... }
```

**✅ GOOD:**
```typescript
interface EdgeContext {
    width: number
    height: number
    length: number
    mapSize: number
}

function getOutgoingEdgePoint(context: EdgeContext, vector: Vector3): Point { ... }
```

### 6. Code Duplication (DRY)

**RULE:** Extract any pattern that repeats 3+ times. Don't wait for 5 copies.

**❌ BAD:**
```kotlin
val ambiguousHashes = incomingLeaves.values
    .mapNotNull { it.checksum?.takeIf(String::isNotEmpty) }
    .groupingBy { it }
    .eachCount()
    .filterValues { it > 1 }
    .keys

// ... later ...

val collidingTargets = resolvedTargets.values
    .filterNotNull()
    .groupingBy { it }
    .eachCount()
    .filterValues { it > 1 }
    .keys
```

**✅ GOOD:**
```kotlin
private fun <T> findDuplicates(items: Iterable<T>): Set<T> =
    items.groupingBy { it }
        .eachCount()
        .filterValues { it > 1 }
        .keys

val ambiguousHashes = findDuplicates(incomingLeaves.values.mapNotNull { ... })
val collidingTargets = findDuplicates(resolvedTargets.values.filterNotNull())
```

### 7. Idiomatic Language Usage

**RULE:** Write in the idioms of the language, not as a universal pseudocode.

**Kotlin violations:**
```kotlin
// ❌ Using .contains() instead of in
if (!placedIncoming.keys.contains(it)) { ... }
// ✅
if (it !in placedIncoming.keys) { ... }

// ❌ Verbose filter+isEmpty
val unsupported = projects
    .filter { !Project.isAPIVersionCompatible(it.apiVersion) }
unsupported.isEmpty()
// ✅
projects.all { Project.isAPIVersionCompatible(it.apiVersion) }

// ❌ Manual iteration and adding
val merged = mutableListOf<Item>()
items.forEach { merged.add(it) }
// ✅
val merged = items.toMutableList()
// or better:
val merged = projects.flatMap { it.items }
```

**TypeScript violations:**
```typescript
// ❌ Cryptic abbreviations
const h = hierarchy(map)
// ✅
const nodeHierarchy = hierarchy(map)

// ❌ Complex nested transformations without intermediate vars
const result = data.entries
    .map(([k, v]) => ({ key: k, value: transform(v) }))
    .filter(item => item.value.isValid)
    .reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
// ✅ (break it into steps)
const transformed = data.entries.map(([k, v]) => ({
    key: k,
    value: transform(v)
}))
const valid = transformed.filter(item => item.value.isValid)
const result = Object.fromEntries(valid.map(({ key, value }) => [key, value]))
```

### 8. Complex Logic Clarity

**RULE:** Break complex conditional logic into named helper functions or intermediate variables.

**❌ BAD:**
```kotlin
return (0 until minSize).firstOrNull {
    firstEdges[firstEdges.size - (it + 1)] != secondEdges[secondEdges.size - (it + 1)]
} ?: minSize
```

**✅ GOOD:**
```kotlin
return (0 until minSize).firstOrNull { offset ->
    val firstIdx = firstEdges.size - offset - 1
    val secondIdx = secondEdges.size - offset - 1
    firstEdges[firstIdx] != secondEdges[secondIdx]
} ?: minSize
```

Even better — extract to a named function:
```kotlin
private fun findFirstDifference(firstEdges: List<String>, secondEdges: List<String>): Int {
    val minSize = minOf(firstEdges.size, secondEdges.size)
    return (0 until minSize).firstOrNull { offset ->
        val firstIdx = firstEdges.size - offset - 1
        val secondIdx = secondEdges.size - offset - 1
        firstEdges[firstIdx] != secondEdges[secondIdx]
    } ?: minSize
}
```

### 9. Type Safety and Clarity

**RULE:** Avoid ambiguous types (e.g., `Pair<Boolean, T>`). Use data classes or interfaces.

**❌ BAD:**
```kotlin
val grouped: List<Pair<Boolean, List<File>>> = ...
grouped.forEach { (exactMatch, files) -> ... }  // What does Boolean mean?
```

**✅ GOOD:**
```kotlin
data class FileGroup(val isExactMatch: Boolean, val files: List<File>)

val grouped: List<FileGroup> = ...
grouped.forEach { (isExactMatch, files) -> ... }  // Clear intent
```

---

## Review Checklist

During code review, violations of these standards will be identified:

- [ ] All variables have descriptive names (>2 chars, no single letters except loop counters)
- [ ] No magic numbers or strings (all extracted to named constants)
- [ ] No method exceeds 25 lines (split if longer)
- [ ] Comments explain *why*, not *what*; no commented-out code
- [ ] Max 3-4 parameters per function (or grouped in data class)
- [ ] No repeated code patterns (DRY principle enforced)
- [ ] Idiomatic language usage (Kotlin, TypeScript, or Java conventions)
- [ ] Complex logic has clear intermediate steps or helper functions
- [ ] Type clarity (no ambiguous Pair/Tuple types where a class fits better)

---

## Refactoring Guidance

### When Code Violates These Standards

1. **Identify the violation** during your own code review before submitting
2. **Fix it immediately** — don't wait for PR feedback
3. **Break it into steps** if the fix is substantial:
   - Structural change first (rename, extract, move)
   - Behavioral change second
   - Commit separately

### Common Refactoring Patterns

#### Extracting Magic Numbers
```kotlin
// Before
children.take(3)

// After
companion object {
    private const val PREVIEW_LIMIT = 3
}
children.take(PREVIEW_LIMIT)
```

#### Splitting Long Methods
```kotlin
// Before
fun process(data: Input): Output {
    // 50 lines of validation, transformation, output
}

// After
fun process(data: Input): Output {
    val validated = validate(data)
    val transformed = transform(validated)
    return serialize(transformed)
}

private fun validate(data: Input): ValidatedData { ... }
private fun transform(data: ValidatedData): TransformedData { ... }
private fun serialize(data: TransformedData): Output { ... }
```

#### Removing Duplication
```kotlin
// Before (pattern repeated 4 times)
val a = items.groupingBy { it }.eachCount().filterValues { it > 1 }.keys
val b = other.groupingBy { it }.eachCount().filterValues { it > 1 }.keys

// After
private fun <T> findDuplicates(items: Iterable<T>): Set<T> =
    items.groupingBy { it }.eachCount().filterValues { it > 1 }.keys

val a = findDuplicates(items)
val b = findDuplicates(other)
```

---

## Current State and Roadmap

This codebase is **actively improving** toward these standards. As of 2026-07-15:

- **Analyzed:** 1,497 files in active branch
- **Issues Found:** 28 documented violations in recent commits
- **Status:** Systematic cleanup in progress

See `plans/2026-07-15-clean-code-cleanup-findings.md` for detailed violation list and action items.

---

## Tools

**Kotlin:**
- `./gradlew ktlintCheck` — Detect formatting violations
- `./gradlew ktlintFormat` — Auto-fix formatting

**TypeScript:**
- `npm run format:check` — Detect Biome violations
- `npm run format` — Auto-fix formatting

**Both:**
- Use an IDE with live inspection (IntelliJ, VS Code)
- Enable auto-format on save

---

## Exceptions

There are **no exceptions** to these standards. However:

- **Legacy code:** May not meet standards; fix during refactoring when touching it
- **Tests:** Same standards apply; readable tests are crucial
- **Generated code:** Excluded (e.g., generated JSON schemas)
- **Third-party code:** Not applicable

---

## Questions?

If a standard is unclear or you disagree with it, raise it in a discussion. But code will not merge until violations are resolved.
