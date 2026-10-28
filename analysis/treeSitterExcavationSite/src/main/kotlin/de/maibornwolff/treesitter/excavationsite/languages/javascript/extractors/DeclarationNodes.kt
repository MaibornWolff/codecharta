package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal const val INTERFACE_DECLARATION = "interface_declaration"
internal const val ENUM_DECLARATION = "enum_declaration"
internal const val FUNCTION_DECLARATION = "function_declaration"
internal const val FUNCTION_SIGNATURE = "function_signature"
internal const val GENERATOR_FUNCTION_DECLARATION = "generator_function_declaration"
internal const val LEXICAL_DECLARATION = "lexical_declaration"
internal const val VARIABLE_DECLARATION = "variable_declaration"
internal const val INTERNAL_MODULE = "internal_module"

internal val DECLARATION_NODE_TYPES = setOf(
    CLASS_DECLARATION,
    ABSTRACT_CLASS_DECLARATION,
    INTERFACE_DECLARATION,
    ENUM_DECLARATION,
    FUNCTION_DECLARATION,
    FUNCTION_SIGNATURE,
    GENERATOR_FUNCTION_DECLARATION,
    TYPE_ALIAS_DECLARATION,
    LEXICAL_DECLARATION,
    VARIABLE_DECLARATION,
    INTERNAL_MODULE
)

internal const val AMBIENT_DECLARATION = "ambient_declaration"
private const val EXPRESSION_STATEMENT = "expression_statement"

/** The declarations a statement makes: the statement itself, what a `declare` statement declares, or a namespace. */
internal fun declarationsOf(statement: SyntaxNode): List<SyntaxNode> = when (statement.type) {
    in DECLARATION_NODE_TYPES -> listOf(statement)
    AMBIENT_DECLARATION -> statement.children().filter { it.type in DECLARATION_NODE_TYPES }.toList()
    EXPRESSION_STATEMENT -> statement.children().filter { it.type == INTERNAL_MODULE }.toList()
    else -> emptyList()
}

internal fun hasExportClause(node: SyntaxNode): Boolean = node.children().any { it.type == EXPORT_CLAUSE }

internal fun hasSource(node: SyntaxNode): Boolean = node.children().any { it.type == STRING }

internal fun extractDeclarationName(node: SyntaxNode): String {
    val nameTypes = when (node.type) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION,
        INTERFACE_DECLARATION, TYPE_ALIAS_DECLARATION -> arrayOf(TYPE_IDENTIFIER, IDENTIFIER)
        else -> arrayOf(IDENTIFIER)
    }
    return TreeTraversal.findFirstChildTextByType(node, *nameTypes)?.trim() ?: ""
}
