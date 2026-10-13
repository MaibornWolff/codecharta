---
name: Upward edge into a nested declaration
issue: none
state: complete
version: n/a
---

## Goal

`dependencyparser` no longer flags a dependency between a class and a declaration nested in it as pointing upwards, so the dependency view stops drawing it as a violation.

## Tasks

### 1. Pin the behaviour
- Tests for both directions: the class uses its nested declaration, the nested declaration uses the class

### 2. Fix the upward rule
- A class with nested declarations is its own namespace, so both ends of such an edge meet in the same node and compared equal, which counts as upwards
- The rule now answers "not upwards" when both ends meet in one node

## Steps

- [x] Complete Task 1: Pin the behaviour
- [x] Complete Task 2: Fix the upward rule
- [x] Changelog and parser docs

## Notes

- Found on `Ccsh -> ManifestVersionProvider` in the analysis demo map; 78 declaration edges of that map carried the flag for this reason, none after the fix
- Not covered by a sample-project finding; the closest one (nested declarations exported without their enclosing class) is about leaf names
- The levels of a class and of its nested declarations still come from different namespaces and are not comparable in the output
