---
name: Analysis gate metric cleanup
state: progress
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
- Set each error max in `analysis/.codecharta.yml` to the new worst file

## Steps

- [ ] Complete Task 1: Test classes
- [ ] Complete Task 2: Production code
- [ ] Complete Task 3: Comment lines
- [ ] Complete Task 4: Thresholds
- [ ] Gate on analysis and visualization, ktlintCheck test, format:check

## Notes

- One commit per file, on `tech/analysis-gate-cleanup`
- Dependency section of the gate must not get worse (17 cycles between files, 6 inside files, 30 upward)
