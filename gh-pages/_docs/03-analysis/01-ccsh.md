---
permalink: /docs/analysis/codecharta-shell
title: "CodeCharta Shell"
redirect_from:
  - /analysis/
toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

While the main purpose of the CodeCharta Shell (ccsh) is to use its various tools to generate metrics from code, it also provides some functionality to help users achieve that, independently of the used tool.

## Installation

### Requirements

- Node **>= 20**
- Java **>= 11**

### npm

To install our CodeCharta Shell we use npm as followed:

```bash
# Install codecharta-analysis globally
$ npm i -g codecharta-analysis
# Check if installation was complete. Some terminals have to be restarted
$ ccsh -h
# done :)!
```

## General usage

After the CodeCharta analysis has been installed, executing `ccsh -h` should show the help where all further are listed. Most often the CodeCharta shell is called with one of its tools to perform different actions. For example `ccsh csvimport example.csv` will use the [CSVImporter]({{site.docs_importer}}/csv) to turn the given csv file into `cc.json` format. More information on how to the CodeCharta Shell can be found in the pages of the individual analysis tools or in our [How-to articles]({{site.docs_how_to}}).

## Interactive Shell

The interactive shell aims to aid users when executing parsers by collecting all needed options and arguments for the corresponding parser.
You can launch the interactive shell by calling `ccsh -i` or `ccsh --interactive`.
There you are asked which parser you want to run and receive questions helping you configure that parser.

Alternatively, you can directly run the interactive dialog for a parser by calling it without arguments, e.g. `ccsh sonarimport`.

In the end, the full command to launch the parser in the configured way is output for future use and the configured parser is executed.

## Parser Suggestions

When launching CodeCharta Shell without any arguments and options, CodeCharta automatically tries to suggest applicable parsers to the user.
To do this, a resource has to be entered which can be a path to a file, folder or an url.
CodeCharta then automatically checks all parsers which support this feature and offers the user to select from a list of all parsers which have been identified as applicable.

After choosing the parsers, a dry run to configure each parser is started using the Interactive Shell.
When all parsers are configured, the user can either manually run the parsers by executing the command output by the Interactive Shell or run them together automatically.
If the latter option is selected, all configured parsers are run in parallel.

If every parser is run successfully, the shell offers the user to merge the result files.
To do that, each parsers result `cc.json` has to be moved into the same folder.

Currently, the following parsers are considered when checking for recommendations:

- GitLogParser
- SVNLogParser
- SonarImporter
- SourceCodeParser
- RawTextParser

## Combining multiple metrics

You can combine multiple metrics into one `.cc.json`. This allows users to analyze a codebase with multiple tools (e.g. the sonarimporter for code metrics like complexity and the gitlogparser for metadata like number of authors) and combine the results in a single file that can be visualized. This is done with the [Merge Filter]({{site.docs_filter}}/merge-filter). Some importers support direct pipe-through, which means you don't need to use the merge filter. If these importers are missing a metric, please take a look at [Custom Metrics]({{site.docs_analysis}}/custom-metrics) and Importer.

## Piped input for filters

Instead of providing a cc.json file as input, a project can also be piped to the filter:

```
cat demo.cc.json | ccsh modify -p=2
```

This behaviour is currently supported by `ccsh modify`, `ccsh merge` and `ccsh edgefilter`

## Validating cc.json files

CodeCharta also provides the `ccsh check` command, which can verify the syntax of a `cc.json` file. This can be useful in case you want to manually create or modify a `cc.json` file. While it is possible, we advise against manually adjusting `cc.json` files. If you want to use metrics that are not available with our tools, it is much easier and safer to create them in CSV format and user our [CSVimporter]({{site.docs_importer}}/csv).
