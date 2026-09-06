package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object CSharpTypeHelper {
    private const val GENERIC_NAME = "generic_name"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val PREDEFINED_TYPE = "predefined_type"
    private const val NULLABLE_TYPE = "nullable_type"
    private const val ARRAY_TYPE = "array_type"
    private const val TYPE_ARGUMENT_LIST = "type_argument_list"

    private val TYPE_NODE_TYPES = setOf(IDENTIFIER, PREDEFINED_TYPE, GENERIC_NAME, QUALIFIED_NAME, NULLABLE_TYPE, ARRAY_TYPE)

    fun isTypeNode(node: TSNode): Boolean = node.type in TYPE_NODE_TYPES

    fun extractType(typeNode: TSNode, sourceCode: String): UsedType? {
        if (typeNode.isNull) return null
        return when (typeNode.type) {
            GENERIC_NAME -> extractGenericType(typeNode, sourceCode)
            QUALIFIED_NAME -> extractQualifiedType(typeNode, sourceCode)
            NULLABLE_TYPE -> extractNullableType(typeNode, sourceCode)
            ARRAY_TYPE -> extractArrayElementType(typeNode, sourceCode)
            IDENTIFIER, PREDEFINED_TYPE -> UsedType(name = TreeTraversal.getNodeText(typeNode, sourceCode).trim())
            else -> null
        }
    }

    private fun extractGenericType(genericNameNode: TSNode, sourceCode: String): UsedType? {
        val nameNode = genericNameNode.children().firstOrNull { it.type == IDENTIFIER } ?: return null
        val typeArgs = genericNameNode.children().firstOrNull { it.type == TYPE_ARGUMENT_LIST }
        val genericTypes = typeArgs
            ?.namedChildren()
            ?.filter { isTypeNode(it) }
            ?.mapNotNull { extractType(it, sourceCode) }
            ?.toList() ?: emptyList()
        return UsedType(
            name = TreeTraversal.getNodeText(nameNode, sourceCode).trim(),
            genericTypes = genericTypes
        )
    }

    private fun extractQualifiedType(qualifiedNameNode: TSNode, sourceCode: String): UsedType? =
        UsedType(name = TreeTraversal.getNodeText(qualifiedNameNode, sourceCode).trim())

    private fun extractNullableType(nullableNode: TSNode, sourceCode: String): UsedType? {
        val innerType = nullableNode.namedChildren().firstOrNull { isTypeNode(it) }
        return innerType?.let { extractType(it, sourceCode) }
    }

    private fun extractArrayElementType(arrayTypeNode: TSNode, sourceCode: String): UsedType? {
        val elementType = arrayTypeNode.namedChildren().firstOrNull { isTypeNode(it) }
        return elementType?.let { extractType(it, sourceCode) }
    }
}
