---
permalink: /docs/edge-filter
title: "Edge Filter"
---

**Category**: Filter (takes in cc.json and outputs cc.json)

Generates visualization data from a cc.json file with edges data. For every node its edge-attributes get aggregated and inserted as node-attribute. After using this command the file can also be visualized inside the visualization, because the `edgefilter` creates nodes, if they did not exist before.

## Usage and Parameters

| Parameters                         | Description                       |
| ---------------------------------- | --------------------------------- |
| `FILE`                             | files to filter                   |
| `-h, --help`                       | displays help and exits           |
| `-o, --outputFile=<outputFile>`    | output File (or empty for stdout) |
| `--path-seperator=<pathSeperator>` | path seperator (default= '/')     |

```
Usage: ccsh edgefilter [-h] [-o=<outputFile>]
                       [--path-separator=<pathSeparator>] FILE
```

## Example

```
ccsh edgefilter edges.cc.json -o visual_edges.cc.json
```

Executing this command would turn an `edges.cc.json` file that e.g. looks like this:

```
{
  "projectName": "Sample Project with edges",
  "apiVersion": "1.1",
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "children": []
    }
  ],
  "edges": [
    {
      "fromNodeName": "/root/app/codeCharta.html",
      "toNodeName": "/root/app/codeCharta.scss",
      "attributes": {
        "pairingRate": 56,
        "avgCommits": 10
      }
    },
    {
      "fromNodeName": "/root/app/testVille.html",
      "toNodeName": "/root/app/codeCharta.html",
      "attributes": {
        "pairingRate": 42,
        "avgCommits": 8
      }
    }
  ],
  "attributeTypes": {
    "edges": [
      "pairingRate": "relative",
      "avgCommits": "absolute"
    ]
  }
}
```

Into a `visual_edges.cc.json` file that looks like this:

```
{
  "projectName": "Sample Project with edges",
  "apiVersion": "1.1",
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "children": [
        {
          "name": "app",
          "type": "Folder",
          "attributes": {},
          "children": [
            {
              "name": "codeCharta.html",
              "type": "File",
              "attributes": {
                "pairingRate": 49,
                "avgCommits": 18
              }
            },
            {
              "name": "codeCharta.scss",
              "type": "File",
              "attributes": {
                "pairingRate": 56,
                "avgCommits": 10
              }
            },
            {
              "name": "testVille.html",
              "type": "File",
              "attributes": {
                "pairingRate": 42,
                "avgCommits": 8
              }
            }
          ]
        }
      ]
    }
  ],
  "edges": [
    {
      "fromNodeName": "/root/app/codeCharta.html",
      "toNodeName": "/root/app/codeCharta.scss",
      "attributes": {
        "pairingRate": 56,
        "avgCommits": 10
      }
    },
    {
      "fromNodeName": "/root/app/testVille.html",
      "toNodeName": "/root/app/codeCharta.html",
      "attributes": {
        "pairingRate": 42,
        "avgCommits": 8
      }
    }
  ],
  "attributeTypes": {
    "edges": [
      "pairingRate": "relative",
      "avgCommits": "absolute"
    ]
  }
}
```
