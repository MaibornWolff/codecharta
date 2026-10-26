package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The code at the top level of a module outside every declaration, import and export, by decision 3 of
 * `docs/name-resolution/typescript.md`: one script declaration that uses what this code names. A directive such as
 * `'use strict'` and a CommonJS export statement are no such code; a side-effect import is, and like a `require` whose
 * result is not bound it uses the top-level code of its module, reported as [MODULE_SCRIPT] with the specifier as prefix.
 */
internal object TopLevelCode {
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val FUNCTION_FIELD = "function"
    private const val ARGUMENTS_FIELD = "arguments"
    private val NO_CODE = setOf(IMPORT_STATEMENT, EXPORT_STATEMENT, AMBIENT_DECLARATION, "comment", "empty_statement", "hash_bang_line")

    fun scriptOf(rootNode: SyntaxNode, names: ModuleNames): Declaration? {
        val statements = rootNode.namedChildren().filter { isCode(it) || isSideEffectImport(it) }.toList()
        if (statements.isEmpty()) return null
        val usedTypes = statements.flatMapTo(LinkedHashSet()) { usesOf(it, names) }
        return Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = usedTypes)
    }

    private fun usesOf(statement: SyntaxNode, names: ModuleNames): Set<UsedType> {
        val specifier = moduleRunBy(statement) ?: return UsedTypeExtractor.extract(statement, names)
        return setOf(UsedType(name = MODULE_SCRIPT, namespacePrefix = specifier.split(SPECIFIER_SEPARATOR)))
    }

    private fun isCode(statement: SyntaxNode): Boolean = statement.type !in NO_CODE &&
        declarationsOf(statement).isEmpty() &&
        !isDirective(statement) &&
        CommonJsExports.valueOf(statement) == null

    private fun isDirective(statement: SyntaxNode): Boolean =
        statement.type == EXPRESSION_STATEMENT && statement.namedChildren().singleOrNull()?.type == STRING

    private fun isSideEffectImport(statement: SyntaxNode): Boolean =
        statement.type == IMPORT_STATEMENT && statement.children().none { it.type == IMPORT_CLAUSE || it.type == IMPORT_REQUIRE_CLAUSE }

    // The specifier of a module a statement runs for its effect alone: `import './polyfill'` or `require('./setup')`
    private fun moduleRunBy(statement: SyntaxNode): String? = when {
        isSideEffectImport(statement) -> specifierIn(statement)
        statement.type == EXPRESSION_STATEMENT -> statement.namedChildren().singleOrNull()?.let { requiredSpecifier(it) }
        else -> null
    }

    private fun requiredSpecifier(expression: SyntaxNode): String? {
        if (expression.type != CALL_EXPRESSION) return null
        val function = expression.getChildByFieldName(FUNCTION_FIELD).orNull() ?: return null
        if (function.type != IDENTIFIER || function.text != REQUIRE) return null
        return expression.getChildByFieldName(ARGUMENTS_FIELD).orNull()?.let { specifierIn(it) }
    }

    private fun specifierIn(node: SyntaxNode): String? = node
        .children()
        .firstOrNull { it.type == STRING }
        ?.children()
        ?.firstOrNull { it.type == STRING_FRAGMENT }
        ?.text
}
