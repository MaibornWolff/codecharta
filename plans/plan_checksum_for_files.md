# Node Checksum Feature

## Overview

A new checksum feature has been added to CodeCharta's analysis component to enable incremental processing of code analysis. Each file node in the generated `.cc.json` output now includes a checksum calculated from its metrics/attributes.

## Implementation Details

### What is checksummed?

- **Files only**: Checksums are calculated for file nodes (type: `File`), not for folder nodes
- **Attributes**: The checksum is based on all metrics/attributes of a file (e.g., `rloc`, `complexity`, `functions`, etc.)
- **Deterministic**: The same attributes always produce the same checksum, regardless of insertion order

### Algorithm

The implementation uses **XXHash** (specifically XX3 variant) for its speed and excellent distribution properties:
- **Library**: `net.openhft:zero-allocation-hashing:0.16`
- **Hash Function**: `LongHashFunction.xx3()`
- **Output Format**: Hexadecimal string (e.g., `"1a2b3c4d5e6f"`)

### Architecture

The checksum calculation is executed "as late as possible" in the analysis pipeline:

```
MutableNode (with metrics) 
    ↓
ProjectBuilder.build()
    ↓
MutableNode.toNode()  ← Checksum calculated here
    ↓
Node (immutable, with checksum)
    ↓
ProjectSerializer
    ↓
.cc.json output
```

### Key Files

1. **`ChecksumCalculator.kt`**: Utility class for calculating checksums
   - Sorts attributes by key for deterministic ordering
   - Normalizes numeric values (especially floating point) for consistency
   - Returns hex string or null for empty attributes

2. **`Node.kt`**: Added `checksum: String?` field
   - `null` for folders
   - Hex string for files with attributes

3. **`MutableNode.kt`**: Modified `toNode()` to calculate checksums
   - Called during project build process
   - Only calculates for file nodes

4. **Dependencies**: Updated `libs.versions.toml` and `model/build.gradle.kts`

## Usage Example

When analyzing a project, the output `.cc.json` will now include checksums:

```json
{
  "nodes": [
    {
      "name": "MyClass.java",
      "type": "File",
      "attributes": {
        "rloc": 100,
        "complexity": 15,
        "functions": 5
      },
      "checksum": "a3f5d9c8b1e2"
    },
    {
      "name": "src",
      "type": "Folder",
      "children": [...],
      "checksum": null
    }
  ]
}
```

## Use Cases

This feature enables:

1. **Incremental Analysis**: Only reprocess files whose checksums have changed
2. **Change Detection**: Quickly identify which files have had metric changes
3. **Cache Validation**: Use checksums to validate cached analysis results
4. **Diff Optimization**: Compare projects more efficiently by checksum

## Testing

Comprehensive tests added:

- **`ChecksumCalculatorTest.kt`**: Unit tests for checksum calculation
  - Deterministic ordering
  - Different attribute types
  - Edge cases (empty, null, floating point)

- **`ProjectBuilderTest.kt`**: Integration tests
  - Files get checksums, folders don't
  - Identical attributes produce identical checksums
  - Different attributes produce different checksums

All existing tests continue to pass.

## Performance Considerations

- **XXHash**: Chosen for speed - one of the fastest non-cryptographic hash functions
- **Late calculation**: Only computed once during the immutable Node creation
- **No overhead for folders**: Folders are skipped to save computation
- **Minimal memory**: String representation is only temporarily created for hashing

## Future Enhancements

Potential improvements:

1. **Incremental parsing**: Use checksums to skip unchanged files
2. **Checksum comparison tool**: New filter to compare checksums across analyses
3. **Cache mechanism**: Store previous analysis results keyed by checksum
4. **Folder checksums**: Optionally calculate folder checksums based on child checksums
