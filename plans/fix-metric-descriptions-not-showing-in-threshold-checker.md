---
name: Fix Metric Descriptions Not Showing in MetricThresholdChecker
issue: TBD
state: complete
version: 1.0
---

## Goal

Fix the bug where metric descriptions are not displayed in MetricThresholdChecker output, even though the display logic exists in ViolationGroupRenderer.

## Problem Analysis

The MetricThresholdChecker uses ProjectScanner directly (bypassing UnifiedParser) to analyze files. However, ProjectScanner does not add AttributeDescriptors to the ProjectBuilder, so the resulting Project has an empty attributeDescriptors map.

**Current Flow:**
1. MetricThresholdChecker creates ProjectScanner with a ProjectBuilder
2. ProjectScanner.traverseInputProject() parses files and adds nodes
3. ProjectScanner DOES NOT call projectBuilder.addAttributeDescriptions()
4. project.attributeDescriptors is empty
5. ViolationGroupRenderer receives empty map, displays no descriptions

**UnifiedParser Flow (working):**
1. UnifiedParser creates ProjectScanner
2. UnifiedParser calls projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
3. Descriptions are available in the project

## Solution

Add the AttributeDescriptors from UnifiedParser to the ProjectBuilder in MetricThresholdChecker after creating the ProjectScanner.

## Tasks

- [ ] Import `getAttributeDescriptors()` from UnifiedParser package in MetricThresholdChecker
- [ ] Call `projectBuilder.addAttributeDescriptions(getAttributeDescriptors())` before building the project
- [ ] Test manually that descriptions now appear in violation output
- [ ] Add integration test to verify descriptions are displayed
- [ ] Update existing test to use real AttributeDescriptors instead of emptyMap()

## Implementation Steps

### Step 1: Update MetricThresholdChecker.kt

In the `analyzeProject()` method, after creating ProjectScanner but before building:

```kotlin
private fun analyzeProject(inputPath: File): Project {
    if (verbose) {
        error.println("Analyzing project at: ${inputPath.absolutePath}")
    }

    val projectBuilder = ProjectBuilder()
    val useGitignore = !bypassGitignore

    val projectScanner = ProjectScanner(
        inputPath,
        projectBuilder,
        excludePatterns,
        fileExtensions,
        emptyMap(),
        useGitignore
    )

    projectScanner.traverseInputProject(verbose)

    // ADD THIS LINE:
    projectBuilder.addAttributeDescriptions(
        de.maibornwolff.codecharta.analysers.parsers.unified.getAttributeDescriptors()
    )

    if (!projectScanner.foundParsableFiles()) {
        Logger.warn { "No parsable files found in the given input path" }
    }

    return projectBuilder.build()
}
```

### Step 2: Manual Testing

Create a test config and run against a sample project to verify descriptions appear:

```bash
cd analysis
./gradlew installDist

# Create test threshold config
cat > /tmp/test-thresholds.yml << EOF
file_metrics:
  rloc:
    max: 10
  complexity:
    max: 5
EOF

# Run against MetricThresholdChecker itself (will likely have violations)
./build/install/codecharta-analysis/bin/ccsh metricthresholdchecker \
  analysers/tools/MetricThresholdChecker/src \
  --config /tmp/test-thresholds.yml

# Verify output shows descriptions like:
# "Number of lines that contain at least one character which is neither..."
```

### Step 3: Add Integration Test

Add test in MetricThresholdCheckerTest.kt to verify descriptions appear in output:

```kotlin
@Test
fun `should display metric descriptions in violation output`() {
    // Arrange
    val testFile = File.createTempFile("test", ".kt")
    testFile.writeText("fun a() {}\n".repeat(100)) // Create file with violations

    val configFile = File.createTempFile("config", ".yml")
    configFile.writeText("file_metrics:\n  rloc:\n    max: 10\n")

    val output = ByteArrayOutputStream()
    val error = ByteArrayOutputStream()

    // Act
    MetricThresholdChecker.mainWithOutputStream(
        PrintStream(output),
        PrintStream(error),
        arrayOf(testFile.absolutePath, "--config", configFile.absolutePath)
    )

    // Assert
    val errorOutput = error.toString()
    assertThat(errorOutput).contains("Metric: rloc")
    assertThat(errorOutput).contains("Number of lines that contain at least one character")

    // Cleanup
    testFile.delete()
    configFile.delete()
}
```

### Step 4: Update Existing Tests

Update ViolationFormatterTest tests that pass `emptyMap()` for attributeDescriptors to use realistic test data where appropriate.

## Testing Checklist

- [ ] Manual test shows descriptions appearing in output
- [ ] Integration test passes
- [ ] All existing tests still pass
- [ ] Tested with multiple metrics (rloc, complexity, number_of_functions)
- [ ] Tested with metrics that don't have descriptions (graceful handling)

## Notes

### Why This Bug Occurred

The original implementation of metric descriptions was done in ViolationGroupRenderer, but the MetricThresholdChecker was added later and uses ProjectScanner directly. The connection between ProjectScanner usage and AttributeDescriptor registration was missed.

### Alternative Solutions Considered

1. **Have ProjectScanner add AttributeDescriptors**: This would require ProjectScanner to know about UnifiedParser's AttributeDescriptors, creating a coupling issue.

2. **Make getAttributeDescriptors() a static utility**: This is the chosen approach - treat AttributeDescriptors as a shared registry that any component can use.

3. **Create a separate MetricDescriptorRegistry**: Over-engineered for current needs.

## Future Enhancements

- Consider centralizing AttributeDescriptor registration in a shared registry
- Add descriptions for metrics from other parsers/importers
- Add remediation advice to AttributeDescriptor model
