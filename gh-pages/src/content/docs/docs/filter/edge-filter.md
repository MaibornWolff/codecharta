---
title: "Edge Filter"
---

**Category**: Filter (takes in cc.json and outputs cc.json)

Generates visualization data from a cc.json file with edges data. For every node its edge-attributes get aggregated and inserted as node-attribute. After using this command the file can also be visualized inside the visualization, because the `edgefilter` creates nodes if they did not exist before.

### Usage and Parameters

| Parameters                         | Description                       |
| ---------------------------------- | --------------------------------- |
| `FILE`                             | files to filter                   |
| `-h, --help`                       | displays help and exits           |
| `-o, --output-file=<outputFile>`   | output File (or empty for stdout); the output is not compressed |
| `--path-separator=<pathSeparator>` | path separator (default = '/')    |

```
Usage: ccsh edgefilter [-h] [-o=<outputFile>]
                       [--path-separator=<pathSeparator>] FILE
```

### Example

```
ccsh edgefilter edges.cc.json -o visual_edges.cc.json
```

Executing this command would turn an `edges.cc.json` file that e.g. looks like this (the `attributeDescriptors` are left out here and below):

```
{
  "meta": {
    "projectName": "",
    "apiVersion": "2.1",
    "checksum": "fdbcc27628d9920e9b74c4afcc59d114"
  },
  "files": [
    {
      "id": "164ddff4bb1345e1",
      "name": "root",
      "type": "Folder",
      "children": [
        {
          "id": "06121309c9b10d8a",
          "name": "app",
          "type": "Folder",
          "children": [
            {
              "id": "6b185a8cc9433de8",
              "name": "codeCharta.html",
              "type": "File",
              "link": ""
            },
            {
              "id": "d515f754245533a8",
              "name": "codeCharta.scss",
              "type": "File",
              "link": ""
            },
            {
              "id": "4c6b71df479538b7",
              "name": "testVille.html",
              "type": "File",
              "link": ""
            }
          ],
          "link": ""
        }
      ],
      "link": ""
    }
  ],
  "lenses": {
    "metrics": {
      "attributes": {},
      "attributeTypes": {}
    },
    "dependency": {
      "edges": [
        {
          "fromId": "6b185a8cc9433de8",
          "toId": "d515f754245533a8",
          "attributes": {
            "pairingRate": 56,
            "avgCommits": 10
          }
        },
        {
          "fromId": "4c6b71df479538b7",
          "toId": "6b185a8cc9433de8",
          "attributes": {
            "pairingRate": 42,
            "avgCommits": 8
          }
        }
      ],
      "attributeTypes": {
        "pairingRate": "relative",
        "avgCommits": "absolute"
      }
    }
  }
}
```

Into a `visual_edges.cc.json` file that looks like this:

```
{
  "meta": {
    "projectName": "",
    "apiVersion": "2.1",
    "checksum": "ed44ca25feabe4f543becc73f579b606"
  },
  "files": [
    {
      "id": "164ddff4bb1345e1",
      "name": "root",
      "type": "Folder",
      "children": [
        {
          "id": "06121309c9b10d8a",
          "name": "app",
          "type": "Folder",
          "children": [
            {
              "id": "6b185a8cc9433de8",
              "name": "codeCharta.html",
              "type": "File"
            },
            {
              "id": "d515f754245533a8",
              "name": "codeCharta.scss",
              "type": "File"
            },
            {
              "id": "4c6b71df479538b7",
              "name": "testVille.html",
              "type": "File"
            }
          ]
        }
      ],
      "link": ""
    }
  ],
  "lenses": {
    "metrics": {
      "attributes": {
        "6b185a8cc9433de8": {
          "pairingRate": 49,
          "avgCommits": 18
        },
        "d515f754245533a8": {
          "pairingRate": 56,
          "avgCommits": 10
        },
        "4c6b71df479538b7": {
          "pairingRate": 42,
          "avgCommits": 8
        }
      },
      "attributeTypes": {}
    },
    "dependency": {
      "edges": [
        {
          "fromId": "6b185a8cc9433de8",
          "toId": "d515f754245533a8",
          "attributes": {
            "pairingRate": 56,
            "avgCommits": 10
          }
        },
        {
          "fromId": "4c6b71df479538b7",
          "toId": "6b185a8cc9433de8",
          "attributes": {
            "pairingRate": 42,
            "avgCommits": 8
          }
        }
      ],
      "attributeTypes": {
        "pairingRate": "relative",
        "avgCommits": "absolute"
      }
    }
  }
}
```

