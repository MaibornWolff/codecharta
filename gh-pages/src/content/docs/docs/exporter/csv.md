---
title: "CSV Exporter"
---

**Category**: Exporter (takes in cc.json and outputs .csv)

Generates CSV file with header from visualization data (cc.json)

_Conventions for csv output:_

- Every node with attributes contributes one line
- Column named _path_ contains the hierarchical data of the node, separated via _/_
- Column named _name_ contains the name of the node
- Column named _type_ contains the type of the node
- Columns named _dir0_, _dir1_, ... contain the split hierarchical data of the node for convenience
- The other columns contain the attributes of the nodes

### Usage and Parameters

| Parameters                            | Description                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `--depth-of-hierarchy=<maxHierarchy>` | Defines how many layers of the project structure should be listed (DEFAULT: 10) |
| `FILE`                                | Input file                                                                      |
| `-h, --help`                          | Displays help and exits                                                         |
| `-o, --output-file=<outputFile>`      | Output File (or empty for stdout)                                               |

```
ccsh csvexport [-h] [--depth-of-hierarchy=<maxHierarchy>]
               [-o=<outputFile>] FILE...
```

### Examples

Basic example with output in CLI:

```
ccsh csvexport visual.cc.json
```

This example takes the rather large looking `sample1.cc.json` (see below) and converts it into a more compact format:

```
ccsh csvexport sample1.cc.json -o sample1.csv
```

**CSV Output (`sample1.csv`):**

```
path,name,type,rloc,functions,mcc,pairingRate,avgCommits,dir0,dir1,dir2,dir3,dir4,dir5,dir6,dir7,dir8,dir9
ParentLeaf/otherSmallLeaf.ts,otherSmallLeaf.ts,File,70.0,1000.0,10.0,65.0,22.0,ParentLeaf,,,,,,,,,
ParentLeaf/smallLeaf.html,smallLeaf.html,File,30.0,100.0,100.0,60.0,51.0,ParentLeaf,,,,,,,,,
bigLeaf.ts,bigLeaf.ts,File,100.0,10.0,1.0,77.0,56.0,,,,,,,,,,
sample1OnlyLeaf.scss,sample1OnlyLeaf.scss,File,400.0,10.0,100.0,32.0,17.0,,,,,,,,,,
```

**cc.json Input (`sample1.cc.json`, formatted for readability, the `attributeDescriptors` are left out):**

```
{
  "meta": {
    "projectName": "",
    "apiVersion": "2.1",
    "checksum": "f581ee7bc75ddf6bfc4dde6db72e2c6f"
  },
  "files": [
    {
      "id": "164ddff4bb1345e1",
      "name": "root",
      "type": "Folder",
      "children": [
        {
          "id": "1ae98c1a93690d75",
          "name": "ParentLeaf",
          "type": "Folder",
          "children": [
            {
              "id": "ea70504d5daa3547",
              "name": "otherSmallLeaf.ts",
              "type": "File",
              "link": ""
            },
            {
              "id": "120a1569e3556450",
              "name": "smallLeaf.html",
              "type": "File",
              "link": ""
            }
          ],
          "link": ""
        },
        {
          "id": "7de6343f370ff7cf",
          "name": "bigLeaf.ts",
          "type": "File",
          "link": ""
        },
        {
          "id": "3d6521b0884ce9f4",
          "name": "sample1OnlyLeaf.scss",
          "type": "File",
          "link": ""
        }
      ],
      "link": ""
    }
  ],
  "lenses": {
    "metrics": {
      "attributes": {
        "ea70504d5daa3547": {
          "rloc": 70.0,
          "functions": 1000.0,
          "mcc": 10.0,
          "pairingRate": 65.0,
          "avgCommits": 22.0
        },
        "120a1569e3556450": {
          "rloc": 30.0,
          "functions": 100.0,
          "mcc": 100.0,
          "pairingRate": 60.0,
          "avgCommits": 51.0
        },
        "7de6343f370ff7cf": {
          "rloc": 100.0,
          "functions": 10.0,
          "mcc": 1.0,
          "pairingRate": 77.0,
          "avgCommits": 56.0
        },
        "3d6521b0884ce9f4": {
          "rloc": 400.0,
          "functions": 10.0,
          "mcc": 100.0,
          "pairingRate": 32.0,
          "avgCommits": 17.0
        }
      },
      "attributeTypes": {}
    },
    "dependency": {
      "edges": [],
      "attributeTypes": {}
    }
  }
}
```

