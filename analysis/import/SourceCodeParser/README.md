# Source Code Parser

A parser for source code like Java or JavaScript.

## Run

Run `./gradlew build` which will generate our jar. 
Then run either 
```
java -jar build/libs/codecharta-sourcecodeparser-x.xx.x.jar src/test/resources/ --format=table
```
or 
```
java -jar build/libs/codecharta-sourcecodeparser-x.xx.x.jar src/test/resources/ScriptShellSample.java --format=table
```

## Grammars

You can put new grammars into `src/main/antlr` and generate the lexer and parser with `gradlew generateGrammarSource`.

## Architecture

This parser follows the onion/hexagonal architecture. 

## Acknowledgements

Inspired by the [Antlr Mega Tutorial](https://tomassetti.me/antlr-mega-tutorial/#java-setup). 