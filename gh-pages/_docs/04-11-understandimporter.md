---
permalink: /docs/understandimporter
title: "UnderstandImporter"
---

Generates visualisation data from [SciTools Understand](https://scitools.com/features/) through its CSV export functionality.

## Usage

### CSV Import for SciTools Understand

If you have analized your projectBuilder with Understand and exported the metric data to a csv-file, you may call the command

> ccsh understandimport \<path to sourcemonitor csv file>

which prints the visualisation data to stdout.

Currently, UnderstandImporter does only support metrics for files in csv files from Understand.
