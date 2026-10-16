# Domain Language Parser

**Category**: Parser (takes in source code and outputs cc.json)

This parser extracts the *domain vocabulary* of a codebase: it tokenizes identifiers, comments and
string literals across the supported languages, filters out programming-language keywords and
technical stop words, and counts how often each (optionally n-gram) word occurs. The resulting
word-frequency data is written into the reserved cc.json 2.0 **`domain` lens**, keyed by node id, for
every file. Folders carry no entry of their own: a reader sums the files beneath one, which keeps a
project from repeating its whole vocabulary on every level of the tree.

The `domain` lens payload keys its entries under `nodes`:
`{ "nodes": { "<nodeId>": { "words": [{ "text", "frequency", "tfidf"? }, ...] } } }`.
`tfidf` is only present when TF-IDF scoring is enabled and defined.

## Supported Languages

Kotlin, Java, TypeScript, JavaScript, Python, C#, Go, C, C++, PHP, Ruby, Swift, Rust, Objective-C, Vue, ABL, shell,
Angular templates (`.html`) and SQL.

An Angular template contributes the identifiers of its bindings, interpolations and control flow blocks, but not the
names Angular gives (pipe names, `@defer` triggers, the `index` or `trackBy` of `*ngFor`), its HTML
comments, its text, and the values of the attributes that hold text a user reads: `title`, `alt`, `placeholder`,
`label`, `aria-label`, `aria-description`, `aria-placeholder` and every attribute whose last word, after a hyphen or
at a capital letter, is `hint`, `label`, `title`, `text`, `tooltip`, `placeholder`, `description` or `message`
(`hoverHint`, `empty-message`, but not `context`). The values of
all other attributes, such as `class`, `style`, `id` or `src`, and `i18n-*` markers are left out. The text of a template
and the values of its user-facing attributes weigh like its identifiers, with `--identifier-weight`, because they are
what the user reads; `--string-weight=0` does not leave them out. The string literals of its expressions, such as
`'crimson'` in `class="{{ hurt ? 'crimson' : 'calm' }}"`, keep the string weight, like the strings of every other
language. The inline `template` of a `@Component` in a `.ts` file is read the same way and counts for the `.ts` file.
Every `.html` file is read as an Angular template, by this parser as by `unifiedparser` and `dependencyparser`; exclude
the `.html` files that are no templates of an Angular application, such as reports or documentation, with `-e`.

In SQL the types, built-in functions and system schemas of every dialect are stop words (`varchar`, `coalesce`,
`dbo`), and so are the names of the dialects and database products (`postgres`, `oracle`, `mariadb`, `sqlserver`)
and `id`. Its keywords are not: a keyword never comes out as a word, and one that is an English word (`order`,
`group`, `transaction`) names the domain in a name or a comment.

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
| `--no-technical-stopwords`                | disable filtering of common technical words (e.g. `test`, `util`, `handler`)                  |
| `--identifier-weight=<n>`                 | weight for identifier words (class/function/variable names) and template text (default 3)     |
| `--comment-weight=<n>`                    | weight for words in comments (default 2; 0 leaves comments out)                                |
| `--string-weight=<n>`                     | weight for words in string literals (default 1; 0 leaves strings out)                         |
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

> `-e/--exclude` and `-ibf/--include-build-folders` work as in every other parser: exclude patterns are
> matched against the path inside the project, and the common build folders are skipped as a fallback
> when the project has no root `.gitignore`. `-bf/--base-file` and `--local-changes` are inherited from
> the common analyser parameters but do not affect domain-vocabulary analysis and are ignored.

