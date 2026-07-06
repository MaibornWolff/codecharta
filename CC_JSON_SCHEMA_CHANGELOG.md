# CC-Json schema changelog

All notable changes to the `cc.json`-schema will be documented in this file.

## 1.1

- An additional optional property `edges` has been added to the `cc.json`
- Defines an array of edges between buildings
- Use SCMLogParser (SVN or Git) to generate edges

```ts
export interface Edge {
  fromNodeName: string
  toNodeName: string
  attributes: KeyValuePair
}
```

## 1.2

- An additional optional property `fixedPosition` has been added to the `cc.json`
- Property can be set to direct children of the root-folder
- Define `left` and `top` as the top-left corner of the folder
- Define `width` and `height` for the length in x and y-direction
- Folders can't overlap and must be defined in range of `[0-100]`

```ts
export interface Fixed {
  left: number
  top: number
  width: number
  height: number
}
```

## 1.3

- An additional property `checksum` has been added to the `cc.json`
- All known properties are wrapped in the `data` property
- `checksum` contains the MD5 hash calculated through the content of `data`

```json
{
  "checksum": "a30746ae9d919c891992ab1dea88471b",
  "data": {
    "projectName": "bar",
    "apiVersion": "1.3",
    "nodes": [],
    "edges": [],
    "attributeTypes": {},
    "blacklist": []
  }
}
```

## 1.4

- An additional `direction` property has been added to the attribute descriptors, specifying whether higher or lower attribute values indicate better code quality.

```json
{
  "attributeDescriptors": {
    "complexity": {
      "title": "Cyclomatic Complexity",
      "description": "Maximum cyclomatic complexity based on the number of paths through the code",
      "hintLowValue": "",
      "hintHighValue": "",
      "link": "https://www.npmjs.com/package/metric-gardener",
      "direction": -1
    }
  }
}
```

## 1.5

- An additional `analyzers` property has been added to the attribute descriptors, specifying which analyzer was used to generate the metric. This can contain multiple values if the `cc.json` is merged.
```json
{
  "attributeDescriptors": {
    "rloc": {
      "title": "Real Lines of Code",
      "description": "Number of lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment",
      "hintLowValue": "",
      "hintHighValue": "",
      "link": "https://codecharta.com/docs/parser/unified",
      "direction": -1,
      "analyzers": [
        "unifiedParser"
      ]
    }
  }
}
```

## 1.6

- An additional optional property `checksum` has been added to elements of `nodes` which are of type `File`. This checksum is calculated based on the files content and can be used by analyzers that update a `cc.json` to check if they need to recalculate the metrics of a node.
```json
{
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "link": "",
      "children": [
        {
          "name": "Samplefile",
          "type": "File",
          "attributes": {
            "complexity": 32.0,
            "comment_lines": 46.0,
            "rloc": 140.0,
            "loc": 203.0
          },
          "link": "",
          "children": [],
          "checksum": "3ccac3cacd32f1c7"
        }
      ]
    }
  ]
}
```

## 2.0

- **Breaking restructure** to the `{ meta, files, lenses }` shape: `files` is the identity layer (each
  node carries a stable `id`), and analysis signals move into additive `lenses` (`metrics`, `dependency`,
  reserved `domain`/`security`, and any unknown lens preserved verbatim). Node metrics are keyed by `id`
  in `lenses.metrics`; edges reference endpoints by `id` in `lenses.dependency`. `meta.checksum` is an
  MD5 over the serialized `files`+`lenses`. See [`dev_docs/cc-json-2.0-format.md`](dev_docs/cc-json-2.0-format.md)
  and [`dev_docs/cc-json-2.0.schema.json`](dev_docs/cc-json-2.0.schema.json).

### Versioning policy (from 2.0 on)

- **Downward-compatible, additive-only** — same contract the 1.x entries above followed. `apiVersion`
  is validated as **major 2, any minor** (`^2\.\d+$`), not a pinned `2.0`.
- A new minor (`2.1`, `2.2`, …) may only **add optional** fields (or a whole new lens). Existing fields
  are never removed, renamed, retyped, or repurposed — so the newest tools read every older 2.x file.
- Readers keep `additionalProperties: false`, so an **older** tool cleanly rejects a **newer** file that
  uses a field it doesn't know (no upward compatibility — update CodeCharta to read newer files).
- A change that must break an existing field is a **new major** (`3.0`); major-2 tools reject it.
