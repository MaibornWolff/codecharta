package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObject
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlScript
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlStatements
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Reads what a SQL file creates, changes and names, statement by statement (`sql.md`): the definitions the grammar
 * names ([DefinitionReader]), the statements it leaves as tokens ([StatementReader]), and the default schema that
 * `SET search_path` and `ALTER SESSION SET CURRENT_SCHEMA` set for the statements after them.
 */
internal object ScriptReader {
    fun read(root: SyntaxNode): SqlScript {
        val reading = ScriptReading()
        root.children().forEach { reading.accept(it) }
        reading.flush()
        return SqlScript(reading.objects, reading.statements)
    }
}

private class ScriptReading {
    val objects = mutableListOf<SqlObject>()
    val statements = mutableListOf<SqlStatements>()
    private var defaultSchema: String? = null
    private val pending = mutableListOf<SyntaxNode>()

    fun accept(node: SyntaxNode) {
        when {
            node.type in TERMINATORS -> flush()
            DefinitionReader.isDefinition(node) -> {
                flush()
                DefinitionReader.read(node, defaultSchema)?.let { objects += it }
            }
            NameTokens.wordOf(node) in STATEMENT_STARTS && node.type == NameTokens.wordOf(node) -> {
                flush()
                pending += node
            }
            else -> pending += node
        }
    }

    fun flush() {
        if (pending.isEmpty()) return
        val tokens = pending.toList()
        pending.clear()
        val schema = StatementReader.schemaSetBy(tokens)
        if (schema != null) {
            defaultSchema = schema
            return
        }
        val changedOrCreated = StatementReader.objectOf(tokens, defaultSchema)
        if (changedOrCreated != null) objects += changedOrCreated else addNamesOf(tokens)
    }

    private fun addNamesOf(tokens: List<SyntaxNode>) {
        val names = SqlNameCollector(commonTableExpressionsOf(tokens), inPackage = false).namesOfTokens(tokens)
        if (names.isEmpty()) return
        val last = statements.lastOrNull()
        if (last != null && last.defaultSchema == defaultSchema) {
            statements[statements.lastIndex] = last.copy(names = (last.names + names).distinct())
        } else {
            statements += SqlStatements(defaultSchema, names)
        }
    }

    private fun commonTableExpressionsOf(tokens: List<SyntaxNode>): Set<String> = tokens
        .flatMap { token ->
            listOf(token).filter { it.type == COMMON_TABLE_EXPRESSION } +
                TreeTraversal.findAllDescendantsOfType(token, COMMON_TABLE_EXPRESSION)
        }.mapNotNull { expression -> SqlNames.nameNodeOf(expression)?.let { SqlNames.comparablePartsOf(it).lastOrNull() } }
        .toSet()

    companion object {
        private val TERMINATORS = setOf(";", "slash_terminator", "batch_separator")
        private const val COMMON_TABLE_EXPRESSION = "common_table_expression"

        // T-SQL ends statements without a semicolon, so a statement also ends where one of these keywords starts the next
        private val STATEMENT_STARTS = setOf("CREATE", "ALTER", "COMMENT")
    }
}
