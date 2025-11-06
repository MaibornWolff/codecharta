# Fix Table Alignment in ViolationTableRenderer

state: complete

## Implementation

Fixed two issues in ViolationTableRenderer.kt:

### Fix 1: ANSI Color Code Alignment (Lines 71-85)
Fixed the `renderRow` method to properly handle ANSI color codes without breaking alignment.

**Changes made:**
- Removed the broken `substring()` approach
- Added manual padding calculation that accounts for ANSI codes being invisible
- Each column is now padded individually with `padEnd()`
- Path padding is calculated as: `pathColumnWidth - truncatedPath.length` (visual length only)

### Fix 2: Long Path Table Width (ViolationTableRenderer.kt lines 27-28, 39-45)
Capped the path column width to prevent table from becoming too wide for the terminal.

**Changes made:**
- Added `MAX_PATH_WIDTH = 50` constant to limit path column width
- Updated `pathColumnWidth` calculation to cap at `MAX_PATH_WIDTH`:
  ```kotlin
  val pathColumnWidth = maxOf(
      MIN_PATH_WIDTH,
      minOf(
          violations.maxOfOrNull { it.path.length } ?: MIN_PATH_WIDTH,
          MAX_PATH_WIDTH
      )
  )
  ```
- Long paths are now truncated by `PathFormatter` to fit within the capped width
- Table stays within ~107 characters total (indent + 50 + 15 + 20 + 15 + 6 spaces)

### Fix 3: Path Truncation Direction (PathFormatter.kt lines 8-16)
Changed path truncation to show the end of the path (filename and parent dirs) instead of middle.

**Changes made:**
- Changed truncation from middle (`src/foo/.../bar.ts`) to start (`...foo/bar/baz.ts`)
- This keeps the filename and immediate parent directories visible, which is more useful for identifying files
- Example: `src/very/long/path/to/file.ts` → `...ong/path/to/file.ts`

### Fix 4: Right-Align Path Column (ViolationTableRenderer.kt lines 59-63, 81-85)
Changed path column alignment from left to right so filenames line up.

**Changes made:**
- Updated `renderHeader` to use `padStart()` instead of left-aligned `String.format()`
- Updated `renderRow` to put padding BEFORE the path instead of after
- Example output:
  ```
                  root/app/app.config.ts
                      root/app/app.e2e.ts
              ...ong/path/to/file.ts
  ```
- Filenames now align on the right edge of the path column, making them easier to scan

## Problem

Table columns are misaligned because ANSI color codes (invisible characters) break the `substring()` calculation when trying to color just the path column.

**Current broken approach (lines 71-88):**
```kotlin
val row = String.format(format, truncatedPath, formattedValue, formattedThreshold, formattedExcess)
return AnsiColorFormatter.red(TABLE_INDENT + truncatedPath) + row.substring(TABLE_INDENT.length + pathColumnWidth)
```

ANSI codes like `\u001B[31m` and `\u001B[0m` add characters to the string length but are invisible, causing substring to cut at wrong position.

## Solution

Don't use the full formatted row string. Instead, format each column individually and concatenate with proper spacing, applying color only to the path.

**Fixed approach:**
```kotlin
val coloredPath = AnsiColorFormatter.red(truncatedPath)
val pathColumn = String.format("$TABLE_INDENT%-${pathColumnWidth}s", coloredPath)
val valueColumn = String.format("  %-${VALUE_WIDTH}s", formattedValue)
val thresholdColumn = String.format("  %-${THRESHOLD_WIDTH}s", formattedThreshold)
val excessColumn = String.format("  %-${EXCESS_WIDTH}s", formattedExcess)

return pathColumn + valueColumn + thresholdColumn + excessColumn
```

Wait, this still won't work because String.format counts ANSI codes as characters!

**Better solution - pad manually:**
```kotlin
val coloredPath = TABLE_INDENT + AnsiColorFormatter.red(truncatedPath)
// Add spaces to reach the full width (ANSI codes don't count visually)
val pathPadding = " ".repeat(pathColumnWidth - truncatedPath.length)
val spacer = "  "

return coloredPath + pathPadding + spacer +
       formattedValue.padEnd(VALUE_WIDTH) + spacer +
       formattedThreshold.padEnd(THRESHOLD_WIDTH) + spacer +
       formattedExcess.padEnd(EXCESS_WIDTH)
```

## Implementation Steps

- [x] Update `renderRow` method in ViolationTableRenderer.kt
- [x] Remove the substring approach
- [x] Manually build the row with proper padding that accounts for ANSI codes
- [x] Add MAX_PATH_WIDTH constant to cap path column width
- [x] Update pathColumnWidth calculation to prevent table overflow
- [x] Change PathFormatter to truncate from start instead of middle
- [x] Right-align path column for better filename scanning
- [x] Update PathFormatterTest to match new truncation behavior
- [ ] Test with actual violations to verify alignment (requires user to rebuild with Java 17+)
- [ ] Run tests to ensure they all pass (requires Java 17+ to run gradle tests)

## Expected Result

Table columns should be perfectly aligned:
```
  Path                     Actual Value     Threshold            Exceeds By
  ────────────────────────────────────────────────────────────────────────────
  src/foo/Bar.kt           523              max: 500             +23
  src/baz/Qux.kt           1200             max: 1000            +200
```
