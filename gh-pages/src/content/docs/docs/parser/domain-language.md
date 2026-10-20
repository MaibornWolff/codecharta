---
title: "Domain Language Parser"
description: "Extract the domain vocabulary of a codebase from identifiers, comments and strings with ccsh domainlanguageparser and explore it in the Domain view."
sidebar:
  label: "Domain Language"
---

The Domain Language Parser extracts the domain vocabulary of a codebase: the words its identifiers, comments and
string literals use, without the keywords of the language and common technical words. You see which parts of the
code talk about orders, invoices or patients, and where the names drift apart. The visualization shows the words in
its [Domain view](/docs/visualization/user-controls/domain-view).

## Quick start

```bash
ccsh domainlanguageparser path/to/project -o domain.cc.json
```

This writes `domain.cc.json.gz`.

## Options

| Parameter                                 | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument |
| `-o, --output-file=<outputFile>`          | output file (or empty for stdout)                                                              |
| `-nc, --not-compressed`                   | save uncompressed output file                                                                  |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: all supported)     |
| `-e, --exclude=<patterns>`                | comma-separated list of regex patterns to exclude files/folders                                |
| `-ibf, --include-build-folders`           | include build and common resource folders                                                      |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion                                              |
| `--commit=<ref>`                          | analyze the codebase at a specific git commit/tag/branch (creates a temporary worktree). See [Commit-Based Analysis](/docs/analysis/commit-analysis) |
| `--verbose`                               | verbose mode                                                                                   |
| `--exclude-tests`                         | exclude test files from the analysis (test files are included by default)                     |
| `--ngrams=<ngrams>`                       | generate n-grams up to size N (1=words, 2=bigrams, 3=trigrams; default 1)                      |
| `--no-ssr`                                | disable Statistical Substring Reduction for n-grams (enabled by default when `--ngrams` > 1)   |
| `--limit=<limit>`                         | limit each file to its top X words (all words if not set)                                      |
| `--sort-by=<FREQUENCY\|TFIDF>`            | sort words by frequency (default) or TF-IDF score                                              |
| `--stop-word-level=<MINIMAL\|MODERATE\|AGGRESSIVE>` | technical stop word filtering level (default MODERATE)                               |
| `--no-technical-stopwords`                | disable filtering of common technical words (e.g. `test`, `util`, `handler`)                  |
| `--identifier-weight=<n>`                 | weight for identifier words (class/function/variable names) and template text (default 3)     |
| `--comment-weight=<n>`                    | weight for words in comments (default 2; 0 leaves comments out)                                |
| `--string-weight=<n>`                     | weight for words in string literals (default 1; 0 leaves strings out)                         |
| `--no-tfidf`                              | disable TF-IDF scoring (enabled by default)                                                     |
| `-h, --help`                              | displays this help and exits                                                                    |

`--limit` is applied per file, so anything that sums the words of a folder afterwards adds up the words that
survived each file's limit, not full corpus totals. Leave it unset when you need exact folder counts.

`--base-file` and `--local-changes` are accepted but have no effect on this parser.

## What it writes

The parser counts how often each word, or n-gram with `--ngrams`, occurs per file, weighted by where it stands, and
writes the counts into the `domain` lens of the cc.json file. Folders carry no words of their own. The lens keys
its entries by node id under `nodes`:

```json
{ "nodes": { "<nodeId>": { "words": [{ "text": "…", "frequency": 12, "tfidf": 0.418 }] } } }
```

`tfidf` is only present when TF-IDF scoring is on and defined, rounded to three decimals.

## Supported languages

| Language          | File extensions                       |
| ----------------- | ------------------------------------- |
| Kotlin            | .kt, .kts                             |
| TypeScript        | .ts, .tsx, .cts, .mts                 |
| JavaScript        | .js, .jsx, .mjs, .cjs                 |
| Java              | .java                                 |
| Python            | .py, .pyw                             |
| C#                | .cs                                   |
| Go                | .go                                   |
| C                 | .c, .h                                |
| C++               | .cpp, .cc, .cxx, .hpp, .hxx, .h++     |
| PHP               | .php, .phtml                          |
| Ruby              | .rb, .rake, .gemspec                  |
| Swift             | .swift                                |
| Bash              | .sh, .bash, .zsh                      |
| Objective-C       | .m, .mm                               |
| Vue               | .vue                                  |
| ABL (Progress)    | .p, .cls, .w                          |
| Rust              | .rs                                   |
| Angular templates | .html                                 |
| SQL               | .sql, .pks, .pkb, .pls                |

Every `.html` file is read as an Angular template, by this parser as by `unifiedparser` and `dependencyparser`.
Exclude the `.html` files that are no templates of an Angular application, such as reports or documentation, with
`-e`.

### Angular templates

An Angular template contributes:

- the identifiers of its bindings, interpolations and control flow blocks, but not the names Angular gives (pipe
  names, `@defer` triggers, the `index` or `trackBy` of `*ngFor`)
- its HTML comments and its text
- the values of the attributes that hold text a user reads: `title`, `alt`, `placeholder`, `label`, `aria-label`,
  `aria-description`, `aria-placeholder` and every attribute whose last word, after a hyphen or at a capital letter,
  is `hint`, `label`, `title`, `text`, `tooltip`, `placeholder`, `description` or `message` (`hoverHint`,
  `empty-message`, but not `context`)

The values of all other attributes, such as `class`, `style`, `id` or `src`, and `i18n-*` markers are left out.

The text and the user-facing attribute values weigh like identifiers, with `--identifier-weight`, because they are
what the user reads; `--string-weight=0` does not leave them out. The string literals of its expressions, such as
`'crimson'` in `class="{{ hurt ? 'crimson' : 'calm' }}"`, keep the string weight, like the strings of every other
language.

An HTML entity stands for its letter where it is a numeric one of a letter or a named one of a Latin-1 letter
(`H&ouml;hle` is `Höhle`). Any other entity, such as `&nbsp;`, `&mdash;` or a letter beyond Latin-1 written by name,
separates words.

The inline `template` of a `@Component` in a `.ts` file is read the same way and counts for the `.ts` file.

### SQL

In SQL the types, built-in functions and system schemas of every dialect are stop words (`varchar`, `coalesce`,
`dbo`), and so are the names of the dialects and database products (`postgres`, `oracle`, `mariadb`, `sqlserver`)
and `id`. Its keywords are not: a keyword never comes out as a word, and one that is an English word (`order`,
`group`, `transaction`) names the domain in a name or a comment.

## Input and stop words

The input may be a folder or a single source file. Either way the surrounding folder defines the analysis: the
`.dlcignore` file, the framework detection and the paths the words are keyed by are relative to it. A run that finds
no analysable file fails rather than writing an empty lens. See also
[files a parser cannot analyse](/docs/analysis/codecharta-shell#files-a-parser-cannot-analyse).

To drop project-specific noise words, such as product names, put them in a `.dlcignore` file in that folder: one
word per line, case-insensitive, with `#` starting a comment line.

## Examples

```bash
ccsh domainlanguageparser foo/bar/project --limit=25 --sort-by=TFIDF -o out.cc.json   # top 25 words per file by TF-IDF
ccsh domainlanguageparser foo/bar/project --ngrams=3 --exclude-tests -o out.cc.json   # bigrams and trigrams, no tests
```

To add the domain lens to another map, pipe it in and pass `-` as an extra argument:

```bash
ccsh unifiedparser foo/bar/project | ccsh domainlanguageparser foo/bar/project - -o out.cc.json
```

## Related

- [Domain view](/docs/visualization/user-controls/domain-view)
- [Analyse a project in one step](/docs/analysis/analyse)
