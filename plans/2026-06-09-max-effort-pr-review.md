---
name: max-effort-pr-review
issue: none
state: complete
version: 1
---

## Goal

Max-effort recall review of the full `fix/explorer-sort-dropdown-auto-close` PR (ribbon bar → floating metrics bar, ~283 files) using fanned-out review agents.

## Tasks

### 1. Find candidates
- 17 finder agents: line-by-line scan split over 6 diff partitions, removed-behavior (ribbonBar + other deletions), cross-file tracer (utils/render + UI wiring), language pitfalls, wrapper/proxy, reuse, simplification, efficiency, altitude

### 2. Verify
- Dedup candidates, one 3-state verifier (CONFIRMED/PLAUSIBLE/REFUTED) per candidate

### 3. Sweep and report
- Fresh-eyes gap sweep with verified list, verify sweep candidates, output ≤15 ranked findings

## Steps

- [x] Partition the diff by size/area
- [x] Run finder fan-out (17 finders, 96 candidates)
- [x] Verify candidates (74 confirmed, 2 plausible, 6 refuted)
- [x] Sweep for gaps (4 new)
- [x] Report ranked findings (15 reported, 79 survived total)
