package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The language a routine's `LANGUAGE` clause names, before or after its body: only a body in SQL or PL/pgSQL names SQL
 * objects; one in Perl, Python, C or another language is opaque text to the database (`sql.md`, decision 14).
 */
internal object RoutineLanguage {
    private const val LANGUAGE_KEYWORD = "LANGUAGE"
    private const val QUOTES = "'\""
    private val SQL_LANGUAGES = setOf("SQL", "PLPGSQL")

    /** Whether the body of the routine [routine] is written in a language other than SQL, by its `LANGUAGE` clause. */
    fun isForeign(routine: SyntaxNode): Boolean {
        val children = routine.children().toList()
        val clause = children.indexOfFirst { NameTokens.wordOf(it) == LANGUAGE_KEYWORD }
        val language = children.getOrNull(clause + 1)?.takeIf { clause >= 0 } ?: return false
        return NameTokens.wordOf(language).trim { it in QUOTES } !in SQL_LANGUAGES
    }
}
