---
permalink: /docs/parser/unified
title: "Unified Parser"
redirect_from:
  - /parser/

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

**Category**: Parser (takes in source code and outputs cc.json)

The Unified Parser is parser to generate code metrics from a source code file or a project folder without relying on tools other than
CodeCharta. It generates either a cc.json or a csv file.

## Supported Languages

| Language   | Supported file extensions              |
|------------|----------------------------------------|
| Javascript | .js, .cjs, .mjs                        |
| Typescript | .ts, .cts, .mts                        |
| Java       | .java                                  |
| Kotlin     | .kt                                    |
| C#         | .cs                                    |
| C++        | .cpp, .cc, .cxx, .c++, .hh, .hpp, .hxx |
| C          | .c, .h                                 |
| Python     | .py                                    |
| Go         | .go                                    |
| PHP        | .php                                   |
| Ruby       | .rb                                    |
| Bash       | .sh                                    |

## Supported Metrics

| Metric                    | Description                                                                                                                                                                                                                |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Complexity                | Complexity of the file based on the number of paths through the code. Also includes complexity introduced by definition of functions, classes, etc. (Represents the 'cognitive load' necessary to overlook the whole file) |
| Logic Complexity          | Complexity of the file based on number of paths through the code, similar to cyclomatic complexity (only counts complexity in code, not complexity introduced by definition of functions, classes, etc.)                   |
| Comment lines             | The number of comment lines found in a file                                                                                                                                                                                |
| Number of functions       | The number of functions and methods in a file                                                                                                                                                                              |
| Lines of code (LOC)       | Lines of code including empty lines and comments                                                                                                                                                                           |
| Real lines of code (RLOC) | Number of lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment                                                                                                   |

Some metrics are calculated on a per-function basis rather than per-file. Each of these metrics has max, min, mean and median values for each file.

| Metric per function     | Description                                          |
|-------------------------|------------------------------------------------------|
| Parameters per function | The number of parameters for each function           |
| Complexity per function | The complexity inside the body of a function         |
| RLOC per function       | The real lines of code inside the body of a function |


## Usage and Parameters

| Parameter                                 | Description                                                                                                                                       |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `FOLDER or FILE`                          | The project folder or code file to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument     |
| `-bf, --base-file=<baseFile>`             | base cc.json file with checksums to skip unchanged files during analysis                                                                          |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion (uses regex-based exclusion of common build folders)                                            |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders (applied in addition to .gitignore patterns)                                      |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)                                                                  |
| `-h, --help`                              | displays this help and exits                                                                                                                      |
| `-ibf, --include-build-folders`           | include build folders (out, build, dist and target) and common resource folders (e.g. resources, node_modules or files/folders starting with '.') |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                                                                     |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                                                                                 |
| `--verbose`                               | displays messages about parsed and ignored files                                                                                                  |

```
Usage: ccsh unifiedparser [-h] [--bypass-gitignore] [-ibf] [-nc] [--verbose]
                          [-bf=<baseFile>] [-o=<outputFile>]
                          [-e=<specifiedExcludePatterns>]...
                          [-fe=<fileExtensionsToAnalyse>]... FILE or FOLDER...
```

## Examples

The Unified Parser can analyze either a single file or a project folder; here are some sample commands:

```
ccsh unifiedparser src/test/resources -o foo.cc.json
```

```
ccsh unifiedparser src/test/resources/foo.ts -o foo.cc.json
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json -nc --verbose
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json --include-build-folders -e=something -e=/.*\.foo
```

```
ccsh unifiedparser src/test/resources -o foo.cc.json --bypass-gitignore
```

If a project is piped into the UnifiedParser, the results and the piped project are merged.
The resulting project has the project name specified for the UnifiedParser.

```
cat pipeInput.cc.json | ccsh unifiedparser src/test/resources - -o merged.cc.json
```

## Known issues

- In ruby the 'lambda' keyword is not counted correctly for complexity and number of functions


## Detailed Metric Calculation

This section describes what is counted for each metric per language. The parser uses Tree-sitter to parse source code and identifies
specific AST node types for each metric.

### Complexity

