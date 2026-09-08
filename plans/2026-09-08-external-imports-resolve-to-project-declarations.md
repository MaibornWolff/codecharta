---
name: An import of an external module must not become a dependency on a same-named declaration
issue: <#issueid>
state: todo
version: 1
---

## Goal

`import * as fs from "fs"` names Node's built-in module, but the dependency parser turns it into an
edge to whatever project declaration happens to be called `fs`. Imports that resolve to nothing in the
project must produce no dependency at all.

## Tasks

### 1. Decide externality in the analyser, where it is knowable
- `Import` already separates `RelativeImport` from `DirectImport`, and `TypescriptAnalyzer` already
  probes the filesystem in `resolveSourceFile`
- A direct import that matches no file and no alias (tsconfig, bundler, federation) is external:
  emit no `Dependency` for it, so the resolver never sees a name to guess from
- `Node.resolveTypes` already splits `internalDependencies` from `externalDependencies`; the defect is
  that `fs` is resolved to an internal path before that split can classify it

### 2. Cover the other languages with the same shape
- Python (`import os`), PHP (composer namespaces), Rust (external crates), Vue — all use
  `EmptyStandardLibrary()` today, so nothing filters their built-ins either
- A standard-library dictionary alone does **not** fix this: `languageDictionary` is consulted last,
  after `possibleImports` has already matched

### 3. Guard it
- Regression test from the reproducer: two unrelated files, one `import * as fs from "fs"`, one
  `const fs = require("fs")` — no edge between them
- Re-run `script/compare_dependency_parsers.py` on a project and record the new deviation from
  DependaCharta in the parser README, which already lists the deliberate ones

## Steps

- [ ] Complete Task 1: externality in the TypeScript/JavaScript analyser
- [ ] Complete Task 2: the remaining languages
- [ ] Complete Task 3: regression test and README entry

## Notes

- Measured 2026-09-08 on a whole-repo run: 11 such edges of 7,609 in ccsh, 41 in DependaCharta's own
  output. Targets seen: `fs`, `path`, `assert`, `process`.
- Inherited from DependaCharta unchanged — same resolver, same fallback.
- Reproducer: two files, `a/version.ts` with `import * as fs from "fs"` and a class using it, and
  `b/other.js` with `const fs = require("fs")`. ccsh emits `a.version.VersionManager -> b.other.fs`.
- The concrete path taken is `Node.resolveTypeImport`'s wildcard branch: with `fullPath.hasOnlyName()`
  it accepts any candidate whose dotted path *contains* the import string, then takes `firstOrNull`.
  See [the sibling plan](2026-09-08-ambiguous-name-resolution-guesses.md) for that half.
