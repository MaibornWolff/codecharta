---
permalink: /docs/csv-importer
title: "CSV Importer"
---

**Category**: Importer (takes in CSV and outputs cc.json)

The CSV importer generates visualisation data from CSV data with header, e.g. from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

_Conventions for csv input:_

- There must be a header.
- The specified path column name in the header, or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information the corresponding node.
- Columns with empty or duplicate header will be ignored.

## Usage and Parameters

| Parameters                          | Description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `FILE`                              | sourcemonitor csv files                                           |
| `--path-seperator=<pathSeperator>`  | path seperator (default= '/')                                     |
| `-d, --delimeter=<csvDelimeter>`    | delimeter in csv file                                             |
| `-h, --help`                        | displays help                                                     |
| `-o, --outputFile=<outputFile>`     | output File (or empty for stdout)                                 |
| `--pathColumnName=<pathColumnName>` | specify the path column name                                      |
| `-nc, --not-compressed`             | uncompresses outputfile to json format, if format of File is gzip |

```
ccsh csvimport [-nc] [-d=<csvDelimiter>] [-o=<outputFile>] [--path-column-name=<pathColumnName>]
               [--path-separator=<pathSeparator>] FILE
```

## Example

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

And output a cc.json file that looks like this (the output will all be in one line, here the json was sorted to be more readable):

```
  "checksum": "93f5995ee258ed3ff1fb1fe396c704eb",
  "data": {
    "projectName": "",
    "nodes": [
      {
        "name": "root",
        "type": "Folder",
        "attributes": {},
        "link": "",
        "children": [
          {
            "name": "sample1OnlyLeaf.scss",
            "type": "File",
            "attributes": {
              "rloc": 400.0,
              "functions": 10.0,
              "mcc": 100.0,
              "pairingRate": 32.0,
              "avgCommits": 17.0
            },
            "link": "",
            "children": []
          },
          {
            "name": "bigLeaf.ts",
            "type": "File",
            "attributes": {
              "rloc": 100.0,
              "functions": 10.0,
              "mcc": 1.0,
              "pairingRate": 77.0,
              "avgCommits": 56.0
            },
            "link": "",
            "children": []
          },
          {
            "name": "ParentLeaf",
            "type": "Folder",
            "attributes": {},
            "link": "",
            "children": [
              {
                "name": "smallLeaf.html",
                "type": "File",
                "attributes": {
                  "rloc": 30.0,
                  "functions": 100.0,
                  "mcc": 100.0,
                  "pairingRate": 60.0,
                  "avgCommits": 51.0
                },
                "link": "",
                "children": []
              },
              {
                "name": "otherSmallLeaf.ts",
                "type": "File",
                "attributes": {
                  "rloc": 70.0,
                  "functions": 1000.0,
                  "mcc": 10.0,
                  "pairingRate": 65.0,
                  "avgCommits": 22.0
                },
                "link": "",
                "children": []
              }
            ]
          }
        ]
      }
    ],
    "apiVersion": "1.3",
    "edges": [],
    "attributeTypes": {},
    "attributeDescriptors": {
      "rloc": {
        "title": "rloc",
        "description": "",
        "hintLowValue": "",
        "hintHighValue": "",
        "link": "",
        "direction": -1
      },
      "functions": {
        "title": "functions",
        "description": "",
        "hintLowValue": "",
        "hintHighValue": "",
        "link": "",
        "direction": -1
      },
      "mcc": {
        "title": "mcc",
        "description": "",
        "hintLowValue": "",
        "hintHighValue": "",
        "link": "",
        "direction": -1
      },
      "pairingRate": {
        "title": "pairingRate",
        "description": "",
        "hintLowValue": "",
        "hintHighValue": "",
        "link": "",
        "direction": -1
      },
      "avgCommits": {
        "title": "avgCommits",
        "description": "",
        "hintLowValue": "",
        "hintHighValue": "",
        "link": "",
        "direction": -1
      }
    },
    "blacklist": []
  }
}
```
