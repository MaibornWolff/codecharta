---
name: blacklist-performance-analysis
issue: ""
state: todo
version: <next>
date: 2026-05-05
git_commit: 724a7a0cea3c7ac5b3f345114ff668933c1ce77d
branch: main
topic: "Why flatten/exclude operations get slow as rules accumulate, and how to fix it"
tags: [analysis, performance, visualization, blacklist, sidebar-explorer]
---

# Blacklist performance analysis

## Symptom

Adding or removing a flatten/exclude rule on a large codebase causes a visible
stall (hundreds of ms to multiple seconds) before the codemap re-renders. The
stall scales with both the number of leaves in the map and the number of rules
already in the blacklist.

## Root cause: `isPathBlacklisted` rebuilds the matcher on every call

`app/codeCharta/util/codeMapHelper.ts:63`

```ts
export function isPathBlacklisted(path, blacklist, type) {
    if (blacklist.length === 0) return false
    const ig = ignore()                          // fresh engine per call
    for (const entry of blacklist) {
        if (entry.type === type) {
            ig.add(transformPath(entry.path))    // regex-compile per entry
        }
    }
    return ig.ignores(transformPath(path))
}
```

Each call:
1. Allocates a new `ignore` engine
2. Iterates the entire blacklist
3. Compiles a regex per matching entry (`ignore.add()` parses the pattern)
4. Runs **one** match, then throws the engine away

The function is correct but has no caching. Reselect memoization at the outer
selector level does **not** help — when `blacklist` changes, the inner per-leaf
loop re-runs in full.

## Hot call sites

| Caller | File | Cost per blacklist mutation |
|---|---|---|
| `_calculateExplorerCounts` | `features/sidebarExplorer/selectors/sidebarExplorer.selectors.ts` | `2 × L` calls, each builds with `B` entries |
| `buildRulesWithCount` | same file | `R × L` calls, each builds with 1 entry |
| `calculateNodeMetricData` | `state/selectors/accumulatedData/metricData/nodeMetricData.calculator.ts` | `L` calls, each builds with `B` entries |
| `calculateEdgeMetricData` | sibling file | `2 × edges` calls, each builds with `B` |
| `streetLayoutGenerator.createBoxes` | `util/algorithm/streetLayout/streetLayoutGenerator.ts` | per non-leaf traversal, each builds with `B` |
| `resultsInEmptyMap` | `state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap.ts` | full traversal |

Where:
- `L` = number of leaf nodes in the map
- `B` = total blacklist entries
- `R` = entries of the given type

## Cost on a representative map

`L = 10,000` leaves, `B = 20` entries (`R_flatten = 15`, `R_exclude = 5`):

| Selector | Engine builds | Regex compiles |
|---|---|---|
| `_calculateExplorerCounts` | `2L = 20,000` | `× B = 400,000` |
| `flattenRulesWithCount` | `R_flatten × L = 150,000` | `× 1 = 150,000` |
| `excludeRulesWithCount` | `R_exclude × L = 50,000` | `× 1 = 50,000` |
| `nodeMetricData` | `L = 10,000` | `× B = 200,000` |
| **Total** | **~230,000 builds** | **~800,000 compiles** |

Per single add/remove. The 3D mesh rebuild then runs on top of this.

## Compounding factors

1. **`transformPath` runs on every check.** The same `node.path` is transformed
   thousands of times. It's a tiny cost individually, but at this call volume it
   adds up.
2. **Selectors fire synchronously**, so the UI is frozen until the whole chain
   finishes — the user perceives a hang.
3. **The 3D mesh rebuild stacks on top.** When the blacklist changes, geometry
   regen and a render are dispatched after the selectors settle. The selector
   cost is invisible work that runs *before* the visible rebuild — so even a
   "fast" mesh rebuild feels slow.
4. **Selector chain fan-out.** A single `setBlacklist` triggers
   `accumulatedDataSelector`, `searchedNodesSelector`, `metricData.selector`,
   `codeMapNodesSelector`, the explorer selectors, the legend, etc. Each one
   that depends on the blacklist re-runs `isPathBlacklisted` per leaf.

