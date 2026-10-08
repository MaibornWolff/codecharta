package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object CSharpTypeHelper {
    private const val GENERIC_NAME = "generic_name"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val PREDEFINED_TYPE = "predefined_type"
    private const val NULLABLE_TYPE = "nullable_type"
    private const val ARRAY_TYPE = "array_type"
    private const val TYPE_ARGUMENT_LIST = "type_argument_list"

    private val TYPE_NODE_TYPES = setOf(IDENTIFIER, PREDEFINED_TYPE, GENERIC_NAME, QUALIFIED_NAME, NULLABLE_TYPE, ARRAY_TYPE)

    fun isTypeNode(node: SyntaxNode): Boolean = node.type in TYPE_NODE_TYPES

    fun extractType(typeNode: SyntaxNode): UsedType? {
        if (typeNode.isNull) return null
        return when (typeNode.type) {
            GENERIC_NAME -> extractGenericType(typeNode)
            QUALIFIED_NAME -> extractQualifiedType(typeNode)
            NULLABLE_TYPE -> extractNullableType(typeNode)
            ARRAY_TYPE -> extractArrayElementType(typeNode)
            IDENTIFIER, PREDEFINED_TYPE -> UsedType(name = typeNode.text.trim())
            else -> null
        }
    }

    private fun extractGenericType(genericNameNode: SyntaxNode): UsedType? {
        val nameNode = genericNameNode.children().firstOrNull { it.type == IDENTIFIER } ?: return null
        val typeArgs = genericNameNode.children().firstOrNull { it.type == TYPE_ARGUMENT_LIST }
        val genericTypes = typeArgs
            ?.namedChildren()
            ?.filter { isTypeNode(it) }
            ?.mapNotNull { extractType(it) }
            ?.toList() ?: emptyList()
        return UsedType(
            name = nameNode.text.trim(),
            genericTypes = genericTypes
        )
    }

    private fun extractQualifiedType(qualifiedNameNode: SyntaxNode): UsedType? = UsedType(name = qualifiedNameNode.text.trim())

    private fun extractNullableType(nullableNode: SyntaxNode): UsedType? {
        val innerType = nullableNode.namedChildren().firstOrNull { isTypeNode(it) }
        return innerType?.let { extractType(it) }
    }

    private fun extractArrayElementType(arrayTypeNode: SyntaxNode): UsedType? {
        val elementType = arrayTypeNode.namedChildren().firstOrNull { isTypeNode(it) }
        return elementType?.let { extractType(it) }
    }
}
