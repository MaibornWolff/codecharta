package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SymbolLookup
import java.util.concurrent.ConcurrentHashMap

/**
 * Loads the native libraries the bonede jars ship (`lib/<platform>-tree-sitter[-<grammar>].<ext>`): the tree-sitter
 * core and one library per grammar. They stay loaded for the lifetime of the process.
 */
internal object NativeTreeSitter {
    private val libraries = NativeLibraryCache()
    private val grammars = ConcurrentHashMap<GrammarLibrary, FfmGrammar>()

    fun library(baseName: String): SymbolLookup = SymbolLookup.libraryLookup(libraries.unpack(baseName), Arena.global())

    fun grammar(grammarLibrary: GrammarLibrary): FfmGrammar = grammars.computeIfAbsent(grammarLibrary) {
        val library = library("$GRAMMAR_LIBRARY_PREFIX${grammarLibrary.libraryName}")
        val language = TreeSitterApi.language(library, "$GRAMMAR_ENTRY_POINT_PREFIX${grammarLibrary.symbolName}")
        FfmGrammar(language, symbolNames(language))
    }

    private fun symbolNames(language: MemorySegment): Array<String> = Array(TreeSitterApi.languageSymbolCount(language)) { symbol ->
        val name = TreeSitterApi.languageSymbolName(language, symbol.toChar())
        if (name == MemorySegment.NULL) "" else name.reinterpret(Long.MAX_VALUE).getString(0)
    }

    private const val GRAMMAR_LIBRARY_PREFIX = "tree-sitter-"
    private const val GRAMMAR_ENTRY_POINT_PREFIX = "tree_sitter_"
}
