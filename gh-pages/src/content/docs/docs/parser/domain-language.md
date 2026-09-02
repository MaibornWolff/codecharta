---
title: "Domain Language Parser"
---

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *domain vocabulary* of a codebase. It tokenizes identifiers, comments and
string literals across the supported languages, filters out programming-language keywords and technical
stop words, and counts how often each (optionally n-gram) word occurs. The word-frequency data is
written into the reserved cc.json 2.0 **`domain` lens**, keyed by node id, for every file and
aggregated for every folder (and the project root).

The `domain` lens payload keys its entries under `nodes`:
`{ "nodes": { "<nodeId>": { "words": [{ "text", "frequency", "tfidf"? }, ...] } } }`.
`tfidf` is only present when TF-IDF scoring is enabled and defined.

### Supported Languages

Kotlin, Java, TypeScript, JavaScript, Python, C#, Go, C, C++, PHP, Ruby, Swift, Rust, Objective-C, Vue, ABL and shell.

### Usage and Parameters

| Parameter                                 | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse                                                                           |
| `-o, --output-file=<outputFile>`          | output file (or empty for stdout)                                                              |
| `-nc, --not-compressed`                   | save uncompressed output file                                                                  |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion                                              |
| `--verbose`                               | verbose mode (also shows an analysis progress bar)                                             |
| `--exclude-tests`                         | exclude test files from the analysis (test files are included by default)                     |
| `--ngrams=<ngrams>`                       | generate n-grams up to size N (1=words, 2=bigrams, 3=trigrams; default 1)                      |
| `--no-ssr`                                | disable Statistical Substring Reduction for n-grams (enabled by default when `--ngrams` > 1)   |
| `--limit=<limit>`                         | limit each node to its top X words (all words if not set)                                      |
| `--sort-by=<FREQUENCY\|TFIDF>`            | sort words by frequency (default) or TF-IDF score                                              |
| `--stop-word-level=<MINIMAL\|MODERATE\|AGGRESSIVE>` | technical stop word filtering level (default MODERATE)                               |
| `--no-technical-stopwords`                | disable filtering of common technical words (e.g. `test`, `util`, `handler`)                  |
| `--identifier-weight=<n>`                 | weight for identifier words (class/function/variable names; default 3)                         |
| `--comment-weight=<n>`                    | weight for words in comments (default 2)                                                        |
| `--string-weight=<n>`                     | weight for words in string literals (default 1)                                                |
| `--no-tfidf`                              | disable TF-IDF scoring (enabled by default)                                                     |
| `-h, --help`                              | displays this help and exits                                                                    |

The input may be a folder or a single source file. Either way the surrounding directory defines the
analysis — `.dlcignore`, framework detection and the paths words are keyed by are relative to it. A run
that finds no analysable file fails rather than writing an empty lens.

### Examples

Analyze a project folder and write a compressed cc.json:

```
ccsh domainlanguageparser foo/bar/project -o out.cc.json
```

Keep only the top 25 words per node, ranked by TF-IDF:

```
ccsh domainlanguageparser foo/bar/project --limit=25 --sort-by=TFIDF -o out.cc.json
```

Include bigrams and trigrams and exclude test files:

```
ccsh domainlanguageparser foo/bar/project --ngrams=3 --exclude-tests -o out.cc.json
```

If a project is piped into the DomainLanguageParser, the results and the piped project are merged.
