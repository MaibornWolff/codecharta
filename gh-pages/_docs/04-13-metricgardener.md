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

## Additional Requirements

> Also refer to the [Metric-Gardener GitHub](https://github.com/MaibornWolff/metric-gardener) page, as the requirements can change

If you want to execute the `metric-gardener`, either with your own installation or indirectly through the `ccsh`, you need to install the additional requirements listed below:

### Windows

-   Python
-   C/C++ compiler toolchain (e.g. Visual Studio Build Tools 2022 with "Desktop development with C++")

> You might need to install additional packages to python depending on its version. Please refer to the node-gyp GitHub page for help.

### Unix

-   Python
-   C/C++ compiler toolchain

> Those tools could be an included in your distribution of linux (or your version of MacOS).

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
