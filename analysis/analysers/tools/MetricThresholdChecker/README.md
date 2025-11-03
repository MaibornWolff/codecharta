# Metric Threshold Checker

The Metric Threshold Checker is a CLI tool that validates code metrics against configured thresholds for CI/CD pipelines. It uses the UnifiedParser internally to analyze code and reports violations when metrics exceed the specified limits.

## Usage

```bash
ccsh metricthresholdchecker <input-path> --config <config-file> [options]
```

### Parameters

- `<input-path>` - File or folder to analyze
- `-c, --config <config-file>` - Threshold configuration file (JSON or YAML) **(required)**
- `-e, --exclude <patterns>` - Comma-separated list of regex patterns to exclude files/folders
- `-fe, --file-extensions <extensions>` - Comma-separated list of file extensions to parse only those files
- `--bypass-gitignore` - Bypass .gitignore files and use regex-based exclusion instead
- `--verbose` - Enable verbose mode for detailed output

## Configuration Format

The threshold configuration file can be in either YAML or JSON format. All thresholds are defined under `file_metrics` since the UnifiedParser stores all metrics at the file level (including aggregated function statistics).

Each metric can have:
- `min`: Minimum acceptable value (violation if below)
- `max`: Maximum acceptable value (violation if above)
- Both `min` and `max` can be specified for the same metric

### Example Configuration (YAML)

```yaml
file_metrics:
  # Lines of code metrics
  rloc:
    max: 500                          # Real lines of code per file
  loc:
    max: 600                          # Total lines of code per file

  # Complexity metrics
  complexity:
    max: 100                          # Total file complexity
  max_complexity_per_function:
    max: 10                           # No function should be too complex

  # Function count and size
  number_of_functions:
    max: 20                           # Not too many functions per file
  max_rloc_per_function:
    max: 50                           # No function should be too long
  mean_rloc_per_function:
    max: 20                           # Average function length
```

### Example Configuration (JSON)

```json
{
  "file_metrics": {
    "rloc": {
      "max": 500
    },
    "complexity": {
      "max": 100
    },
    "max_complexity_per_function": {
      "max": 10
    },
    "number_of_functions": {
      "max": 20
    },
    "max_rloc_per_function": {
      "max": 50
    }
  }
}
```

**Note:** The UnifiedParser stores all metrics at the file level. Function-level data is aggregated as max/min/mean/median statistics within each file.

## Available Metrics

All metrics are file-level metrics from the UnifiedParser. Function-level data is aggregated into statistics.

### Lines of Code Metrics
- `rloc` - Real lines of code (excluding comments and empty lines)
- `loc` - Total lines of code (including everything)
- `comment_lines` - Number of comment lines

### Complexity Metrics
- `complexity` - Total cyclomatic complexity of the file
- `logic_complexity` - Logic complexity
- `max_complexity_per_function` - Highest complexity of any function in the file
- `min_complexity_per_function` - Lowest complexity of any function
- `mean_complexity_per_function` - Average complexity across all functions
- `median_complexity_per_function` - Median complexity

### Function Count
- `number_of_functions` - Total number of functions in the file

### Function Size Metrics (Aggregated)
- `max_rloc_per_function` - Length of the longest function
- `min_rloc_per_function` - Length of the shortest function
- `mean_rloc_per_function` - Average function length
- `median_rloc_per_function` - Median function length

### Function Parameter Metrics (Aggregated)
- `max_parameters_per_function` - Most parameters any function has
- `min_parameters_per_function` - Fewest parameters any function has
- `mean_parameters_per_function` - Average parameters per function
- `median_parameters_per_function` - Median parameters per function

**Note:** All metrics are stored at the file level. There is no separate `function_metrics` section in the configuration.

## Exit Codes

- `0` - All thresholds passed
- `1` - One or more threshold violations found
- `2` - Configuration or parsing errors

## Examples

### Basic Usage

```bash
ccsh metricthresholdchecker ./src --config thresholds.yml
```

### Exclude Test Files

