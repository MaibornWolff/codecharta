# CodeMaat Coupling Importer

Generates visualisation data from CodeMaat Temporal Coupling CSV data with header. You can find the analizing tool on GitHub https://github.com/adamtornhill/code-maat

## Usage

1. Create VCS Log file from your project, e.x. with Git

    `git log --pretty=format:'[%h] %an %ad %s' --since=<YYYY/MM/DD> --date=short --numstat > project.log`

2. Analyse the Log with [CodeMaat](https://github.com/adamtornhill/code-maat)

    `maat -c git -l project.log -a coupling > coupling.csv`

3. Convert csv file to cc.json format with CodeMaatCouplingImporter

    `ccsh codemaat-couplingimport coupling.csv -o oupling.json`
        
4. Merge the coupling data with the project metrics file while using the [MergeFilter](https://github.com/MaibornWolff/codecharta/blob/master/analysis/filter/MergeFilter/README.md)

    `ccsh merge coupling.json metrics.json -o merged.json`
    
5. Visualizing `merged.json` with [Visualization](https://github.com/MaibornWolff/codecharta/tree/master/visualization)

![CodeMaat CouplingImport Modell](src/codemaat-couplingimport-modell.jpg)


## Example File Content

```
$ cat project.log
[a9829640] Max Mustermann 2018-06-05 Set new logo
  1    1    app/codeCharta.scss
[fc14b1e2] Max Mustermann 2018-06-05 Update cc-label position
  4    2    app/codeCharta.html
  25   15   app/codeCharta.scss
  4    2    app/testVille.html
...
```

```
$ cat coupling.csv
entity,coupled,degree,average-revs
app/codeCharta.html, app/codeCharta.scss, 56, 10
app/testVille.html, app/codeCharta.html, 42, 8
...
```

```
$ cat coupling.json
{
  "projectName": "Sample Project Temporal Coupling",
  "apiVersion": "1.1",
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "children": []
        }
      ]
    }
  ],
  "dependencies": {
    "temporal_coupling": [
      {
        "node": "/app/codeCharta.html",
        "nodeFilename": "codeCharta.html",
        "dependantNode": "/app/codeCharta.scss",
        "dependantNodeFilename": "codeCharta.scss",
        "pairingRate": 56,
        "averageRevs": 10
      },
      {
        "node": "/app/testVille.html",
        "nodeFilename": "testVille.html",
        "dependantNode": "/app/codeCharta.html",
        "dependantNodeFilename": "codeCharta.html",
        "pairingRate": 42,
        "averageRevs": 8
      }
    ]
  }
}
```
