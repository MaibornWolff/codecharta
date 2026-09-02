---
name: Audit the per-language keyword lists now that all of them are loaded
issue: <#issueid>
state: complete
version: 1
---

## Goal

Before this branch only three of the 21 keyword lists were ever loaded, so the other 18 have never been
exercised against real parser output. Make the entries actually able to match, and close the gaps a
per-language probe corpus exposes.

## Tasks

### 1. Keyword entries are compared against lowercased words (blocker)

`SplitStage.sanitize` lowercases every token, but the lists declare themselves case-sensitive and carry
768 entries containing uppercase. Those can never match. 272 of them are single tokens that start
working the moment case is normalized (`False`, `None`, `String`, `Integer`, `Hash`, `Object`, …).

- Lowercase in `parseWordLines`, so every consumer — resource lists, english stopwords and `.dlcignore` —
  normalizes the same way. `DlcIgnoreParser` lowercases separately today; drop its now-duplicate call.
- Fix the "case-sensitive" claim in the list headers.
- Verify against the probe corpus that nothing over-filters.

### 2. Close the gaps the probe corpus exposes

- Python: `self` and `cls` are not in the list, and `__init__` leaks `init`.
- Bash: a shebang leaks `usr`, `bin`, `env`.
- Re-run the corpus after each change; only add what a probe actually shows leaking.

### 3. Quantify what stays inert, do not guess

413 entries are PascalCase (`StopIteration`, `IEnumerable`). The pipeline splits identifiers into
sub-words, so these can never match as whole tokens, and making them match would mean excluding their
parts — which would wrongly delete good domain words (`error`, `stop`, `iteration`). Measure the exact
remainder after Task 1 and report it as a decision rather than mass-deleting curated content.

## Steps

- [x] Complete Task 1: normalize case at load
- [x] Complete Task 2: close the probe-exposed gaps
- [x] Complete Task 3: measure and report the inert remainder
- [x] Full analysis suite + golden test green

## Notes

- The probe corpus lives in the scratchpad, not the repo: 9 idiomatic files (py, go, rs, rb, php,
  swift, cs, c, sh). Before any change it leaked only `self`, `init` (py) and `usr`, `bin`, `env`,
  `bash` (sh) — the curated lists are otherwise in good shape.
- Scoping matters here: adding `init` to the Python list strips it from Python files only, which is
  exactly what per-language scoping bought. It would have been wrong in a global list.

## Results

### Task 1 — case normalization

`parseWordLines` now lowercases, so the resource lists, the english stopwords and `.dlcignore` all
normalize identically (`DlcIgnoreParser`'s own `lowercase()` call was removed as duplicated). Header
comments corrected across all 21 files. Reachable entries went from 1,631 to **1,905** — 272 entries
that could never fire now do.

Proven on a Ruby probe using `Regexp`, `Proc` and `Symbol` — words only the Ruby list covers, so they
isolate the fix from the global technical/english lists. All three are filtered now; none were before.

Three tests asserted the old contract and were corrected rather than worked around: two `LanguageTest`
cases expected `getKeywords()` to hold capitalized ABL entries, and
`PathScopedFrameworkFilteringIntegrationTest` fed the filter a capitalized `"Controller"` — an input
`SplitStage` can never produce. A new `ResourceKeywordsTest` case pins the contract so it cannot
silently regress.

### Task 2 — gaps closed

| language | leaked | cause |
|---|---|---|
| Python | `self`, `init` | implicit first parameter; `__init__` splits to `init` |
| Bash | `usr`, `bin`, `env`, `bash` | `#!/usr/bin/env bash` shebang |

Both closed. The other seven probes leaked nothing, and no probe lost a real domain word — the final
run yields pure vocabulary for all nine files.

### Task 3 — the inert remainder, for a decision

574 entries still cannot match, because the pipeline splits identifiers on case boundaries and drops
tokens under two characters. They are **not** a bug to fix by adding their parts: excluding `error`,
`stop` or `iteration` so that `StopIteration` is covered would delete good domain words.

| list | inert | of total |
|---|---|---|
| entityframework | 117 | 168 |
| aspnet | 113 | 140 |
| vue | 79 | 198 |
| cpp | 64 | 188 |
| abl | 45 | 64 |
| objc | 36 | 100 |
| python | 32 | 133 |
| csharp | 31 | 207 |
| others | 57 | — |

The two framework lists are ~80% inert, so `aspnet` and `entityframework` do far less than their size
suggests. Left in place deliberately: deleting curated content is a call for the team, and it would
foreclose a future change that matches against the un-split identifier before `SplitStage` runs.

## Verification

- Full analysis suite + `ktlintCheck` on JDK 17: green.
- Golden test: green, all 20 checks.
- Probe corpus re-run against `installDist` after every change.
