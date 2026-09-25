package de.maibornwolff.treesitter.excavationsite.languages.c.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

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
     * @param sourceCode The full source code string
     * @return The identifier text, or null if not found
     */
    fun findIdentifierInDeclarator(node: TSNode, sourceCode: String): String? {
        if (node.isNull) return null

        return when (node.type) {
            IDENTIFIER, FIELD_IDENTIFIER, TYPE_IDENTIFIER -> TreeTraversal.getNodeText(node, sourceCode)
            POINTER_DECLARATOR, ARRAY_DECLARATOR, FUNCTION_DECLARATOR,
            PARENTHESIZED_DECLARATOR, REFERENCE_DECLARATOR -> {
                extractIdentifierFromNestedDeclarator(node, sourceCode)
            }
            QUALIFIED_IDENTIFIER -> extractFromQualifiedIdentifier(node, sourceCode)
            DESTRUCTOR_NAME -> extractFromDestructorName(node, sourceCode)
            else -> {
                TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
                    ?: TreeTraversal.findFirstChildTextByType(node, sourceCode, FIELD_IDENTIFIER)
            }
        }
    }

    /**
     * Extracts identifier from the declarator field of a node.
     *
     * Common pattern for function_definition, parameter_declaration, etc.
     *
     * @param node The parent node containing a declarator field
     * @param sourceCode The full source code string
     * @return The identifier text, or null if not found
     */
    fun extractIdentifierFromDeclaratorField(node: TSNode, sourceCode: String): String? {
        val declarator = node.getChildByFieldName("declarator")
        return declarator?.let { findIdentifierInDeclarator(it, sourceCode) }
    }

    /**
     * Extract the rightmost identifier from a qualified identifier.
     *
     * For C++: MyNamespace::MyClass::myMethod -> myMethod
     *
     * @param node The qualified_identifier node
     * @param sourceCode The full source code string
     * @return The rightmost identifier text, or null if not found
     */
    fun extractFromQualifiedIdentifier(node: TSNode, sourceCode: String): String? {
        val name = node.getChildByFieldName("name")
        if (name != null) {
            return when (name.type) {
                IDENTIFIER, TYPE_IDENTIFIER -> TreeTraversal.getNodeText(name, sourceCode)
                QUALIFIED_IDENTIFIER -> extractFromQualifiedIdentifier(name, sourceCode)
                DESTRUCTOR_NAME -> extractFromDestructorName(name, sourceCode)
                else -> null
            }
        }

        // Fallback: find the last identifier child
        return node
            .children()
            .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
            .lastOrNull()
            ?.let { TreeTraversal.getNodeText(it, sourceCode) }
    }

    /**
     * Extracts identifier from init_declarator child.
     *
     * Used for: int x = 5; where init_declarator contains declarator and value.
     *
     * @param initDeclarator The init_declarator node
     * @param sourceCode The full source code string
     * @return The identifier text, or null if not found
     */
    fun extractFromInitDeclarator(initDeclarator: TSNode, sourceCode: String): String? {
        val innerDeclarator = initDeclarator.getChildByFieldName("declarator")
        return innerDeclarator?.let { findIdentifierInDeclarator(it, sourceCode) }
    }

    private fun extractIdentifierFromNestedDeclarator(node: TSNode, sourceCode: String): String? {
        val childDeclarator = node.getChildByFieldName("declarator")
        if (childDeclarator != null && !childDeclarator.isNull) {
            return findIdentifierInDeclarator(childDeclarator, sourceCode)
        }
        // Fallback: search children for identifier
        for (child in node.children()) {
            if (!child.isNull) {
                val result = findIdentifierInDeclarator(child, sourceCode)
                if (result != null) return result
            }
        }
        return null
    }

    private fun extractFromDestructorName(node: TSNode, sourceCode: String): String? =
        TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
            ?: TreeTraversal.findFirstChildTextByType(node, sourceCode, TYPE_IDENTIFIER)
}
