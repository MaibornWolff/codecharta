---
name: Analysis gate metric cleanup
state: complete
version: 1
---

## Goal

Remove every warning of `ccsh gate analysis` for complexity, rloc, max_complexity_per_function and comment_lines by
following the gate's instructions, without new dependency warnings, then tighten the error thresholds to the new worst.

## Tasks

### 1. Test classes over complexity 100
- Split each large test class along its subjects into smaller test classes

### 2. Production code
- JS `DeclarationExtractor` (complexity), Sonar `AttributeDescriptors` (rloc), DependencyParser `Node` and
  `LanguageRegistry` (max complexity per function)

### 3. Comment lines
- Replace WHAT comments with names, keep WHY comments, in the Kotlin files and the shell scripts
- Delete `compare_dependency_parsers.py` and `ccjson_to_cgjson.py` with their README references

### 4. Thresholds
- Set warning and error max in `analysis/.codecharta.yml` to the new worst file (the gate rejects error below warning)

## Steps

- [x] Complete Task 1: Test classes
- [x] Complete Task 2: Production code
- [x] Complete Task 3: Comment lines
- [x] Complete Task 4: Thresholds
- [x] Gate on analysis and visualization, ktlintCheck test, format:check

## Notes

- One commit per file, on `tech/analysis-gate-cleanup`
- Dependency section of the gate must not get worse (17 cycles between files, 6 inside files, 30 upward)
- New worst: complexity 99, rloc 483, max_complexity_per_function 19, comment_lines 23; dependency section unchanged
