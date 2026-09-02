---
name: Parked issues from the domain-language branch review
issue: <#issueid>
state: todo
version: 1
---

## Goal

Issues surfaced while wrapping up `feature/domainlanguage-parser` that were deliberately not fixed
there. The suspected pre-existing test failure turned out to be a local JDK artifact and is closed;
what remains is that two domain maps cannot be merged, and the question of whether the domain lens
should stay opaque.

## Tasks

### 1. ~~`ProgressTrackerTest > should handle zero total correctly` fails~~ — RESOLVED, not a defect

Root cause: **JaCoCo 0.8.11 cannot instrument Java 25 bytecode.** One cause, two symptoms.

`jvmToolchain(25)` makes Kotlin emit class file major version 69. The pinned JaCoCo
(`libs.versions.toml`: `jacoco = "0.8.11"`, Oct 2023) bundles an ASM that rejects it with
`IllegalArgumentException: Unsupported class file major version 69`. The JaCoCo *agent* catches that
and prints the stack trace to `System.err` as the class is loaded.

`ProgressTrackerTest` swaps `System.err` for a capture buffer and asserts it is empty, and
`ProgressTracker` is first loaded inside that very test — so JaCoCo's error trace landed in the
buffer and the assertion read
`Expecting empty but was: "java.lang.instrument.IllegalClassFormatException..."`. It was an innocent
bystander: it is the only test asserting stderr is *empty*, so it is the only one that noticed. Every
other stderr-capturing test uses `contains(...)`, which tolerates the noise.

On the pinned JDK 17 toolchain everything passes:

- `:model:test --tests "*ProgressTrackerTest*"` — 6 of 6 pass
- `./gradlew clean build` — BUILD SUCCESSFUL (compile, all module tests, ktlint, jacoco)
- `./gradlew integrationTest` — BUILD SUCCESSFUL

Nothing to fix in CodeCharta. Only relevant if the toolchain is ever raised past 21, which would need
a newer JaCoCo first — check which release adds Java 25 support before bumping.

**JDK 25 runs CodeCharta fine.** The limitation is the coverage agent at build time, not the runtime.
A `ccsh` compiled to Java 17 bytecode (major 61, as CI ships it) was run under
`JAVA_HOME=/usr/lib/jvm/java-25-openjdk-arm64`: `domainlanguageparser`, `unifiedparser`, `merge`,
`check` and the new `modify` guard all behave correctly, TreeSitter native bindings included.

### 2. Two domain maps cannot be merged

`ccsh merge` on two files that both carry a non-empty `domain` lens throws:

```
MergeException: Opaque lens 'domain' has conflicting payloads across inputs and cannot be merged.
Reconcile the inputs so this lens is identical or present in only one file, then retry.
```

So domain-parsing two subprojects of a monorepo and merging them is not possible. It fails loudly
rather than corrupting anything, and the advice to "reconcile the inputs" is not actionable for this
case.

The asymmetry worth resolving: the **visualization already merges domain words across files**.
`getMergedDomainWords` unions them, prefixes paths with the file name in partial state, and combines
colliding entries (`keepLaterWord`, and `sumFrequenciesAndKeepStrongestTfidf` for the root). The
semantics exist on one side of the toolchain and not the other.

Options:
- Union by node id in `ProjectMerger`, reusing the visualization's combine rules so both sides agree.
- Keep refusing, and document that domain parsing belongs *after* merging.
- **Make `domain` a typed lens** rather than an opaque one — see the note below.

### 3. Decide whether the domain lens should stay opaque

Tasks 2 and the `StructureModifier` follow-up below are the same underlying gap: `domain` is carried
as an opaque `JsonElement`, so no filter can merge it, re-key it, or reason about it. Both filters
therefore refuse rather than handle it.

Making it typed alongside `metrics` and `dependency` would let `ccsh merge` combine two domain maps
*and* let `ccsh modify` re-path the lens instead of refusing. Worth deciding once, before a second
opaque lens (`security`, `clusters`) arrives and inherits the same limitation.

## Steps

- [x] Complete Task 1: root-caused to JaCoCo 0.8.11 vs Java 25 bytecode; closed, not a defect
- [ ] Complete Task 2: pick a merge behaviour for two domain maps
- [ ] Complete Task 3: decide whether `domain` becomes a typed lens

## Notes

- **`ccsh modify` re-keying (follow-up to the shipped guard).** The branch made `--set-root`,
  `--move-from`/`--move-to` and `--remove` refuse when a data-bearing opaque lens is present. Re-keying
  the lens instead was rejected *for now* because it assumes every opaque lens is a flat node-id map,
  which only holds for `domain` today. Task 3 is what unblocks it.
- **E2E timeout.** `playwright.config.ts` moved from 10s to 60s for the whole suite. It is justified
  for the tests that deliberately wait on boot and persistence, but with CI `retries: 2` a genuinely
  hung test now costs 3 minutes instead of 30 seconds. Consider scoping it with `test.setTimeout()`
  on just those tests.
- **`plans/topbar/image.png` is missing.** The directory is empty and `2026-08-19-topbar-redesign.md`
  references the image. It was never tracked by git, so it cannot be recovered from the repo —
  either re-add it or drop the reference.
- The analysis build needs a JDK 17–21; `jvmToolchain(17)` is pinned and Gradle cannot auto-provision
  one here (the foojay resolver is blocked by network policy). `sudo apt-get install
  openjdk-17-jdk-headless` works and is what made the verification above possible.
- This plan is intentionally **left uncommitted**.
