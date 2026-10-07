package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.MemorySegment

/** A loaded grammar: its `TSLanguage*` and the name of every symbol, so node types need no native string per lookup. */
internal class FfmGrammar(val language: MemorySegment, private val symbolNames: Array<String>) {
    fun symbolName(symbol: Short): String {
        val index = symbol.toInt() and UNSIGNED_SHORT_MASK
        if (index < symbolNames.size) return symbolNames[index]
        // The builtin error symbols are (TSSymbol)-1 and (TSSymbol)-2 and are not part of the grammar's table.
        return when (index) {
            BUILTIN_SYMBOL_ERROR -> "ERROR"
            BUILTIN_SYMBOL_ERROR_REPEAT -> "_ERROR"
            else -> throw IllegalStateException("Unknown tree-sitter symbol $index")
        }
    }

    companion object {
        private const val UNSIGNED_SHORT_MASK = 0xFFFF
        private const val BUILTIN_SYMBOL_ERROR = 0xFFFF
        private const val BUILTIN_SYMBOL_ERROR_REPEAT = 0xFFFE
    }
}
