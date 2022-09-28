---
permalink: /docs/metricgardener-importer
title: "MetricGardener Importer"
---

This importer allows to use metrics calculated by [MetricGardener](https://github.com/MaibornWolff/metric-gardener), a
multi-language code parser based on [tree-sitter](https://github.com/tree-sitter/tree-sitter). The importer can be used
to parse files locally or to just import a MetricGardener.json file and convert it into a regular CodeCharta.cc.json
file.

For more information on MetricGardener, like the supported languages, and command line options, refer to its
[README](https://github.com/MaibornWolff/metric-gardener#readme).

> Please note: MetricGardener is currently only compatible with NodeJS up to version 16.x. If you use NodeJS 18.x, you
> need to install version 16.x to use MetricGardener.

## Supported Metrics

-   mcc
-   functions
-   classes
-   lines_of_code
-   comment_lines
-   real_lines_of_code

## Usage of the MetricGardener Importer

| Parameter                       | description                                      |
| ------------------------------- | ------------------------------------------------ |
| `FOLDER or FILE`                | path for project folder or code file             |
| `-j, --is-json-file`            | Input file is already a MetricGardener JSON file |
| `-h, --help`                    | displays help                                    |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)                |
| `-nc, --not-compressed`         | save uncompressed output File                    |

```
    ccsh metricgardenerimport [-nc] [-o=<outputFile>] [-j] FOLDER or FILE
```

## Examples

### Create a CodeCharta json file from local source code (metric-gardener is executed internally on the fly):

```
ccsh metricgardenerimport /path/to/source/code -o outfile.cc.json
```

### Create a CodeCharta json file by importing a given metric-gardener json file (run MetricGardener yourself):

For this MetricGardener needs to be installed on your system. Install it with `npm i -g metric-gardener`

```
npx metric-gardener parse /path/to/source/code -o mg_results.json
ccsh metricgardenerimport mg_results.json --is-json-file -o outfile.cc.json
```
