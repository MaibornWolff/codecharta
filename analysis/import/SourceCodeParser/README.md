# Source Code Parser

A parser to generate code metrics from a source code file or a project folder. It generates either a cc.json or a csv file.

## Supported languages

- Java

## Supported Metrics

- rloc: Real lines of code
- classes
- functions
- statements
- comment_lines
- mcc: McCabe Complexity / Cyclomatic complexity
- cognitive_complexity
- commented_out_code_blocks
- max_nesting_level
- code_smell
- security_hotspot
- vulnerability
- bug
- sonar_issue_other

## Run

The SourceCodeParser can analyze either a single file or a project folder; here are some sample commands:

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json
```

or

```
./ccsh sourcecodeparser src/test/resources/foo.java -o foo.cc.json
```

or

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json --defaultExcludes -e=something -e=/.*\.foo --f=table
```

or

```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json --f=table -i
```

## Parameters

- --defaultExcludes (exclude build, target, dist and out folders as well as files/folders starting with '.')
- -e, --exclude=\<excludePattern> (exclude file/folder from scan according to regex pattern)
- -f, --format=\<outputFormat> (table or json)
- -h, --help
- -i, --noIssues (do not search for sonar issues)
- -o, --outputFile=\<outputFile> (file to write output to, if empty stdout is used)
- -p, --projectName=\<projectName>
- -v, --verbose

## Sonar Plugins

In order to generate the code metrics, the SourceCodeParser uses Sonar plugins. New languages can be added to the Source code parser by writing a class that extends SonarAnalyzer and incorporate the respective Sonar Plugin.
