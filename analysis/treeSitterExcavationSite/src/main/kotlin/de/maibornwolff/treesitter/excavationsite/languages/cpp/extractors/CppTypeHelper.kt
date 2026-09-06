package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object CppTypeHelper {
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val IDENTIFIER = "identifier"
    private const val TEMPLATE_TYPE = "template_type"
    private const val TEMPLATE_FUNCTION = "template_function"
    private const val TEMPLATE_ARGUMENT_LIST = "template_argument_list"
    private const val TYPE_DESCRIPTOR = "type_descriptor"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val NAMESPACE_IDENTIFIER = "namespace_identifier"
    private const val PRIMITIVE_TYPE = "primitive_type"
    private const val SIZED_TYPE_SPECIFIER = "sized_type_specifier"
    private const val SCOPE_FIELD = "scope"
    private const val TYPE_FIELD = "type"

    private val TYPE_NODE_TYPES =
        setOf(TYPE_IDENTIFIER, TEMPLATE_TYPE, QUALIFIED_IDENTIFIER, PRIMITIVE_TYPE, SIZED_TYPE_SPECIFIER)
    private val LEAF_TYPE_NODES = setOf(TYPE_IDENTIFIER, IDENTIFIER, PRIMITIVE_TYPE, SIZED_TYPE_SPECIFIER)
    private val TEMPLATE_LIKE_TYPES = setOf(TEMPLATE_TYPE, TEMPLATE_FUNCTION)
    private val TEMPLATE_NAME_TYPES = setOf(TYPE_IDENTIFIER, IDENTIFIER)

    fun isTypeNode(node: TSNode): Boolean = node.type in TYPE_NODE_TYPES

    fun extractType(typeNode: TSNode, sourceCode: String): UsedType? {
        if (typeNode.isNull) return null
        return when (typeNode.type) {
            in LEAF_TYPE_NODES -> extractLeafName(typeNode, sourceCode)
            in TEMPLATE_LIKE_TYPES -> extractTemplateLike(typeNode, sourceCode)
            QUALIFIED_IDENTIFIER -> extractRightmostSegment(typeNode, sourceCode)
            else -> null
        }
    }

    private fun extractLeafName(node: TSNode, sourceCode: String): UsedType =
        UsedType(name = TreeTraversal.getNodeText(node, sourceCode).trim())

    fun extractTypeFromTypeField(node: TSNode, sourceCode: String): UsedType? {
        val typeField = node.getChildByFieldName(TYPE_FIELD).takeIf { !it.isNull }
            ?: node.namedChildren().firstOrNull { isTypeNode(it) || it.type == TYPE_DESCRIPTOR }
            ?: return null
        val unwrapped = if (typeField.type == TYPE_DESCRIPTOR) {
            typeField.namedChildren().firstOrNull { isTypeNode(it) } ?: return null
        } else {
            typeField
        }
        if (!isTypeNode(unwrapped)) return null
        return extractType(unwrapped, sourceCode)
    }

    private fun extractTemplateLike(templateNode: TSNode, sourceCode: String): UsedType? {
        // Accepts template_type (name=type_identifier, used for types) and
        // template_function (name=identifier, used for function-call forms and, per
        // tree-sitter-cpp, also for nested template arguments like C<T> inside list<C<T>>).
        val nameNode = templateNode.children().firstOrNull { it.type in TEMPLATE_NAME_TYPES } ?: return null
        val argList = templateNode.children().firstOrNull { it.type == TEMPLATE_ARGUMENT_LIST }
        val genericTypes = argList
            ?.namedChildren()
            ?.mapNotNull { extractGenericArgument(it, sourceCode) }
            ?.toList()
            ?: emptyList()
        return UsedType(
            name = TreeTraversal.getNodeText(nameNode, sourceCode).trim(),
            genericTypes = genericTypes
        )
    }

    private fun extractGenericArgument(argNode: TSNode, sourceCode: String): UsedType? {
        if (argNode.type == TYPE_DESCRIPTOR) {
            return argNode.namedChildren().firstNotNullOfOrNull { extractType(it, sourceCode) }
        }
        return extractType(argNode, sourceCode)
    }

    fun extractRightmostSegment(qualifiedId: TSNode, sourceCode: String): UsedType? {
        val path = QualifiedIdentifierPath.walk(qualifiedId, sourceCode)
        val leafNode = path.leaf ?: return null
        if (leafNode.type in TEMPLATE_LIKE_TYPES) {
            return extractTemplateLike(leafNode, sourceCode)?.copy(namespacePrefix = path.segments)
        }
        val text = TreeTraversal.getNodeText(leafNode, sourceCode).trim()
        return if (text.isEmpty()) null else UsedType(name = text, namespacePrefix = path.segments)
    }

    fun extractSingleSegmentScope(qualifiedId: TSNode, sourceCode: String): UsedType? {
        val scope = qualifiedId.getChildByFieldName(SCOPE_FIELD).takeIf { !it.isNull } ?: return null
        if (scope.type != NAMESPACE_IDENTIFIER) return null
        val text = TreeTraversal.getNodeText(scope, sourceCode).trim()
        return if (text.isEmpty()) null else UsedType(name = text)
    }

    fun extractSecondToLastSegment(qualifiedId: TSNode, sourceCode: String): UsedType? {
        val segments = QualifiedIdentifierPath.walk(qualifiedId, sourceCode).segments
        val name = segments.lastOrNull() ?: return null
        return UsedType(name = name, namespacePrefix = segments.dropLast(1))
    }
}
