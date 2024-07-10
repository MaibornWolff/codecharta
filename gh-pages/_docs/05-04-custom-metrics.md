---
permalink: /docs/custom-metrics/
title: "Using Custom Metrics"
---

The various parsers of the `ccsh` supply a large variety of different metrics out of the box. In case these not match your need, there are two general ways to add new metrics to CodeCharta.

The more 'expensive' way is to add a new importer, generate a new `.cc.json` and then merge that with your existing `.cc.json`. If you are interested in this, please get in contact with us by creating a new [issue](https://github.com/MaibornWolff/codecharta/issues) in GitHub.

However, there is an easier way if your metric data is available in CSV form because we have an importer for such data. All the importer needs is the file name (including path to it to depict the folder structure) and the different metrics. This makes it possible to display various metrics, independently of how they were generated.

# Custom Metric CSV Import

Suppose that you had a file `newmetrics.csv` with the following contents:

```csv
name,Metric1,Metric2
File.js,4,500
service/Service1.ts,40,20
```

You can transform that file into a `.cc.json` with our [CSV Importer]({{site.baseurl}}{% link _docs/04-07-csvimporter.md %}) via command-line:

```
ccsh csvimport newmetrics.csv -o newmetrics.cc.json
```

This will result in a new file called `newmetrics.cc.json` which can be used as is or merged into existing `standardmetrics.cc.json` files. For example to merge this `newmetrics.cc.json` with a file called `standardmetrics.cc.json`, execute:

```
ccsh merge newmetrics.cc.json standardmetrics.cc.json -o mergedmetrics.cc.json
```

Both the `newmetrics.cc.json` and the `standardmetrics.cc.json` files are valid cc.json files that can be used in our visualisation.

If you are interested in how a cc.json file for custom metrics looks like, here is what the `newmetrics.cc.json` looks like:

```json
{
  "projectName": "myproject",
  "apiVersion": "1.1",
  "nodes": [
    {
      "name": "root",
      "type": "Folder",
      "attributes": {},
      "link": "",
      "children": [
        {
          "name": "File.js",
          "type": "File",
          "attributes": { "Metric1": 4.0, "Metric2": 500.0 },
          "link": "",
          "children": []
        },
        {
          "name": "service",
          "type": "Folder",
          "attributes": {},
          "link": "",
          "children": [
            {
              "name": "Service1.ts",
              "type": "File",
              "attributes": { "Metric1": 40.0, "Metric2": 20.0 },
              "link": "",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```
