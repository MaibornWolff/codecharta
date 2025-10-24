---
name: Improve metric search functionality
issue: #4313
state: complete
version:
---

## Goal

Improve the filterMetricDataBySearchTerm pipe to make metric discovery easier by normalizing delimiters (underscores, hyphens, spaces) and supporting flexible word-order matching. For example, searching "complexity per file" should match "max_complexity_per_file".

## Tasks

### 1. Implement delimiter-agnostic search
- Normalize both the metric name and search term by treating underscores, hyphens, and spaces as equivalent word separators
- This allows users to search "complexity per file" and match "max_complexity_per_file" or "max-complexity-per-file"
- Current behavior only works with exact character matching including underscores

### 2. Support flexible word-order matching
- Split search term into individual words
- Check if all search words appear anywhere in the normalized metric name (order doesn't matter)
- "file complexity" should match "max_complexity_per_file"
- Maintain current partial matching behavior where "complex" matches "max_complexity_per_file"

### 3. Refactor "formerly mcc" special case
- Extract hardcoded complexity/sonar_complexity logic into a maintainable configuration
- Create a constant or configuration object for metric aliases/display name modifications
- This makes it easier to add future metric name variations without modifying the filter logic
- Remove or update the TODO comment

### 4. Add unit tests
- Test delimiter normalization: underscore, hyphen, space equivalence
- Test word order independence: "file complexity" matches "max_complexity_per_file"
- Test partial word matching still works
- Test special case handling (formerly mcc)
- Test edge cases: empty strings, special characters, multiple spaces

## Steps

- [x] Complete Task 1: Implement delimiter normalization helper function
- [x] Complete Task 2: Implement word-order independent matching logic
- [x] Complete Task 3: Extract "formerly mcc" logic into configuration constant
- [x] Complete Task 4: Add comprehensive unit tests
- [x] Verify that all tests pass successfully

## Review Feedback Addressed

N/A - Initial plan

## Notes

- Implemented delimiter-agnostic search using regex `/[_\-\s]+/g` to normalize both metric names and search terms
- Search now supports word-order independence - all search words must appear but order doesn't matter
- Extracted "formerly mcc" logic into `METRIC_ALIASES` constant for better maintainability
- Maintained case-insensitive behavior using `toLocaleLowerCase()`
- All existing searches continue to work - backward compatible
- Created comprehensive test suite with 22 test cases covering:
  - Delimiter normalization (underscores, hyphens, spaces)
  - Word order independence
  - Partial word matching
  - Special case handling (formerly mcc)
  - Case insensitivity
  - Edge cases (empty strings, multiple spaces, etc.)
- All tests passed successfully
