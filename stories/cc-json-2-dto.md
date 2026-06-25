# cc.json 2.0 `{meta, files, lenses}` — Analysis Side

> ✅ **Status: DECIDED (2026-06-25).** Scope is **analysis (`ccsh`) only**; the visualization migrates
> in its own later story and stays on 1.5 until then. Design is captured in
> **ADR 12** (`dev_docs/adr/2026-06-25-ADR_12_separate_file_structure_from_analysis_lenses.md`) and the
> implementation plan **`plans/2026-06-25-ccjson-2-lenses-analysis.md`**. This story is the gate for
> the suite stories (#6 clone importer, #8 domain, #9 SBOM, #10 dependency).

**As a** developer working on the CodeCharta CLI
**I want** `.cc.json` changed to the `{ meta, files, lenses }` 2.0 format
**So that** structure (identity) and analysis signals (metrics, dependency, domain, security) are
separated into additive, id-joined lenses that the suite can extend without bloating the core.

## The contract
```json
{
    "meta": {
        "projectName": "my-project",
        "apiVersion": "2.0",
        "checksum": "<hash of the serialized payload>",
        "commitHash": "a1b2c3d"
    },
    "files": [
        {
            "id": "<sha256(/)[:16]>",
            "name": "root",
            "type": "Folder",
            "children": [
                {
                    "id": "<sha256(/src)[:16]>",
                    "name": "src",
                    "type": "Folder",
                    "children": [
                        {
                            "id": "<sha256(/src/App.kt)[:16]>",
                            "name": "App.kt",
                            "type": "File",
                            "contentHash": "<per-file content checksum>"
                        }
                    ]
                }
            ]
        }
    ],
    "lenses": {
        "metrics": {
            "attributes": {
                "<sha256(/src/App.kt)[:16]>": { "rloc": 120, "mcc": 8 }
            },
            "attributeDescriptors": {},
            "attributeTypes": {},
            "clusters": []
        },
        "dependency": {
            "edges": [
                { "fromId": "<id>", "toId": "<id>", "attributes": { "pairingRate": 42 } }
            ],
            "attributeTypes": {},
            "attributeDescriptors": {}
        },
        "domain": {},
        "security": {}
    }
}
```
Unknown top-level lenses are preserved verbatim on round-trip (forward-compat).

## Decisions (the former open questions, now resolved)
- **`apiVersion`** = string `"2.0"`. **`checksum`** (corrected spelling) = hash of the serialized
  payload. **`commitHash`** = short git SHA string (optional).
- **`id`** = `sha-256(canonical path)` truncated to 16 hex, from one shared `NodeId` owner. Canonical
  path = tree position, root excluded, `/`-separated, `.`/`..` collapsed, Unicode NFC, case preserved.
- **`lenses.metrics.attributes`** = **map keyed by `id`** (not an array). The old `attributeTypes`
  node/edge split is gone — node types live under `metrics`, edge types under `dependency`.
- **`dependency`** (corrected from `dependendy`): `edges` reference nodes by `fromId`/`toId`.
- **Identity ≠ matching.** `id` is unique (path). `contentHash` (the existing per-file checksum) is a
  *matching signal*, never the id, so duplicate files stay distinct. Merge is a resolver: id → unique
  content hash → longest path-suffix → warn.
- **`blacklist` and `markedPackages` are NOT in the format** — they are visualization view state.
- **Default output flips to 2.0** with a one-way **1.5 → 2.0** converter; the reader auto-detects both.
- **`clusters` / `domain` / `security`** shapes are reserved here and defined in their own stories.

## Acceptance Criteria (analysis only)
- [ ] The everit JSON schema (analysis `ValidationTool` resource) is rewritten for 2.0; `ValidationTool`
      validates 2.0.
- [ ] `ccsh` serializes `.cc.json` in the 2.0 format by default; the reader auto-detects and reads 1.5
      and 2.0.
- [ ] A `ccsh` **1.5 → 2.0** converter exists so existing files migrate into the suite.
- [ ] `meta`, `files` (nested folders/files with reproducible `id` + `contentHash`), and
      `lenses.metrics` round-trip correctly; `dependency.edges` (by `fromId`/`toId`) round-trip correctly.
- [ ] `id` is reproducible across tools for the same tree position; the merge resolver joins by
      id/content/suffix and warns (never silently mis-merges) on unmatched/ambiguous input.
- [ ] `domain`, `security`, and `clusters` are scaffolded (reserved keys); unknown lenses survive
      round-trip.
- [ ] Analysis unit + integration/golden suites pass against the new format (fixtures migrated).

## Out of scope (deferred)
- Visualization reading/rendering 2.0 (separate story); `2.0 → 1.5` downconversion.
- Coverage importer content-hashing source files; FQN/alias keys; a component/module layer.
- Concrete `clusters` / `domain` / `security` lens shapes.
