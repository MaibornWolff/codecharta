package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax

/**
 * Export macros between `class`, `struct` or `union` and the name of a class with a body (`class LIB_EXPORT Widget {`,
 * `struct API Centaur final : Creature {`): the grammar does not expand macros and reads such a class as a function,
 * so each macro becomes spaces, as the compiler sees nothing or an attribute there (`cpp.md`, decision 15). A macro is
 * an upper-case name, which keeps `struct timeval tv{};` a variable.
 */
internal object CppExportMacros {
    private val EXPORT_MACROS = Regex(
        """\b(?:class|struct|union)\s+((?:[A-Z][A-Z0-9_]*\s+)+)(?!final\b)[A-Za-z_]\w*\s*(?:final\b\s*)?[:{]"""
    )

    fun blank(content: String): String {
        val macros = EXPORT_MACROS.findAll(content).mapNotNull { it.groups[1]?.range }.toList()
        if (macros.isEmpty()) return content
        val blanked = StringBuilder(content)
        macros.forEach { range -> range.forEach { index -> if (!blanked[index].isWhitespace()) blanked.setCharAt(index, ' ') } }
        return blanked.toString()
    }
}