Complexity is calculated using McCabe Complexity, counting the number of paths through the code. Each language has specific constructs that
contribute to complexity:

#### JavaScript (.js, .cjs, .mjs)

- **Control flow**: `if_statement`, `do_statement`, `for_statement`, `while_statement`, `for_in_statement`, `ternary_expression`,
  `switch_case`, `switch_default`, `catch_clause`
- **Functions**: `function_declaration`, `generator_function_declaration`, `arrow_function`, `generator_function`, `method_definition`,
  `class_static_block`, `function_expression`
- **Logical operators**: `&&`, `||`, `??` in binary expressions

#### TypeScript (.ts, .cts, .mts)

- **Control flow**: `if_statement`, `do_statement`, `for_statement`, `while_statement`, `for_in_statement`, `ternary_expression`,
  `conditional_type`, `switch_case`, `switch_default`, `catch_clause`
- **Functions**: `function_declaration`, `generator_function_declaration`, `arrow_function`, `generator_function`, `method_definition`,
  `class_static_block`, `function_expression`
- **Logical operators**: `&&`, `||`, `??` in binary expressions

#### Java (.java)

- **Control flow**: `if_statement`, `do_statement`, `for_statement`, `while_statement`, `enhanced_for_statement`, `ternary_expression`,
  `switch_label`, `catch_clause`
- **Functions**: `constructor_declaration`, `method_declaration`, `lambda_expression`, `static_initializer`,
  `compact_constructor_declaration`
- **Logical operators**: `&&`, `||` in binary expressions

#### Kotlin (.kt)

- **Control flow**: `if_expression`, `for_statement`, `while_statement`, `do_while_statement`, `elvis_expression`, `conjunction_expression`,
  `disjunction_expression`, `when_entry`, `catch_block`
- **Functions**: `function_declaration`, `anonymous_function`, `anonymous_initializer`, `lambda_literal`, `secondary_constructor`, `setter`,
  `getter`

#### C# (.cs)

- **Control flow**: `if_statement`, `do_statement`, `foreach_statement`, `for_statement`, `while_statement`, `conditional_expression`,
  `is_expression`, `and_pattern`, `or_pattern`, `switch_section`, `switch_expression_arm`, `catch_clause`
- **Functions**: `constructor_declaration`, `method_declaration`, `lambda_expression`, `local_function_statement`, `accessor_declaration`
- **Logical operators**: `&&`, `||`, `??` in binary expressions

#### C++ (.cpp, .cc, .cxx, .c++, .hh, .hpp, .hxx)

- **Control flow**: `if_statement`, `do_statement`, `for_statement`, `while_statement`, `for_range_loop`, `conditional_expression`,
  `case_statement`, `catch_clause`, `seh_except_clause`
- **Functions**: `lambda_expression`, `function_definition`, `abstract_function_declarator`, `function_declarator`
- **Logical operators**: `&&`, `||`, `and`, `or`, `xor` in binary expressions

#### C (.c, .h)

- **Control flow**: `if_statement`, `do_statement`, `for_statement`, `while_statement`, `conditional_expression`, `case_statement`,
  `seh_except_clause`
- **Functions**: `function_definition`, `abstract_function_declarator`, `function_declarator`
- **Logical operators**: `&&`, `||` in binary expressions

#### Python (.py)

- **Control flow**: `if_statement`, `elif_clause`, `if_clause`, `for_statement`, `while_statement`, `for_in_clause`,
  `conditional_expression`, `list`, `boolean_operator`, `case_pattern`, `except_clause`
- **Functions**: `function_definition`, lambda expressions (with specific nesting rules)

#### Go (.go)

- **Control flow**: `if_statement`, `for_statement`, `communication_case`, `expression_case`, `type_case`, `default_case`
- **Functions**: `method_declaration`, `func_literal`, `function_declaration`, `method_spec`
- **Logical operators**: `&&`, `||` in binary expressions

#### PHP (.php)

- **Control flow**: `if_statement`, `else_if_clause`, `do_statement`, `for_statement`, `while_statement`, `foreach_statement`,
  `conditional_expression`, `case_statement`, `default_statement`, `match_conditional_expression`, `match_default_expression`,
  `catch_clause`
