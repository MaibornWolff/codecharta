---
permalink: /docs/csv-exporter
title: "CSV Exporter"
---

**Category**: Exporter (takes in cc.json and outputs .csv)

Generates CSV file with header from visualization data (cc.json)

_Conventions for csv output:_

- Every node with attributes contributes one line
- Column named _path_ contains the hierarchical data of the node, separated via _/_
- Column named _name_ contains the name of the node
- Column named _type_ contains the type of the node
- Columns named _Dir0_, _Dir1_, ... contain the split hierarchical data of the node for convenience
- The other columns contain the attributes of the nodes

## Usage and Parameters

| Parameters                            | Description                       |
| ------------------------------------- | --------------------------------- |
| `--depth-of-hierarchy=<maxHierarchy>` | depth of the hierarchy            |
| `FILE`                                | files to filter                   |
| `-h, --help`                          | displays help and exits           |
| `-o, --outputFile=<outputFile>`       | output File (or empty for stdout) |

```
ccsh csvexport [-h] [--depth-of-hierarchy=<maxHierarchy>]
               [-o=<outputFile>] FILE...
```

## Examples

```
ccsh csvexport visual.cc.json
```

```
ccsh csvexport sample1.cc.json -o sample1.csv
```

This above examples takes the rather large looking `sample1.cc.json` (see below) and converts it into a more compact format like this:

**CSV Output:**

```
path,name,type,rloc,functions,mcc,pairingRate,avgCommits,dir0,dir1,dir2,dir3,dir4,dir5,dir6,dir7,dir8,dir9
sample1OnlyLeaf.scss,sample1OnlyLeaf.scss,File,400.0,10.0,100.0,32.0,17.0,,,,,,,,,,
bigLeaf.ts,bigLeaf.ts,File,100.0,10.0,1.0,77.0,56.0,,,,,,,,,,
ParentLeaf/smallLeaf.html,smallLeaf.html,File,30.0,100.0,100.0,60.0,51.0,ParentLeaf,,,,,,,,,
ParentLeaf/otherSmallLeaf.ts,otherSmallLeaf.ts,File,70.0,1000.0,10.0,65.0,22.0,ParentLeaf,,,,,,,,,
```

**CC.JSON Input:**

```
{
  "projectName": "Sample Project with Edges",
  "apiVersion": "1.2",
  "fileChecksum": "valid-md5-sample1",
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "children": [
        {
          "name": "sample1OnlyLeaf.scss",
          "type": "File",
          "attributes": {
          "rloc": 400,
          "functions": 10,
          "mcc": 100,
          "pairingRate": 32,
          "avgCommits": 17
          },
          "link": "http://www.google.de"
        },
        {
          "name": "bigLeaf.ts",
          "type": "File",
          "attributes": {
            "rloc": 100,
            "functions": 10,
            "mcc": 1,
            "pairingRate": 77,
            "avgCommits": 56
          },
          "link": "http://www.google.de"
        },
        {
          "name": "ParentLeaf",
          "type": "Folder",
          "attributes": {},
          "children": [
            {
              "name": "smallLeaf.html",
              "type": "File",
              "attributes": {
                "rloc": 30,
                "functions": 100,
                "mcc": 100,
                "pairingRate": 60,
                "avgCommits": 51
              }
            },
            {
              "name": "otherSmallLeaf.ts",
              "type": "File",
              "attributes": {
                "rloc": 70,
                "functions": 1000,
                "mcc": 10,
                "pairingRate": 65,
                "avgCommits": 22
              }
            }
          ]
        }
      ]
    }
  ],
  "edges": [
    {
      "fromNodeName": "/root/bigLeaf.ts",
      "toNodeName": "/root/ParentLeaf/smallLeaf.html",
      "attributes": {
        "pairingRate": 89,
        "avgCommits": 34
      }
    },
    {
      "fromNodeName": "/root/sample1OnlyLeaf.scss",
      "toNodeName": "/root/ParentLeaf/smallLeaf.html",
      "attributes": {
        "pairingRate": 32,
        "avgCommits": 17
      }
    },
    {
      "fromNodeName": "/root/ParentLeaf/otherSmallLeaf.ts",
      "toNodeName": "/root/bigLeaf.ts",
      "attributes": {
        "pairingRate": 65,
        "avgCommits": 22
      }
    }
  ],
  "attributeTypes": {
    "nodes": { "rloc": "absolute", "functions": "absolute", "mcc": "absolute", "pairingRate": "relative" },
    "edges": { "pairingRate": "relative", "avgCommits": "absolute" }
  }
}
```
