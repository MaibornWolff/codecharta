package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A grammar that does not fit the tree-sitter core library, so no file of its language can be parsed. Unlike the
 * failure of one file it concerns every file of the language, as a grammar or core library that cannot be loaded at
 * all does, which surfaces as an [UnsatisfiedLinkError].
 */
class GrammarUnavailableException(message: String) : IllegalStateException(message)