## Why memoization can't save us today

- Reselect compares input references. `blacklist` is a new array on each
  mutation, so all dependent selectors re-fire — that's correct.
- The expensive work is *inside* the selector body, in a per-leaf loop that
  isn't memoized.
- Each `isPathBlacklisted` call is self-contained: no shared engine across the
  loop iterations.

## Proposed fixes

### A. Cache the `ignore` engine per `(blacklist, type)`

Build a memoized selector that produces two engines (flatten + exclude) once
when `blacklist` changes, then have all hot callers reuse them:

```ts
export const blacklistEnginesSelector = createSelector(blacklistSelector, blacklist => {
    const flatten = ignore()
    const exclude = ignore()
    for (const entry of blacklist) {
        const transformed = transformPath(entry.path)
        if (entry.type === "flatten") flatten.add(transformed)
        else exclude.add(transformed)
    }
    return { flatten, exclude }
})
```

Add a fast-path helper next to the existing function (keeps backward compat):

```ts
export const isPathBlacklistedWithEngine = (path: string, engine: Ignore) =>
    engine.ignores(transformPath(path))
```

Use the engine in `_calculateExplorerCounts`, `calculateNodeMetricData`, and
`calculateEdgeMetricData`. Drops `2L × B` compiles to `2 × B` compiles per
mutation.

**Expected speedup on hot selectors: 50–200×.**

### B. Build one engine per rule (not per leaf) in `buildRulesWithCount`

Currently `flatten/excludeRulesWithCountSelector` calls `isPathBlacklisted` on
every (leaf × rule) pair, building an engine each time. Pre-build R
single-entry engines:

```ts
const itemsOfType = blacklist.filter(i => i.type === type)
const engines = itemsOfType.map(item => ({
    item,
    ig: ignore().add(transformPath(item.path))
}))
return engines.map(({ item, ig }) => ({
    item,
    affectedCount: allLeaves.reduce(
        (count, node) => count + (ig.ignores(transformPath(node.path)) ? 1 : 0),
        0
    ),
    kind: isPatternRule(item.path) ? "RULE" : "MANUAL"
}))
```

Drops `R × L` engine builds to `R`.

### C. Pre-transform leaf paths once

Cache `transformPath(node.path)` in a parallel array (or weakly per-node) so
the inner loop is just a hash lookup + `engine.ignores()`. Useful once A and B
are in place — currently `transformPath` is dwarfed by the engine-build cost.

### D. (Larger) — Memoize at the leaf level

For pipelines that need the *set* of blacklisted paths (not per-path checks),
compute a `Set<string>` once when the engines are built:

```ts
export const flattenedPathsSelector = createSelector(
    codeMapNodesSelector, blacklistEnginesSelector,
    (leaves, { flatten }) => new Set(
        leaves.filter(n => flatten.ignores(transformPath(n.path))).map(n => n.path)
    )
)
```

Then `streetLayoutGenerator` and friends switch from per-node `isPathBlacklisted`
calls to `set.has(node.path)` — O(1) per check, no engine touch.

## Out of scope (for now)

- The 3D mesh rebuild itself. That's a separate axis (geometry generation,
  shader updates, raycaster cache) and should be analyzed independently.
- Replacing the `ignore` library. It's the right tool; we're just calling it
  wrong.

## Order of implementation

1. **A** alone gets ~80% of the win and is contained: one new selector, one new
   helper, three call-site swaps. ~30 minutes.
2. **B** is similarly local — only `sidebarExplorer.selectors.ts`. ~15 minutes.
3. **C** is the cleanup pass; only worth it if A+B aren't enough.
4. **D** is the right answer for `streetLayoutGenerator` if it shows up in
   profiles after A.

## Verification

- Add a Jest perf-style spec asserting `blacklistEnginesSelector` returns the
  same engine reference when blacklist is reference-equal.
- Manual: load `sample1.cc.json` with ~10k leaves, add 20 rules in sequence,
  confirm each add takes <50ms before the 3D rebuild starts (use the
  Performance tab "User Timing" markers around `setBlacklist`).
