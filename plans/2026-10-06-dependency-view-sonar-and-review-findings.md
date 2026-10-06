---
name: Fix the Sonar and review findings of the dependency view's declarations
issue: -
state: complete
version: -
---

## Goal

Clear the four open SonarCloud issues of PR 4581 and the two still-valid review findings on the dependency view.

## Tasks

### 1. Edge kept between a folder and a file the packages moved out of it
- An edge is dropped only when one end is drawn inside the other, told by the drawn tree instead of the paths
- Regression case: one packaged file, one file left in the folder

### 2. Cycles request answered once
- The inspector answers a request to bring the cycles into view, so an inspector shown anew does not replay it

### 3. Sonar issues
- Nested ternary in `containerPlan.ts`
- Expression statement in `dependencyInspector.component.ts`
- Stringified unknown in `dependencyGraphHost.ts`
- Function passed directly to `reduce` in `indexedDBWriter.ts`

## Steps

- [x] Complete Task 1: Edge kept between a folder and a file the packages moved out of it
- [x] Complete Task 2: Cycles request answered once
- [x] Complete Task 3: Sonar issues
- [x] Format check, tests, lint, type check
