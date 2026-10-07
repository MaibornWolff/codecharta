package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Where a tree-sitter grammar lives: the bundled native library `lib/<platform>-tree-sitter-<libraryName>` and the
 * `tree_sitter_<symbolName>` function it exports.
 */
data class GrammarLibrary(val libraryName: String, val symbolName: String = libraryName)
