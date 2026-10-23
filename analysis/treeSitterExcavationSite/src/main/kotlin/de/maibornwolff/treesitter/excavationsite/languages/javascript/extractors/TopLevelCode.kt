package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The code at the top level of a module outside every declaration, import and export, by decision 3 of
 * `docs/name-resolution/typescript.md`: one script declaration that uses what this code names. A directive such as
 * `'use strict'` and a CommonJS export statement are no such code.
 */
internal object TopLevelCode {
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private val NO_CODE = setOf(IMPORT_STATEMENT, EXPORT_STATEMENT, AMBIENT_DECLARATION, "comment", "empty_statement", "hash_bang_line")

    fun scriptOf(rootNode: SyntaxNode, names: ModuleNames): Declaration? {
        val statements = rootNode.namedChildren().filter { isCode(it) }.toList()
        if (statements.isEmpty()) return null
        val usedTypes = statements.flatMapTo(LinkedHashSet()) { UsedTypeExtractor.extract(it, names) }
        return Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = usedTypes)
    }

    private fun isCode(statement: SyntaxNode): Boolean = statement.type !in NO_CODE &&
        declarationsOf(statement).isEmpty() &&
        !isDirective(statement) &&
        CommonJsExports.valueOf(statement) == null

    private fun isDirective(statement: SyntaxNode): Boolean =
        statement.type == EXPRESSION_STATEMENT && statement.namedChildren().singleOrNull()?.type == STRING
}
