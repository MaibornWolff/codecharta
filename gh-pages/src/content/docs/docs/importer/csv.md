---
title: "CSV Importer"
---

**Category**: Importer (takes in CSV and outputs cc.json)

The CSV importer generates visualisation data from generic CSV data with header. How this CSV was generated does not matter, as long as it meets the following requirements:

_Conventions for csv input:_

- There must be a header.
- The specified path column name in the header, or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information for the corresponding node.
- Columns with empty or duplicate header will be ignored.

### Usage and Parameters

| Parameters                          | Description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `FILE`                              | csv files with header                                             |
| `--path-separator=<pathSeparator>`  | path separator (default = '/')                                    |
| `-d, --delimiter=<csvDelimiter>`    | delimiter in csv file (default = ',')                             |
| `-h, --help`                        | displays help                                                     |
| `-o, --output-file=<outputFile>`    | output File (or empty for stdout)                                 |
| `--path-column-name=<pathColumnName>` | specify the path column name (default = 'path')                 |
| `-nc, --not-compressed`             | save the output file uncompressed (plain JSON instead of gzip)    |

```
ccsh csvimport [-nc] [-d=<csvDelimiter>] [-o=<outputFile>] [--path-column-name=<pathColumnName>]
               [--path-separator=<pathSeparator>] FILE
```

### Example

```
ccsh csvimport example.csv -o exampleOut
```

This takes in a csv file that for example could look like this:

```
path,name,type,rloc,functions,mcc,pairingRate,avgCommits,dir0
sample1OnlyLeaf.scss,sample1OnlyLeaf.scss,File,400.0,10.0,100.0,32.0,17.0,
bigLeaf.ts,bigLeaf.ts,File,100.0,10.0,1.0,77.0,56.0,
ParentLeaf/smallLeaf.html,smallLeaf.html,File,30.0,100.0,100.0,60.0,51.0,ParentLeaf
ParentLeaf/otherSmallLeaf.ts,otherSmallLeaf.ts,File,70.0,1000.0,10.0,65.0,22.0,ParentLeaf
```

And output a cc.json file that looks like this (the output will all be in one line, here the json was formatted to be more readable and the `attributeDescriptors` are left out):

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

## Custom metrics

The various parsers of the `ccsh` supply a large variety of different metrics out of the box. In case these do not match your need, you can add new metrics whenever your metric data is available in CSV form. All this importer needs is the file name (including path to it to depict the folder structure) and the different metrics. This makes it possible to display various metrics, independently of how they were generated.

### Custom Metric CSV Import

Suppose that you had a file `newmetrics.csv` with the following contents:

```csv
name,Metric1,Metric2
File.js,4,500
service/Service1.ts,40,20
```

You can transform that file into a `.cc.json` via command-line:

```
ccsh csvimport newmetrics.csv -o newmetrics.cc.json
```

This results in a new file `newmetrics.cc.json` that can be used as is in the visualisation.

If you are interested in what a cc.json file for custom metrics looks like, here is what the `newmetrics.cc.json` looks like (the `attributeDescriptors` are left out):

```json
{
  "meta": {
    "projectName": "",
    "apiVersion": "2.1",
    "checksum": "211f97a56ddb8746637c0c7a6a7b7866"
  },
  "files": [
    {
      "id": "164ddff4bb1345e1",
      "name": "root",
      "type": "Folder",
      "children": [
        {
          "id": "12613ba8c758725d",
          "name": "File.js",
          "type": "File",
          "link": ""
        },
        {
          "id": "829f61caef15986c",
          "name": "service",
          "type": "Folder",
          "children": [
            {
              "id": "0a12c853600c5fdc",
              "name": "Service1.ts",
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
      "attributes": {
        "12613ba8c758725d": {
          "Metric1": 4.0,
          "Metric2": 500.0
        },
        "0a12c853600c5fdc": {
          "Metric1": 40.0,
          "Metric2": 20.0
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

