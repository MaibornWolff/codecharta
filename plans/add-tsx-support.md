---
name: add-tsx-support
issue:
state: complete
version:
---

## Goal

Wire up the `Language.TSX` support added in treesitter-excavation v0.4.0 so the UnifiedParser discovers and parses `.tsx` files.

## Tasks

### 1. Bump treesitter-excavation dependency

Update the version in `build.gradle.kts` to the release that includes `Language.TSX` (v0.4.1).

- File: `analysis/analysers/parsers/UnifiedParser/build.gradle.kts`
- Change: `implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.4.1")` → latest version with TSX

After bumping, run all unit tests to catch any regressions from the version change:
```bash
cd analysis && ./gradlew :analysers:parsers:UnifiedParser:test
```

### 2. Write a failing test

Create a new `TsxCollectorTest.kt` that creates a `TreeSitterLibraryCollector(Language.TSX)` and asserts LOC > 0 for a minimal `.tsx` snippet (e.g. a React functional component returning JSX).

- New file: `analysis/analysers/parsers/UnifiedParser/src/test/kotlin/.../metriccollectors/TsxCollectorTest.kt`

### 3. Add `TSX` to `FileExtension` enum

Add a new entry so the project scanner discovers `.tsx` files.

- File: `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/FileExtension.kt`
- Add `TSX(".tsx")` after the `TYPESCRIPT` entry

### 4. Register `TSX` collector in `AvailableCollectors`

Map `FileExtension.TSX` to `Language.TSX`.

- File: `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/.../metriccollectors/AvailableCollectors.kt`
- Add `TSX(FileExtension.TSX, { TreeSitterLibraryCollector(Language.TSX) })`

### 5. Add TSX mapping in `TreeSitterAdapter`

Add `FileExtension.TSX -> Language.TSX` to `getLanguageForExtension()`.

- File: `analysis/analysers/parsers/UnifiedParser/src/main/kotlin/.../metriccollectors/TreeSitterAdapter.kt`

### 6. Confirm green

Run tests and verify the new test passes along with all existing tests.

## Steps

- [x] Complete Task 1: Bump dependency (`v0.2.0` → `v0.4.1`) — already staged in `build.gradle.kts`
- [x] Complete Task 1 (cont.): Fix golden file regressions from v0.4.1
- [x] Complete Task 2: Write failing TSX test
- [x] Complete Task 3: Add `TSX` to `FileExtension`
- [x] Complete Task 4: Register in `AvailableCollectors`
- [x] Complete Task 5: Add mapping in `TreeSitterAdapter`
- [x] Complete Task 6: All tests green

