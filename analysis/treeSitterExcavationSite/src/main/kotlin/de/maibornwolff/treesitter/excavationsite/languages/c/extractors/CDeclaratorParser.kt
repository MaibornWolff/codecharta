package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Shared parser for C-family declarator syntax.
 *
 * Used by C, C++, and Objective-C to extract identifiers from complex
 * nested declarator structures like:
 * - pointer_declarator: int *p;
 * - array_declarator: int arr[10];
 * - function_declarator: int (*fp)(int);
 * - reference_declarator (C++ only): int &r;
 * - qualified_identifier (C++ only): Namespace::Class::method
 */
object CDeclaratorParser {
    // Declarator node types
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

    /**
     * Recursively find the identifier within a declarator.
     *
     * C-family declarators can be deeply nested:
     * - pointer_declarator -> declarator -> identifier
     * - array_declarator -> declarator -> identifier
     * - function_declarator -> declarator -> identifier
     * - reference_declarator -> declarator -> identifier (C++ only)
     * - parenthesized_declarator -> declarator -> ...
     *
     * @param node The declarator node to search
     * @return The identifier text, or null if not found
     */
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

    /**
     * Extracts identifier from the declarator field of a node.
     *
     * Common pattern for function_definition, parameter_declaration, etc.
     *
     * @param node The parent node containing a declarator field
     * @return The identifier text, or null if not found
     */
    fun extractIdentifierFromDeclaratorField(node: SyntaxNode): String? {
        val declarator = node.getChildByFieldName("declarator")
        return findIdentifierInDeclarator(declarator)
    }

    /**
     * Extract the rightmost identifier from a qualified identifier.
     *
     * For C++: MyNamespace::MyClass::myMethod -> myMethod
     *
     * @param node The qualified_identifier node
     * @return The rightmost identifier text, or null if not found
     */
    fun extractFromQualifiedIdentifier(node: SyntaxNode): String? {
        val name = node.getChildByFieldName("name")
        if (!name.isNull) {
            return when (name.type) {
                IDENTIFIER, TYPE_IDENTIFIER -> name.text
                QUALIFIED_IDENTIFIER -> extractFromQualifiedIdentifier(name)
                DESTRUCTOR_NAME -> extractFromDestructorName(name)
                else -> null
            }
        }

        // Fallback: find the last identifier child
        return node
            .children()
            .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
            .lastOrNull()
            ?.text
    }

    /**
     * Extracts identifier from init_declarator child.
     *
     * Used for: int x = 5; where init_declarator contains declarator and value.
     *
     * @param initDeclarator The init_declarator node
     * @return The identifier text, or null if not found
     */
    fun extractFromInitDeclarator(initDeclarator: SyntaxNode): String? {
        val innerDeclarator = initDeclarator.getChildByFieldName("declarator")
        return findIdentifierInDeclarator(innerDeclarator)
    }

    private fun extractIdentifierFromNestedDeclarator(node: SyntaxNode): String? {
        val childDeclarator = node.getChildByFieldName("declarator")
        if (!childDeclarator.isNull) {
            return findIdentifierInDeclarator(childDeclarator)
        }
        // Fallback: search children for identifier
        for (child in node.children()) {
            if (!child.isNull) {
                val result = findIdentifierInDeclarator(child)
                if (result != null) return result
            }
        }
        return null
    }

    private fun extractFromDestructorName(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
        ?: TreeTraversal.findFirstChildTextByType(node, TYPE_IDENTIFIER)
}
