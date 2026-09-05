---
name: Fix the findings of the third dependency parser review
issue: <#issueid>
state: progress
version: 1
---

## Goal

Close what the 2026-09-05 review at `974684fa3` found: TypeScript and Vue import resolution loses edges
on common project layouts, per-file failures are invisible, `merge --large` fuses same-path leaves,
plus the cheap quality items and the test-convention retrofit. Almost all of the resolution defects
are inherited verbatim from DependaCharta; fixing them here makes the parser deviate from it, which
the README's parity section must say.

## Tasks

### 1. tsconfig resolution
- Inherited `baseUrl` and `paths` resolve against the config that defines them, not the child
- `extends` without `.json` finds the parent; a missing parent is warned about
- `paths` matching prefers the longest matching prefix, as TypeScript does

### 2. Alias targets and wildcard re-exports
- tsconfig and bundler alias targets drop their source extension
- One `makeRelativeToAnalysisRoot` with a separator check, shared by both callers
- Wildcard re-exports keep the unescaped import path, so `./user.service` is found on disk

### 3. Vue
- Every script block of an SFC is analysed, not only the first

### 4. Resolution details
- An explicit import wins over a same-package type of the same name
- Every PHP grouped `use` contributes, not only the first
- The federation producer lookup is sorted and prefers the federation name over the directory name

### 5. Visible failures
- One warning summarizes the files the extraction dropped, naming the first few
- A config file that fails to parse (tsconfig, package.json) is warned about once
- The "re-run with --verbose=false" hint goes; the analyzer factory is injectable so both paths are tested

### 6. `merge --large`
- Logical ids (namespaces, leaves, leaf-edge endpoints) gain the folder as a leading segment, mirroring
  the edges; dots in the folder name are escaped like the parser escapes them

### 7. Quality
- Stale weight comments in `ProcessingPipeline` and `DependencyProjectGenerator`
- Dead code: `PythonUtils`, `Path.plus(List)`, the Go transitive resolution (`TSNode.getChildren` gained a caller in the Vue query)
- Changelog notes for `.kts`/`.cts` in `unifiedparser` and the `domainlanguageparser` scanner change

### 8. Test conventions
- Arrange/Act/Assert comments in every test of the module, every test name starting with "should"

## Steps

- [x] Complete Task 1: tsconfig resolution
- [x] Complete Task 2: alias targets and wildcard re-exports
- [x] Complete Task 3: Vue
- [x] Complete Task 4: resolution details
- [x] Complete Task 5: visible failures
- [x] Complete Task 6: merge --large
- [x] Complete Task 7: quality
- [ ] Complete Task 8: test conventions

## Notes

- Not done, by decision: splitting the 27 methods over 25 lines.
- `merge --large` prefixes logical ids rather than refusing the merge or keeping the first leaf.
