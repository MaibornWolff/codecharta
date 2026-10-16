---
title: "Domain Language Parser"
---

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *domain vocabulary* of a codebase. It tokenizes identifiers, comments and
string literals across the supported languages, filters out programming-language keywords and technical
stop words, and counts how often each (optionally n-gram) word occurs. The word-frequency data is
written into the reserved cc.json **`domain` lens**, keyed by node id, for every file. Folders carry
no words of their own.

The `domain` lens payload keys its entries under `nodes`:
`{ "nodes": { "<nodeId>": { "words": [{ "text", "frequency", "tfidf"? }, ...] } } }`.
`tfidf` is only present when TF-IDF scoring is enabled and defined; it is rounded to three decimals.

### Supported Languages

Kotlin, Java, TypeScript, JavaScript, Python, C#, Go, C, C++, PHP, Ruby, Swift, Rust, Objective-C, Vue, ABL, shell,
Angular templates (`.html`) and SQL.

An Angular template contributes the identifiers of its bindings, interpolations and control flow blocks, its HTML
comments, its text, and the values of the attributes that hold text a user reads: `title`, `alt`, `placeholder`,
`label`, `aria-label`, `aria-description`, `aria-placeholder` and every attribute whose name ends in `hint`, `label`,
`title`, `text`, `tooltip`, `placeholder`, `description` or `message` (`hoverHint`, `empty-message`). The values of
all other attributes, such as `class`, `style`, `id` or `src`, and `i18n-*` markers are left out. The text of a template
weighs like its identifiers (`--identifier-weight`), because it is what the user reads; `--string-weight=0` still
leaves it out. Every other language keeps the string weight for its strings.

In SQL the keywords, types and built-in functions of every dialect are stop words, and so are the names of the
dialects and database products (`postgres`, `oracle`, `mariadb`, `sqlserver`), the words of the catalog views
(`tables`, `columns`, `objects`, `dba`) and `id`.

### Usage and Parameters

| Parameter                                 | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse                                                                           |
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
| `--identifier-weight=<n>`                 | weight for identifier words (class/function/variable names; default 3)                         |
| `--comment-weight=<n>`                    | weight for words in comments (default 2; 0 leaves comments out)                                |
| `--string-weight=<n>`                     | weight for words in string literals (default 1; 0 leaves strings out)                         |
| `--no-tfidf`                              | disable TF-IDF scoring (enabled by default)                                                     |
| `-h, --help`                              | displays this help and exits                                                                    |

`--limit` is applied per file, so anything that sums the words of a folder afterwards adds up the words
that survived each file's limit, not full corpus totals. Leave it unset when you need exact folder counts.

`--base-file` and `--local-changes` are accepted but have no effect on this parser.

The input may be a folder or a single source file. Either way the surrounding directory defines the
analysis — `.dlcignore`, framework detection and the paths words are keyed by are relative to it. A run
that finds no analysable file fails rather than writing an empty lens.

### Examples

Analyze a project folder and write a compressed cc.json:

```
ccsh domainlanguageparser foo/bar/project -o out.cc.json
```

Keep only the top 25 words per file, ranked by TF-IDF:

```
ccsh domainlanguageparser foo/bar/project --limit=25 --sort-by=TFIDF -o out.cc.json
```

Include bigrams and trigrams and exclude test files:

```
ccsh domainlanguageparser foo/bar/project --ngrams=3 --exclude-tests -o out.cc.json
```

If a project is piped into the DomainLanguageParser, the results and the piped project are merged.
