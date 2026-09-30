package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.STRING
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_ALIAS_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object DeclarationNodes {
    const val CLASS_DECLARATION = "class_declaration"
    const val ABSTRACT_CLASS_DECLARATION = "abstract_class_declaration"
    const val INTERFACE_DECLARATION = "interface_declaration"
    const val ENUM_DECLARATION = "enum_declaration"
    const val FUNCTION_DECLARATION = "function_declaration"
    const val FUNCTION_SIGNATURE = "function_signature"
    const val GENERATOR_FUNCTION_DECLARATION = "generator_function_declaration"
    const val LEXICAL_DECLARATION = "lexical_declaration"
    const val VARIABLE_DECLARATION = "variable_declaration"
    const val INTERNAL_MODULE = "internal_module"

    val DECLARATION_NODE_TYPES = setOf(
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

    fun hasExportClause(node: TSNode): Boolean = node.children().any { it.type == EXPORT_CLAUSE }

    fun hasSource(node: TSNode): Boolean = node.children().any { it.type == STRING }

    fun extractName(node: TSNode, sourceCode: String): String {
        val nameTypes = when (node.type) {
            CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION,
            INTERFACE_DECLARATION, TYPE_ALIAS_DECLARATION -> arrayOf(TYPE_IDENTIFIER, IDENTIFIER)
            else -> arrayOf(IDENTIFIER)
        }
        return TreeTraversal.findFirstChildTextByType(node, sourceCode, *nameTypes)?.trim() ?: ""
    }
}
