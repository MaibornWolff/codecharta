---
name: grammar-license-notices
state: complete
version: 1.0.0
---

## Goal

Ship the MIT notices of the grammars bundled as jars in `treeSitterExcavationSite/libs`, which carry no license file
themselves, with every ccsh distribution (archive, npm, Docker).

## Tasks

### 1. Add the license texts
- Put the licenses of tree-sitter-angular, tree-sitter-html (vendored in the Angular grammar),
  tree-sitter-typescript (tsx), tree-sitter-pascal and tree-sitter-ng (generator of the loader classes) into
  `src/main/resources/lib/`, beside the existing `tree-sitter-core.LICENSE`
- The SQL island grammar is MaibornWolff's own, covered by the repository license

### 2. Keep it from regressing
- README of the module says a jar added to `libs/` brings its license along
- Changelog Chore entry

## Steps

- [x] Complete Task 1: Add the license texts
- [x] Complete Task 2: Keep it from regressing
- [x] Verify the fat ccsh jar contains the files; `npm run format:check`, `./gradlew ktlintCheck test`

## Notes

- The fat jar is the one file all channels ship (the Docker image keeps only it), so the resources go there
- The license check does not see the `files(...)` jars; that stays open
