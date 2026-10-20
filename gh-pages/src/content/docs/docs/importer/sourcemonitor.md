---
title: "SourceMonitor Importer"
description: "Import the CSV export of SourceMonitor into CodeCharta to map size, complexity and block depth of C, C++, C#, Delphi, Java and VB code."
---

The SourceMonitor importer turns the CSV export of [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) into
a cc.json map. Every file gets SourceMonitor's size, complexity and nesting metrics under CodeCharta's metric names.
Use it when your team already measures C, C++, C#, Delphi, HTML, Java, VB.NET or Visual Basic 6 code with
SourceMonitor.

## Quick start

1. In SourceMonitor, export the file metrics of your project (not the method metrics) as CSV.
2. Import the CSV:

   ```bash
   ccsh sourcemonitorimport sourcemonitor.csv -o sourcemonitor.cc.json
   ```

## Options

| Option                           | Description                                |
| -------------------------------- | ------------------------------------------ |
| `FILE...`                        | one or more SourceMonitor CSV exports      |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file    |
| `-h, --help`                     | show the help and exit                     |

```text
Usage: ccsh sourcemonitorimport [-h] [-nc] [-o=<outputFile>] FILE...
```

## Metrics

The `File Name` column gives the path of each file, with `\` between folders. These columns get a CodeCharta name:

| Metric                            | SourceMonitor column               | Description                                            |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `loc`                             | `Lines`                            | all lines, including empty lines and comments          |
| `rloc`                            | `Statements`                       | number of statements                                   |
| `classes`                         | `Classes and Interfaces`           | number of classes and interfaces                       |
| `functions_per_class`             | `Methods per Class`                | average number of methods per class                    |
| `average_statements_per_function` | `Average Statements per Method`    | average number of statements per method                |
| `max_function_complexity`         | `Maximum Complexity*`              | highest cyclomatic complexity of a method in the file  |
| `average_function_complexity`     | `Average Complexity*`              | average cyclomatic complexity of the methods           |
| `max_block_depth`                 | `Maximum Block Depth`              | deepest nesting of blocks                              |
| `average_block_depth`             | `Average Block Depth`              | average nesting of blocks                              |
| `statements_at_level_0` to `_9`   | `Statements at block level 0` to `9` | number of statements at each nesting level           |

Every other numeric column keeps its name in lower case, with `_` for spaces and the prefix `sm_`, for example
`sm_percent_branch_statements`, `sm_method_call_statements` and `sm_percent_lines_with_comments`. The project name,
checkpoint, date and the line numbers and names of the most complex method and the deepest block are left out.

## Related

- [CSV Importer](/docs/importer/csv): import CSV files of any other tool
- [Merge Filter](/docs/filter/merge-filter): combine the SourceMonitor metrics with other maps
