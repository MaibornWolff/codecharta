package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

object CDeclaratorParser {
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val FIELD_IDENTIFIER = "field_identifier"
    private const val POINTER_DECLARATOR = "pointer_declarator"
    private const val ARRAY_DECLARATOR = "array_declarator"
    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val PARENTHESIZED_DECLARATOR = "parenthesized_declarator"
    private const val REFERENCE_DECLARATOR = "reference_declarator"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val DESTRUCTOR_NAME = "destructor_name"

    fun findIdentifierInDeclarator(node: SyntaxNode): String? {
        if (node.isNull) return null

        return when (node.type) {
            IDENTIFIER, FIELD_IDENTIFIER, TYPE_IDENTIFIER -> node.text
            POINTER_DECLARATOR, ARRAY_DECLARATOR, FUNCTION_DECLARATOR,
            PARENTHESIZED_DECLARATOR, REFERENCE_DECLARATOR -> {
                extractIdentifierFromNestedDeclarator(node)
            }
            QUALIFIED_IDENTIFIER -> extractFromQualifiedIdentifier(node)
            DESTRUCTOR_NAME -> extractFromDestructorName(node)
            else -> {
                TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
                    ?: TreeTraversal.findFirstChildTextByType(node, FIELD_IDENTIFIER)
            }
        }
    }

    fun extractIdentifierFromDeclaratorField(node: SyntaxNode): String? {
        val declarator = node.getChildByFieldName("declarator")
        return findIdentifierInDeclarator(declarator)
    }

    fun extractFromQualifiedIdentifier(node: SyntaxNode): String? {
        val name = node.getChildByFieldName("name")
        if (name.isNull) return lastIdentifierChildText(node)

        return when (name.type) {
            IDENTIFIER, TYPE_IDENTIFIER -> name.text
            QUALIFIED_IDENTIFIER -> extractFromQualifiedIdentifier(name)
            DESTRUCTOR_NAME -> extractFromDestructorName(name)
            else -> null
        }
    }

    private fun lastIdentifierChildText(node: SyntaxNode): String? = node
        .children()
        .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
        .lastOrNull()
        ?.text

    fun extractFromInitDeclarator(initDeclarator: SyntaxNode): String? {
        val innerDeclarator = initDeclarator.getChildByFieldName("declarator")
        return findIdentifierInDeclarator(innerDeclarator)
    }

    private fun extractIdentifierFromNestedDeclarator(node: SyntaxNode): String? {
        val childDeclarator = node.getChildByFieldName("declarator")
        if (!childDeclarator.isNull) {
            return findIdentifierInDeclarator(childDeclarator)
        }
        return firstIdentifierAmongChildren(node)
    }

    private fun firstIdentifierAmongChildren(node: SyntaxNode): String? = node
        .children()
        .filter { !it.isNull }
        .firstNotNullOfOrNull { findIdentifierInDeclarator(it) }

    private fun extractFromDestructorName(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
        ?: TreeTraversal.findFirstChildTextByType(node, TYPE_IDENTIFIER)
}
