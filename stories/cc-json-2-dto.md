# New cc.json 2.0 DTO Between Visualization and CLI

> ⚠️ **Status: DRAFT — must be reviewed and agreed before this story is started.**
> Once accepted, this DTO is the single go-to contract for both frontend (visualization) and backend (CLI).

**As a** developer working on the CLI and the visualization
**I want** the data contract between them changed to the new `{ meta, files, lenses }` format
**So that** there is one canonical schema both sides share, with room for multiple lenses (metrics, domain, dependency, security)

## Proposed DTO (to review)
```json
{
    "meta": {
        "projectName": "",
        "checkSum": "",
        "apiVersion": 2.0,
        "commitHash": 2
    },
    "files": [
        {
            "id": 1,
            "name": "FolderName",
            "type": "Folder",
            "children": [
                // File
                // Folder
            ]
        },
        {
            "id": 2,
            "name": "FileName",
            "type": "File"
        }
    ],
    "lenses": {
        "metrics": {
            "attributes": [ /* as before, attributes per node identified by id */ ],
            "attributeDescriptors": [ /* as before */ ],
            "attributeTypes": [ /* as before */ ],
            "clusters": [
                // TODO
            ]
        },
        "domain": {
            // TODO
        },
        "dependency": {
            "edges": [ /* as before */ ]
        },
        "security": {
            // TODO
        }
    }
}
```

## Open Questions / Review Points
- [ ] Define the `clusters` shape under `lenses.metrics`
- [ ] Define the `lenses.domain` shape
- [ ] Define the `lenses.security` shape
- [ ] Confirm spelling `dependency` (original draft had `dependendy`)
- [ ] Confirm `meta.commitHash` type and meaning (draft shows a number `2`; commit hashes are usually strings)
- [ ] Confirm `meta.apiVersion` value/representation (`2.0` as number vs string)
- [ ] Confirm `id` is the join key and how it maps from a file/folder path
- [ ] Confirm attributes/edges still reference nodes by `id`
- [ ] Decide what stays viz-only and is NOT part of this DTO (e.g. blacklist, marked packages)

## Acceptance Criteria
- [ ] The reviewed DTO is documented as the canonical schema and the JSON schema is generated/updated
- [ ] CLI serializes `.cc.json` in the new format
- [ ] Visualization deserializes and renders from the new format
- [ ] A converter exists for both directions (old ⇄ new) so existing files still load
- [ ] `meta`, `files` (nested folders/files by `id`), and `lenses.metrics` (attributes, descriptors, types) round-trip correctly
- [ ] `dependency.edges` round-trip correctly
- [ ] `domain`, `security`, and `clusters` are scaffolded per the agreed shapes (or explicitly deferred)
- [ ] Tests on both sides validate against the new schema and the suites pass
