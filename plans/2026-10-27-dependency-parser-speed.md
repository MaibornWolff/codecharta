---
name: dependency-parser-speed
state: complete
version: 2.2.0
---

## Goal

Win back the speed the dependency parser lost through the name rules since ana-2.2.0 (`ccsh analyse` on real repos:
three.js 12s -> 63s, gitlabhq 47s -> 71s, bitcoin 19s -> 34s, nushell 4s -> 11s, postgres 9s -> 15s, HeidiSQL 2s -> 6s,
grafana 61s -> 70s), without changing a single byte of the output.

## Tasks

Branch `fix/dependency-parser-speed`, cut from `fix/dependency-name-resolution-sql`.

### 1. Parse the files of a project index in parallel
- Rust (`RustProject`), SQL (`SqlProject`), Delphi (`DelphiProject`) parse every file on one thread while the
  extraction threads wait; parse them on all cores first, the serial pass then reads the cache
- A file that fails is left to the serial pass, which fails as before

### 2. C++: parse once and build the closure lookup once
- `CppVisibleNames.lookupOnly` builds a lookup over the whole closure per call; build it once
- The analyzer reuses the parse `CppDeclarations` made of its own file when the text is the same (a byte order mark
  makes it differ, then it parses its own text as before)

### 3. TypeScript, JavaScript, Vue: no repeated file-system work
- `ImportedModules` asks the disk for the same module paths and canonical paths per declaration and import; cache them
- `GlobalDeclarations` and `GlobalComponents` read and parse their files in parallel, in the same order of results

### Out of scope (would change output)
- Byte order marks: the project caches keep reading the file as it is on disk
- Global declarations from the run's files instead of the tree walk
- A two-phase extraction so the TS export tables reuse the analyzer's parse

## Steps

- [x] 1. Rust: parse the run's files in parallel before the module tree is built
- [x] 2. SQL: parse the run's files in parallel before the name index is built
- [x] 3. Delphi: parse the run's files in parallel before the unit index is built
- [x] 4. C++: build the lookup without bases once per closure
- [x] 5. C++: reuse the closure's parse of the analyzed file
- [x] 6. TS/JS/Vue: cache the module files and canonical paths an import looks up
- [x] 7. TS/JS/Vue: read the files of the global declarations and components in parallel

## Notes

- Every commit: `ktlintCheck test`, `distTar`, `integrationTest`, `npm run format:check`, the analysis gate, and the
  dependency output of the new build compared byte for byte with the HEAD build of `fix/dependency-name-resolution-sql`
  on the sample projects, the regression probes and the clones of three.js, bitcoin, nushell, HeidiSQL, postgres, grafana
- No changelog entry: the slowdown was never released
- Result, `ccsh dependencyparser` on the clones, HEAD of `fix/dependency-name-resolution-sql` -> this branch (one run
  each, a few seconds of noise): three.js 47.0s -> 14.6s, grafana 69.2s -> 47.5s, bitcoin 29.2s -> 10.3s, postgres
  10.3s -> 5.1s, nushell 9.9s -> 4.8s, HeidiSQL 5.9s -> 2.1s; 519 outputs byte-identical after every commit