- **Functions**: `method_declaration`, `lambda_expression`, `arrow_function`, `anonymous_function`, `function_definition`,
  `function_static_declaration`
- **Logical operators**: `&&`, `||`, `??`, `and`, `or`, `xor` in binary expressions

#### Ruby (.rb)

- **Control flow**: `if`, `elsif`, `for`, `until`, `while`, `do_block`, `when`, `else`, `rescue`
- **Functions**: `lambda`, `method`, `singleton_method`
- **Logical operators**: `&&`, `||`, `and`, `or` in binary expressions

#### Bash (.sh)

- **Control flow**: `if_statement`, `elif_clause`, `for_statement`, `while_statement`, `c_style_for_statement`, `ternary_expression`,
  `list`, `case_item`
- **Functions**: `function_definition`
- **Logical operators**: `&&`, `||` in binary expressions

### Comment Lines

Comment lines are counted based on language-specific comment syntax:

- **JavaScript/TypeScript**: `comment`, `html_comment`
- **Java**: `block_comment`, `line_comment`
- **Kotlin**: `line_comment`, `multiline_comment`
- **C#**: `comment`
- **C/C++**: `comment`
- **Python**: `comment` and unassigned string literals (used as block comments)
- **Go**: `comment`
- **PHP**: `comment`
- **Ruby**: `comment`
- **Bash**: `comment`

### Number of Functions

Function counting identifies different types of function definitions per language:

#### JavaScript (.js, .cjs, .mjs)

- **Simple functions**: `function_declaration`, `generator_function_declaration`, `method_definition`, `function_expression`
- **Arrow functions**: Assigned to variables (detected via `variable_declarator` with `arrow_function` value)

#### TypeScript (.ts, .cts, .mts)

- **Simple functions**: `function_declaration`, `generator_function_declaration`, `method_definition`, `function_expression`
- **Arrow functions**: Assigned to variables (detected via `variable_declarator` with `arrow_function` value)

#### Java (.java)

- **Methods and constructors**: `method_declaration`, `constructor_declaration`, `compact_constructor_declaration`
- **Lambda expressions**: Assigned to variables (detected via `variable_declarator` with `lambda_expression` value)

#### Kotlin (.kt)

- **Simple functions**: `secondary_constructor`, `setter`, `getter`
- **Complex functions**: Property declarations with lambda literals, anonymous functions, or initializers; function declarations with
  function bodies

#### C# (.cs)

- **Methods and constructors**: `constructor_declaration`, `method_declaration`, `local_function_statement`, `accessor_declaration`
- **Lambda expressions**: Assigned to variables (detected via `variable_declarator` with `lambda_expression` value)

#### C++ (.cpp, .cc, .cxx, .c++, .hh, .hpp, .hxx)

- **Functions**: `function_definition`
- **Lambda expressions**: Assigned to variables (detected via `init_declarator` with `lambda_expression` value)

#### C (.c, .h)

- **Functions**: `function_definition`

#### Python (.py)

- **Functions**: `function_definition`
- **Lambda expressions**: Assigned to variables (detected via assignment with lambda value)

#### Go (.go)

- **Functions**: `method_declaration`, `func_literal`, `function_declaration`, `method_spec`

#### PHP (.php)

- **Simple functions**: `method_declaration`, `function_definition`, `function_static_declaration`
- **Anonymous functions**: Assigned to variables (detected via `assignment_expression` with `anonymous_function`, `arrow_function`, or
  `lambda_expression` value)

#### Ruby (.rb)

- **Methods**: `method`, `singleton_method`
- **Lambda expressions**: Assigned to variables (detected via assignment with lambda value)

#### Bash (.sh)

- **Functions**: `function_definition`

### Lines of Code (LOC)

LOC is calculated as the total number of lines in the file, including empty lines and comments. This metric is language-independent and
simply counts from the first line to the last line of the file.

### Real Lines of Code (RLOC)

RLOC counts only lines that contain actual code, excluding:

- Empty lines (whitespace only)
- Comment-only lines
- Lines that are part of multi-line comments

This metric is calculated by counting all lines that are not identified as comment nodes by the Tree-sitter parser for each language.
