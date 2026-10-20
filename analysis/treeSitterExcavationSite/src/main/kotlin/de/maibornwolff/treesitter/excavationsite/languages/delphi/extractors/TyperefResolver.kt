package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object TyperefResolver {
    private const val TYPEREF = "typeref"
    private const val TYPEREF_DOT = "typerefDot"
    private const val TYPEREF_TPL = "typerefTpl"
    private const val TYPEREF_PTR = "typerefPtr"
    private const val TYPEREF_ARGS = "typerefArgs"
    private const val IDENTIFIER = "identifier"
    private const val DECL_ARRAY = "declArray"
    private const val DECL_SET = "declSet"

    private const val TYPE_NODE = "type"
    private const val TYPE_FIELD = "type"

    private const val ENTITY_FIELD = "entity"
    private const val ARGS_FIELD = "args"
    private const val RHS_FIELD = "rhs"

    private val INNER_TYPES = setOf(IDENTIFIER, TYPEREF_DOT, TYPEREF_TPL, TYPEREF_PTR)
    private val TYPE_WRAPPER_INNER_TYPES = setOf(TYPEREF, DECL_ARRAY, DECL_SET)

    fun fromTypeWrapper(typeWrapper: SyntaxNode): UsedType? {
        if (typeWrapper.isNull) return null
        val inner = typeWrapper.children().firstOrNull { it.type in TYPE_WRAPPER_INNER_TYPES }
            ?: return null
        return when (inner.type) {
            TYPEREF -> toUsedType(inner)
            DECL_ARRAY, DECL_SET -> fromArrayOrSetElement(inner)
            else -> null
        }
    }

    // The range bounds of a bounded array are siblings of the element type and deliberately not captured.
    private fun fromArrayOrSetElement(node: SyntaxNode): UsedType? {
        val elementWrapper = node.children().firstOrNull { it.type == TYPE_NODE } ?: return null
        return fromTypeWrapper(elementWrapper)
    }

    fun fromTypeWrapperOrTyperef(typeNode: SyntaxNode): UsedType? {
        if (typeNode.isNull) return null
        return when (typeNode.type) {
            TYPEREF -> toUsedType(typeNode)
            TYPE_FIELD -> fromTypeWrapper(typeNode)
            else -> null
        }
    }

    fun toUsedType(node: SyntaxNode): UsedType? {
        if (node.isNull) return null
        return when (node.type) {
            TYPEREF, TYPEREF_PTR -> unwrapInnerType(node)
            TYPEREF_TPL -> genericTemplate(node)
            TYPEREF_DOT -> qualifiedName(node)
            IDENTIFIER -> UsedType(name = node.text.trim())
            else -> null
        }
    }

    // A pointer (`^TFoo`) introduces no used type of its own, so it unwraps like a typeref.
    private fun unwrapInnerType(node: SyntaxNode): UsedType? {
        val inner = node.children().firstOrNull { it.type in INNER_TYPES } ?: return null
        return toUsedType(inner)
    }

    private fun genericTemplate(node: SyntaxNode): UsedType {
        val entity = node.getChildByFieldName(ENTITY_FIELD)
        val args = node.getChildByFieldName(ARGS_FIELD)
        val name = entityName(entity)
        val genericTypes = if (!args.isNull && args.type == TYPEREF_ARGS) {
            args.namedChildren().mapNotNull { toUsedType(it) }.toList()
        } else {
            emptyList()
        }
        return UsedType(name = name, genericTypes = genericTypes)
    }

    // Only the simple name (`TObject` of `System.Classes.TObject`), as downstream resolvers match by it.
    private fun qualifiedName(node: SyntaxNode): UsedType {
        val rhs = node.getChildByFieldName(RHS_FIELD)
        val name = if (!rhs.isNull) rightmostName(rhs) else ""
        return UsedType(name = name)
    }

    private fun entityName(entity: SyntaxNode): String {
        if (entity.isNull) return ""
        return when (entity.type) {
            IDENTIFIER -> entity.text.trim()
            TYPEREF_DOT -> {
                val rhs = entity.getChildByFieldName(RHS_FIELD)
                if (!rhs.isNull) rightmostName(rhs) else ""
            }
            TYPEREF_TPL -> {
                val inner = entity.getChildByFieldName(ENTITY_FIELD)
                entityName(inner)
            }
            else -> ""
        }
    }

    private fun rightmostName(node: SyntaxNode): String {
        var current = node
        while (!current.isNull) {
            current = when (current.type) {
                IDENTIFIER -> return current.text.trim()
                TYPEREF_DOT -> {
                    val rhs = current.getChildByFieldName(RHS_FIELD)
                    if (rhs.isNull) return "" else rhs
                }
                TYPEREF_TPL -> {
                    val entity = current.getChildByFieldName(ENTITY_FIELD)
                    if (entity.isNull) return "" else entity
                }
                else -> return ""
            }
        }
        return ""
    }
}