```bash
ccsh metricthresholdchecker ./src --config thresholds.yml --exclude ".*test.*,.*spec.*"
```

### Analyze Specific File Extensions

```bash
ccsh metricthresholdchecker ./src --config thresholds.yml --file-extensions kt,java
```

### Verbose Output

```bash
ccsh metricthresholdchecker ./src --config thresholds.yml --verbose
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Check Code Metrics
  run: |
    ./gradlew installDist
    ./build/install/codecharta-analysis/bin/ccsh metricthresholdchecker src/ -c .codecharta-thresholds.yml
```

### GitLab CI

```yaml
code-quality:
  script:
    - ./gradlew installDist
    - ./build/install/codecharta-analysis/bin/ccsh metricthresholdchecker src/ -c thresholds.yml
```

### Jenkins

```groovy
stage('Code Quality') {
    steps {
        sh './gradlew installDist'
        sh './build/install/codecharta-analysis/bin/ccsh metricthresholdchecker src/ -c thresholds.yml'
    }
}
```

## Output Format

When violations are found, the tool displays a formatted table showing:
- File path
- Metric name
- Actual value
- Threshold (min/max)
- How much the value exceeds the threshold

**Violations are sorted by how much they exceed the threshold (worst first) within each metric group**, making it easy to identify the most problematic files that need attention.

Example output:

```
Metric Threshold Check Results
════════════════════════════════════════════════════════════
✗ 3 violation(s) found!

Violations by type:
  - File metric violations: 3
════════════════════════════════════════════════════════════

Violations:

Metric: rloc (2 violations)

  Path                   Actual Value     Threshold             Exceeds By
  ───────────────────────────────────────────────────────────────────────────
  src/HugeFile.kt        750              max: 500              +250  ← Worst violation first
  src/LargeFile.kt       550              max: 500              +50

Metric: mcc (1 violations)

  Path                   Actual Value     Threshold             Exceeds By
  ───────────────────────────────────────────────────────────────────────────
  src/Complex.kt         120              max: 100              +20
```

## Tips for Using the Tool

### Prioritizing Fixes

Since violations are sorted by severity (how much they exceed the threshold), focus on the files at the top of each metric list first. These represent the most significant violations and will have the biggest impact when fixed.

### Iterative Improvement

Start with lenient thresholds and gradually tighten them:

```yaml
# Phase 1: Set thresholds above current worst violations
file_metrics:
  rloc:
    max: 1000  # Start high

# Phase 2: After fixing worst offenders, tighten
file_metrics:
  rloc:
    max: 500   # Reduce gradually

# Phase 3: Aim for best practices
file_metrics:
  rloc:
    max: 200   # Target healthy file size
```

### CI Integration Best Practice

Run the checker on every pull request to prevent new violations from being introduced, even if existing violations remain:

```yaml
# .github/workflows/code-quality.yml
- name: Check New Code
  run: |
    ccsh metricthresholdchecker src/ --config .codecharta-thresholds.yml
```

## Common Use Cases

### Prevent Large Files
```yaml
file_metrics:
  rloc:
    max: 300  # Files shouldn't be too long
```

### Control Complexity
```yaml
file_metrics:
  max_complexity_per_function:
    max: 10   # No function should be too complex
  complexity:
    max: 50   # Total file complexity
```

### Ensure Test Coverage Balance
```yaml
file_metrics:
  number_of_functions:
    max: 30   # Keep files focused
    min: 1    # Ensure files have at least one function
```

### Monitor Function Size
```yaml
file_metrics:
  max_rloc_per_function:
    max: 50       # No giant functions
  mean_rloc_per_function:
    max: 20       # Keep average function size small
```

## Notes

- The tool uses Jackson for YAML/JSON parsing (no CVEs in current version)
- Thresholds are applied only to files that contain the specified metrics
- All metrics are file-level; function data is aggregated as max/min/mean/median statistics
- The tool respects `.gitignore` files by default (use `--bypass-gitignore` to disable)
- Violations are grouped by metric type and sorted by severity within each group
- Only use `file_metrics` in your configuration; there is no `function_metrics` section
