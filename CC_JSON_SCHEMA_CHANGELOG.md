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
    "mcc": {
      "title": "Maximum Cyclic Complexity",
      "description": "Maximum cyclic complexity based on paths through the code by McCabe",
      "hintLowValue": "",
      "hintHighValue": "",
      "link": "https://www.npmjs.com/package/metric-gardener",
      "direction": -1
    }
  }
}
```
