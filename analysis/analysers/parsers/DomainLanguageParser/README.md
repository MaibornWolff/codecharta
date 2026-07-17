# Domain Language Parser

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *domain vocabulary* of a codebase: it tokenizes identifiers, comments and
string literals across the supported languages, filters out programming-language keywords and
technical stop words, and counts how often each (optionally n-gram) word occurs. The resulting
word-frequency data is written into the reserved cc.json 2.0 **`domain` lens**, keyed by node id, for
every file and aggregated for every folder (and the project root).

The `domain` lens payload is a bare map `{ "<nodeId>": [{ "text", "frequency", "tfidf"? }, ...] }`.
`tfidf` is only present when TF-IDF scoring is enabled and defined.

## Supported Languages

Kotlin, Java, TypeScript, JavaScript, Python, C#, Go, C, C++, PHP, Ruby, Swift, Objective-C and shell
(the full set of extensions handled by the underlying tree-sitter analysis).

## Usage and Parameters

| Parameter                                 | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse                                                                           |
| `-o, --output-file=<outputFile>`          | output file (or empty for stdout)                                                              |
| `-nc, --not-compressed`                   | save uncompressed output file                                                                  |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of extensions to analyse only those files (default: all supported)       |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion                                              |
| `--commit=<ref>`                          | analyze the codebase at a specific git commit/tag/branch (creates a temporary worktree)       |
| `--verbose`                               | verbose mode (also shows an analysis progress bar)                                             |
| `--exclude-tests`                         | exclude test files from the analysis (test files are included by default)                     |
| `--ngrams=<ngrams>`                       | generate n-grams up to size N (1=words, 2=bigrams, 3=trigrams; default 1)                      |
| `--no-ssr`                                | disable Statistical Substring Reduction for n-grams (enabled by default when `--ngrams` > 1)   |
| `--limit=<limit>`                         | limit each node to its top X words (all words if not set)                                      |
| `--sort-by=<FREQUENCY\|TFIDF>`            | sort words by frequency (default) or TF-IDF score                                              |
| `--stop-word-level=<MINIMAL\|MODERATE\|AGGRESSIVE>` | technical stop word filtering level (default MODERATE)                               |
| `--exclude-technical-stopwords`           | disable filtering of common technical words (e.g. `test`, `util`, `handler`)                  |
| `--identifier-weight=<n>`                 | weight for identifier words (class/function/variable names; default 3)                         |
| `--comment-weight=<n>`                    | weight for words in comments (default 2)                                                        |
| `--string-weight=<n>`                     | weight for words in string literals (default 1)                                                |
| `--no-tfidf`                              | disable TF-IDF scoring (enabled by default)                                                     |
| `-h, --help`                              | displays this help and exits                                                                    |

## Examples

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

> The infrastructure options `-e/--exclude`, `-bf/--base-file`, `--local-changes` and
> `-ibf/--include-build-folders` are inherited from the common analyser parameters but do not affect
> domain-vocabulary analysis and are ignored.

