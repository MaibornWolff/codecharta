# Restructure MetricThresholdChecker Folder Structure

state: complete

## Chosen Structure

**Option 3: Detailed with output/renderers/ and output/formatters/**

```
metricthresholdchecker/
├── MetricThresholdChecker.kt
├── Dialog.kt
├── model/
│   └── ThresholdConfiguration.kt
├── config/
│   └── ThresholdConfigurationLoader.kt
├── validation/
│   └── ThresholdValidator.kt
└── output/
    ├── ViolationFormatter.kt
    ├── renderers/
    │   ├── SummaryRenderer.kt
    │   ├── ViolationTableRenderer.kt
    │   └── ViolationGroupRenderer.kt
    └── formatters/
        ├── NumberFormatter.kt
        ├── PathFormatter.kt
        ├── TextWrapper.kt
        ├── ExcessCalculator.kt
        ├── AnsiColorFormatter.kt
        └── ConsoleWriter.kt
```

## Overview
Reorganize MetricThresholdChecker from flat 17-file structure into organized subdirectories matching patterns used in other analysers.

## Current State

All 17 files are in: `analysers/tools/metricthresholdchecker/`

**Main Files:**
- MetricThresholdChecker.kt (main entry point)
- Dialog.kt (interactive mode)

**Configuration:**
- ThresholdConfiguration.kt (data model)
- ThresholdConfigurationLoader.kt (loads config from files)

**Validation:**
- ThresholdValidator.kt (validates thresholds)

**Output/Formatting (10 files):**
- ViolationFormatter.kt (facade)
- SummaryRenderer.kt
- ViolationTableRenderer.kt
- ViolationGroupRenderer.kt
- NumberFormatter.kt
- PathFormatter.kt
- TextWrapper.kt
- ExcessCalculator.kt
- AnsiColorFormatter.kt
- ConsoleWriter.kt

## Pattern Analysis

**Simple Tools** (ValidationTool, InspectionTool):
- 4-6 files total
- Flat structure in single directory

**Medium Tools** (MergeFilter):
- ~10 files
- Main files in root + subdirectories for specialized logic (e.g., `mimo/`)

**Complex Parsers** (GitLogParser, SonarImporter):
- 20+ files
- Main files in root + multiple subdirectories: `converter/`, `util/`, `input/`, `parser/`, `model/`

## Proposed Structure Options

### Option 1: Simple (Minimal Subdirectories)
```
metricthresholdchecker/
├── MetricThresholdChecker.kt
├── Dialog.kt
├── ThresholdConfiguration.kt
├── ThresholdConfigurationLoader.kt
├── ThresholdValidator.kt
└── output/
    ├── ViolationFormatter.kt
    ├── SummaryRenderer.kt
    ├── ViolationTableRenderer.kt
    ├── ViolationGroupRenderer.kt
    ├── NumberFormatter.kt
    ├── PathFormatter.kt
    ├── TextWrapper.kt
    ├── ExcessCalculator.kt
    ├── AnsiColorFormatter.kt
    └── ConsoleWriter.kt
```

### Option 2: Moderate (Logical Grouping)
```
metricthresholdchecker/
├── MetricThresholdChecker.kt
├── Dialog.kt
├── config/
│   ├── ThresholdConfiguration.kt
│   └── ThresholdConfigurationLoader.kt
├── validation/
│   └── ThresholdValidator.kt
└── output/
    ├── ViolationFormatter.kt
    ├── renderers/
    │   ├── SummaryRenderer.kt
    │   ├── ViolationTableRenderer.kt
    │   └── ViolationGroupRenderer.kt
    └── formatters/
        ├── NumberFormatter.kt
        ├── PathFormatter.kt
        ├── TextWrapper.kt
        ├── ExcessCalculator.kt
        ├── AnsiColorFormatter.kt
        └── ConsoleWriter.kt
```

### Option 3: Detailed (Fine-grained Organization)
```
metricthresholdchecker/
├── MetricThresholdChecker.kt
├── Dialog.kt
├── model/
│   └── ThresholdConfiguration.kt
├── config/
│   └── ThresholdConfigurationLoader.kt
├── validation/
│   └── ThresholdValidator.kt
└── output/
    ├── ViolationFormatter.kt
    ├── renderers/
    │   ├── SummaryRenderer.kt
    │   ├── ViolationTableRenderer.kt
    │   └── ViolationGroupRenderer.kt
    └── util/
        ├── NumberFormatter.kt
        ├── PathFormatter.kt
        ├── TextWrapper.kt
        ├── ExcessCalculator.kt
        ├── AnsiColorFormatter.kt
        └── ConsoleWriter.kt
```

## Questions

1. **Which structure option do you prefer?**
   - Option 1: Simple (1 subdirectory)
   - Option 2: Moderate (3 subdirectories with nested structure)
   - Option 3: Detailed (4 subdirectories with nested structure)
   - Custom: Suggest your own structure

2. **Should we use nested subdirectories?**
   - Yes, group related files further (e.g., `output/renderers/`, `output/formatters/`)
   - No, keep subdirectories flat (all files directly in `output/`)

3. **Package naming convention:**
   - Keep full lowercase: `metricthresholdchecker.output.renderers`
   - Use camelCase: `metricThresholdChecker.output.renderers`
   - Note: Current code uses lowercase `metricthresholdchecker`

## Implementation Steps

### Phase 1: Create New Directory Structure ✅
- [x] Create subdirectories based on chosen option
- [x] Ensure package naming matches directory structure

### Phase 2: Move Source Files ✅
- [x] Move files to new locations using `git mv` to preserve history
- [x] Update package declarations in moved files
- [x] Update imports in all affected files

### Phase 3: Move Test Files ✅
- [x] Create matching test directory structure
- [x] Move test files using `git mv`
- [x] Update package declarations in test files
- [x] Update imports in test files

### Phase 4: Verification ✅
- [x] Run `./gradlew build` to ensure compilation succeeds
- [x] Run `./gradlew test` to ensure all tests pass (all 131 tests passing!)
- [x] Run `./gradlew ktlintCheck` to verify code style

### Phase 5: Update Documentation ✅
- [x] No README updates needed (no file location references)

## Benefits
- **Clarity**: Logical grouping makes code easier to navigate
- **Consistency**: Matches patterns used in other analysers
- **Maintainability**: Related files grouped together
- **Scalability**: Easy to add more files in appropriate locations

## Risks
- Import statement updates needed across all files
- Test file structure must mirror main structure
- Git history preserved by using `git mv`
