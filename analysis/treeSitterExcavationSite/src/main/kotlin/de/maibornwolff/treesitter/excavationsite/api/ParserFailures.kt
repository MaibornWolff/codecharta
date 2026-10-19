package de.maibornwolff.treesitter.excavationsite.api

/**
 * Whether a failure concerns every file of a language or of all languages rather than the file being parsed: a grammar
 * that does not fit the tree-sitter core library, or a native library that cannot be loaded. Such a failure ends an
 * analysis instead of skipping one file.
 */
fun isUnusableParser(failure: Throwable): Boolean = failure is GrammarUnavailableException || failure is LinkageError
