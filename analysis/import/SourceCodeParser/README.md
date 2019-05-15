# Source Code Parser

A parser to generate code metrics from a source code file or a project folder. It generates either a cc.json or a csv file.

## Supported languages
- Java

## Run

The SourceCodeParser can analyze either a single file or a project folder; here are some sample commands: 
```
./ccsh sourcecodeparser src/test/resources -o foo.cc.json
```
or 
```
./ccsh sourcecodeparser src/test/resources/foo.java -o foo.cc.json 
```

## Parameters
- -f, --format=\<outputFormat> (table or json)
- -h, --help 
- -o, --outputFile=\<outputFile> (file to write output to, if empty stdout is used)
- -p, --projectName=\<projectName>

## Sonar Plugins

In order to generate the code metrics, the SourceCodeParser uses Sonar plugins. New languages can be added to the Source code parser by writing a class that extends SonarAnalyzer and incorporate the respective Sonar Plugin.
