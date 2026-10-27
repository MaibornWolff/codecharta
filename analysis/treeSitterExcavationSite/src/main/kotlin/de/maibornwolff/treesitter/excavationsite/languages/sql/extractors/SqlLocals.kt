package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a definition declares for itself only (rule 1 of `sql.md`): parameters, variables, cursors and nested
 * routines of a routine, the loop variable of a `FOR`, common table expressions, the temporary tables a routine creates
 * while it runs, and in a trigger the rows it sees. They hide an object of the same name.
 */
internal object SqlLocals {
    private const val NAME_FIELD = "name"
    private const val PARAMETER = "parameter"
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val COMMON_TABLE_EXPRESSION = "common_table_expression"
    private const val FOR_STATEMENT = "for_statement"
    private const val ROUTINE_BODY = "routine_body"
    private const val ROUTINE_DEFINITION = "routine_definition"
    private const val IDENTIFIER = "identifier"
    private const val OBJECT_NAME = "object_name"
    private const val TABLE_KEYWORD = "TABLE"
    private val TEMPORARY_KEYWORDS = setOf("TEMP", "TEMPORARY")
    private val TRIGGER_ROWS = setOf("inserted", "deleted", "new", "old")

    fun of(definition: SyntaxNode, isTrigger: Boolean): Set<String> {
        val names = HashSet<String>()
        TreeTraversal
            .findAllDescendantsOfType(definition, PARAMETER, VARIABLE_DECLARATION, COMMON_TABLE_EXPRESSION)
            .mapNotNullTo(names) { nameOf(it) }
        TreeTraversal
            .findAllDescendantsOfType(definition, FOR_STATEMENT)
            .mapNotNullTo(names) { loop -> loop.children().firstOrNull { it.type == IDENTIFIER }?.let { comparable(it) } }
        TreeTraversal.findAllDescendantsOfType(definition, ROUTINE_BODY).forEach { body ->
            names += DeclareSection.declaredNames(body)
            names += temporaryTablesOf(body)
            names += body.namedChildren().filter { it.type == ROUTINE_DEFINITION }.mapNotNull { nameOf(it) }
        }
        if (isTrigger) names += TRIGGER_ROWS
        return names
    }

    private fun nameOf(node: SyntaxNode): String? =
        node.getChildByFieldName(NAME_FIELD).orNull()?.let { SqlNames.comparablePartsOf(it).lastOrNull() }

    private fun comparable(token: SyntaxNode): String = SqlNames.comparablePartOf(token.text)

    // CREATE TEMP TABLE scratch, which the grammar leaves as tokens inside a routine body
    private fun temporaryTablesOf(body: SyntaxNode): List<String> {
        val tokens = body.children().toList()
        return tokens.indices
            .filter {
                NameTokens.wordOf(tokens[it]) in TEMPORARY_KEYWORDS &&
                    tokens.getOrNull(it + 1)?.let(NameTokens::wordOf) == TABLE_KEYWORD
            }.mapNotNull { NameTokens.nameAt(tokens, it + 2)?.first?.last() }
    }

    /**
     * The PL/SQL declare section of a routine body: `v NUMBER; CURSOR c IS …; TYPE t IS …;` before its `BEGIN`; a body
     * without `BEGIN` has none.
     */
    object DeclareSection {
        private const val BEGIN = "BEGIN"
        private const val SEPARATOR = ";"
        private val ITEM_STARTS = setOf("IS", "AS", "DECLARE", SEPARATOR)
        private val KEYWORDS_BEFORE_NAME = setOf("CURSOR", "TYPE", "SUBTYPE")

        /** The tokens of each declaration of the section, without the separators. */
        fun items(body: SyntaxNode): List<List<SyntaxNode>> {
            if (body.children().none { NameTokens.wordOf(it) == BEGIN }) return emptyList()
            val items = mutableListOf<List<SyntaxNode>>()
            var current = mutableListOf<SyntaxNode>()
            for (token in body.children()) {
                val word = NameTokens.wordOf(token)
                if (word == BEGIN) break
                if (word in ITEM_STARTS) {
                    if (current.isNotEmpty()) items += current
                    current = mutableListOf()
                } else {
                    current += token
                }
            }
            return items.filter { it.first().type == OBJECT_NAME }
        }

        fun declaredNames(body: SyntaxNode): List<String> =
            items(body).mapNotNull { nameTokenOf(it) }.map { SqlNames.comparablePartsOf(it).last() }

        /** The token that names the declaration: `v` of `v NUMBER`, `c` of `CURSOR c IS`. */
        fun nameTokenOf(item: List<SyntaxNode>): SyntaxNode? {
            val first = item.first()
            val name = if (NameTokens.wordOf(first) in KEYWORDS_BEFORE_NAME) item.getOrNull(1) else first
            return name?.takeIf { it.type == OBJECT_NAME }
        }
    }
}
