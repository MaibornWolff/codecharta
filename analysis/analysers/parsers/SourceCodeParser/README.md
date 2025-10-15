# Source Code Parser

**DEPRECATED AND REMOVED**

## Status

The SourceCodeParser has been **deprecated and removed** from CodeCharta due to high maintenance burden and the availability of better alternatives.

Running `ccsh sourcecodeparser` will now exit immediately with an error message and exit code 1.

## Alternatives

Please use one of these alternatives instead:

### 1. **UnifiedParser** - Modern parser for multiple languages
```bash
ccsh unifiedparser <source-folder> -o output.cc.json
```
Supports modern parsing for multiple programming languages with better performance.

### 2. **SonarImporter** - Import from SonarQube analysis
```bash
ccsh sonarimporter <sonar-url> <project-key> -o output.cc.json
```
Import comprehensive metrics from existing SonarQube analysis.

### 3. **CoverageImporter** - Import code coverage data
```bash
ccsh coverageimporter <coverage-file> -o output.cc.json
```
Import code coverage metrics from various coverage formats.

### 4. **RawTextParser** - Simple text-based metrics
```bash
ccsh rawtextparser <source-folder> -o output.cc.json
```
Basic line count and text metrics.

### 5. **TokeiImporter** - Line count and language statistics
```bash
tokei . -o json | ccsh tokeiimporter /dev/stdin -o output.cc.json
```
Comprehensive line count analysis using the Tokei tool.

## Complete Analysis Workflow

For a comprehensive analysis combining multiple tools, use the `simplecc.sh` script:

```bash
analysis/script/simplecc.sh create <output-file>
```

This script provides a complete analysis using:
- `tokei` - Line counts and language statistics
- `complexity` - Whitespace complexity
- `gitlogparser` - Git history analysis
- `rawtextparser` - Text metrics
- `unifiedparser` - Modern source code analysis

## Migration Guide

If you were using SourceCodeParser:

**Before:**
```bash
ccsh sourcecodeparser ./src -o output.cc.json
```

**After (recommended):**
```bash
# Option 1: Use the complete analysis script
analysis/script/simplecc.sh create output

# Option 2: Use UnifiedParser for source code analysis
ccsh unifiedparser ./src -o output.cc.json

# Option 3: Combine multiple tools
ccsh rawtextparser ./src -o raw.cc.json
ccsh unifiedparser ./src -o unified.cc.json
ccsh mergefilter raw.cc.json unified.cc.json -o output.cc.json
```

## Documentation

For detailed documentation on these alternatives, see the [CodeCharta documentation](https://maibornwolff.github.io/codecharta/docs/).
