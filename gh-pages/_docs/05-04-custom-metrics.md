---
permalink: /docs/custom-metrics/
title: "Custom Metrics"
---

`ccsh` supplies a lot of metrics out of the box. Should that not match your need there are two general ways to add new metrics to CodeCharta. The more expensive way is to add a new importer, generate a new `.cc.json` and then merge that with your existing `.cc.json`. You should take a look at the [reference]({{site.baseurl}}{% link _docs/07-01-new-to-code.md %}) if you are interested in this.

However, there is an easier way if your metric is available in CSV form because we have an importer for such data.

# Custom Metric CSV Import

Suppose that you had a file `newmetrics.csv` with the following contents:

```csv
name,Metric1,Metric2
File.js,4,500
service/Service1.ts,40,20
```

You can transform that file into a `.cc.json` via command-line:

`ccsh csvimport newmetrics.csv -o newmetrics.cc.json`

This will result in a new file which you can merge into your existing `standardmetrics.cc.json` files via:

`ccsh merge newmetrics.cc.json standardmetrics.cc.json -o mergedmetrics.cc.json`

If you are interested the `newmetrics.cc.json` looks like this:

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
