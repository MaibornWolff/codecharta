---
categories:
  - ADR
tags:
  - analysis
  - model
  - format
title: "ADR 12: Separate File Structure From Analysis Lenses"
---

The `.cc.json` 1.5 format conflates concerns that the suite direction now forces apart. `Project`
doubles as both the domain model and the wire DTO (GSON reflects it directly; the `@Transient` merge
strategy on `MutableNode` and the `ProjectWrapper` are the fingerprints of that overload). Metrics live
directly on file nodes; edges are a top-level sibling; `attributeTypes` is split into `nodes`/`edges`
maps; `attributeDescriptors` is a flat map; and `blacklist` — which is view state — sits inside the
analysis format. Most importantly, **identity is positional**: merge matches nodes by name walking the
tree from the root down, so two inputs only fuse when they share the exact same rooted hierarchy. The
moment heterogeneous tools disagree on rooting — a backend tree and a frontend tree built separately,
or a coverage report (Jacoco roots by Java package, lcov by its own relative path) — the files do not
line up and nothing merges. This blocks the move from a metrics tool to a suite: adding DependaCharta,
DomainLanguageCharta, or SBOM/security signals would each bloat the core format, and there is no clean
place for additive overlays.

# Status

accepted — implemented on the analysis side (`ccsh` writes 2.0 by default and reads both 1.5 and
2.0; the visualization migrates in its own story). See
[the 2.0 format reference](../cc-json-2.0-format.md).

# Decision

Introduce `.cc.json` **2.0** with the shape `{ meta, files, lenses }`, on the **analysis side first**
(the visualization migrates in a separate story and stays on 1.5 until then).

- **`files`** is the identity layer: pure file/folder structure, one root folder, nested `children`,
  each node carrying a stable `id` and an optional `contentHash`. Metrics are pulled off the node.
- **`lenses`** are namespaced, additive overlays joined to `files` by `id`: `metrics` (attributes keyed
  by id, descriptors, types, clusters), `dependency` (edges + edge attribute types/descriptors),
  `domain` and `security` (reserved for the suite). Unknown lenses are preserved verbatim on round-trip,
  so a newer tool's lens survives an older tool.
- **Identity is decoupled from matching.** `id = sha-256(canonical path)` (truncated), computed by a
  single owner so every suite tool reproduces it; a canonicalization pass removes *spurious* divergence
  (separators, the synthetic root name, `.`/`..`, Unicode form, case). `contentHash` (the existing
  per-file checksum) is a *matching signal*, never the identity, so duplicated files stay distinct.
- **Merge becomes a resolver**, not positional name-walking: exact `id` → unique content hash → longest
  path-suffix → otherwise keep and warn. *Semantic* divergence (tools that genuinely root differently)
  is reconciled here or by an explicit re-root — not by the hash.
- A **DTO + mapper seam** becomes the only code that knows the wire format, and the domain `Project`
  becomes lens-native (`Project(meta, files, lenses)`), so the model stops doubling as the wire DTO.
- `blacklist`/`markedPackages` leave the format as visualization view state. Default output flips to
  2.0 with a one-way 1.5 → 2.0 converter; the input reader auto-detects and reads both.

Implementation is staged Tidy-First and tracked in `plans/2026-06-25-ccjson-2-lenses-analysis.md`.

# Consequences

Easier: additive suite lenses without touching the core; reproducible cross-tool identity; a clean
domain/wire separation; honest merges that warn instead of silently dropping unmatched files; one
canonical schema both sides will eventually share.

Harder / costs: a large change touching every metric producer and consumer, both merge strategies, and
the schema. Flipping the default to 2.0 breaks the (frozen) visualization and every golden/integration
fixture until each is migrated. Cross-tool identity is not free — it needs the canonicalization pass
*and* the resolver, because the `id` alone cannot reconcile differently-rooted trees. The per-file
`contentHash` must stay algorithm-compatible with the existing `--base-file` incremental feature.
