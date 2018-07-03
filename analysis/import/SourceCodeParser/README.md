# OOParser

A parser for object-oriented languages like Java or JavaScript.

## Grammars

You can put new grammars into `src/main/antlr` and generate the lexer and parser with `gradlew generateGrammarSource`.
After generating a new grammer you need to manually add antlr to the generated files classpath. 
In IntelliJ you can do that by opening one of the generated files, JavaLexer for example. 
A couple of stuff will be red, so you then add antlr.v4 library to classpath.
Afterwards you open code that depends on the generated sources (main and test) and add dependency on jarser_generated module.

## Intermediate Model

The idea is to be able to transform any language into a very simple intermediate model.
Each line in the original source gets a tag reffering to the place in the intermediate model. 
F.ex. if the line contains a function, if it's a comment or what the nesting level is+the containing block.

## Acknowledgements

Based on the [Antlr Mega Tutorial](https://tomassetti.me/antlr-mega-tutorial/#java-setup). 

https://theendian.com/blog/antlr-4-lexer-parser-and-listener-with-example-grammar/
https://jakubdziworski.github.io/java/2016/04/01/antlr_visitor_vs_listener.html