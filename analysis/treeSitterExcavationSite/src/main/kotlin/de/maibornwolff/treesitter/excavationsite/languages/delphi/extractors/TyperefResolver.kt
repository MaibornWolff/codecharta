package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

/**
 * Resolves tree-sitter-pascal type-reference nodes (`typeref`, `typerefTpl`, `typerefDot`,
 * `typerefPtr`) into [UsedType] instances.
 *
 * Kept separate from [UsedTypeExtractor] so the latter stays focused on extraction-category
 * orchestration rather than on the internals of the pascal type-ref grammar.
 */
internal object TyperefResolver {
    private const val TYPEREF = "typeref"
    private const val TYPEREF_DOT = "typerefDot"
    private const val TYPEREF_TPL = "typerefTpl"
    private const val TYPEREF_PTR = "typerefPtr"
    private const val TYPEREF_ARGS = "typerefArgs"
    private const val IDENTIFIER = "identifier"
    private const val DECL_ARRAY = "declArray"
    private const val DECL_SET = "declSet"

    // `TYPE_NODE` is the node-type string `"type"` (used to match a child's `.type`).
    // `TYPE_FIELD` is the field name `"type"` (used with `getChildByFieldName`). They share
    // the same literal value in tree-sitter-pascal but have different roles in traversal.
    private const val TYPE_NODE = "type"
    private const val TYPE_FIELD = "type"

    private const val ENTITY_FIELD = "entity"
    private const val ARGS_FIELD = "args"
    private const val RHS_FIELD = "rhs"

    private val INNER_TYPES = setOf(IDENTIFIER, TYPEREF_DOT, TYPEREF_TPL, TYPEREF_PTR)
    private val TYPE_WRAPPER_INNER_TYPES = setOf(TYPEREF, DECL_ARRAY, DECL_SET)

    /**
     * `declVar.type` / `declArg.type` / `declField.type` / `declProp.type` / `declConst.type`
     * wrap the actual type node in a `type` container. Inside that container we usually find
     * a `typeref`, but `array of X` / `set of X` declarations wrap their element type in an
     * additional `declArray` / `declSet` node — we descend into the inner element type so
     * that `array of Byte` surfaces `Byte`.
     */
    fun fromTypeWrapper(typeWrapper: TSNode, sourceCode: String): UsedType? {
        if (typeWrapper.isNull) return null
        val inner = typeWrapper.children().firstOrNull { it.type in TYPE_WRAPPER_INNER_TYPES }
            ?: return null
        return when (inner.type) {
            TYPEREF -> toUsedType(inner, sourceCode)
            DECL_ARRAY, DECL_SET -> fromArrayOrSetElement(inner, sourceCode)
            else -> null
        }
    }

    /**
     * Both `declArray` and `declSet` carry their element type as an unnamed child of
     * node-type `"type"` — a wrapper that itself contains a `typeref` (or another
     * `declArray` / `declSet`, which the recursive descent into `fromTypeWrapper` unwraps
     * for nested `array of array of X` / `array of set of X` shapes). Bounded arrays carry
     * their range bounds as siblings; only the element type is captured.
     */
    private fun fromArrayOrSetElement(node: TSNode, sourceCode: String): UsedType? {
        val elementWrapper = node.children().firstOrNull { it.type == TYPE_NODE } ?: return null
        return fromTypeWrapper(elementWrapper, sourceCode)
    }

    /**
     * `declProc.type` (return type) may be either `type` (wrapper) or `typeref` directly.
     */
    fun fromTypeWrapperOrTyperef(typeNode: TSNode, sourceCode: String): UsedType? {
        if (typeNode.isNull) return null
        return when (typeNode.type) {
            TYPEREF -> toUsedType(typeNode, sourceCode)
            TYPE_FIELD -> fromTypeWrapper(typeNode, sourceCode)
            else -> null
        }
    }

    /**
     * Converts a `typeref` (or sub-shape: `typerefTpl`, `typerefDot`, `typerefPtr`) into a
     * [UsedType], capturing generic type arguments where present.
     */
    fun toUsedType(node: TSNode, sourceCode: String): UsedType? {
        if (node.isNull) return null
        return when (node.type) {
            TYPEREF -> typerefWrapper(node, sourceCode)
            TYPEREF_TPL -> genericTemplate(node, sourceCode)
            TYPEREF_DOT -> qualifiedName(node, sourceCode)
            TYPEREF_PTR -> pointerTarget(node, sourceCode)
            IDENTIFIER -> UsedType(name = TreeTraversal.getNodeText(node, sourceCode).trim())
            else -> null
        }
    }

    private fun typerefWrapper(node: TSNode, sourceCode: String): UsedType? {
        // `typeref` wraps one of: identifier, typerefDot, typerefTpl, typerefPtr, …
        val inner = node.children().firstOrNull { it.type in INNER_TYPES } ?: return null
        return toUsedType(inner, sourceCode)
    }

    private fun genericTemplate(node: TSNode, sourceCode: String): UsedType {
        val entity = node.getChildByFieldName(ENTITY_FIELD)
        val args = node.getChildByFieldName(ARGS_FIELD)
        val name = entityName(entity, sourceCode)
        val genericTypes = if (!args.isNull && args.type == TYPEREF_ARGS) {
            args.namedChildren().mapNotNull { toUsedType(it, sourceCode) }.toList()
        } else {
            emptyList()
        }
        return UsedType(name = name, genericTypes = genericTypes)
    }

    /**
     * `typerefDot` represents a qualified type name like `System.Classes.TObject`.
     *
     * We capture the **simple** type name — the rightmost segment (`TObject`) — because that
     * is how downstream resolvers match used types to project declarations. The intermediate
     * namespace segments are discarded.
     */
    private fun qualifiedName(node: TSNode, sourceCode: String): UsedType {
        val rhs = node.getChildByFieldName(RHS_FIELD)
        val name = if (!rhs.isNull) rightmostName(rhs, sourceCode) else ""
        return UsedType(name = name)
    }

    /**
     * `typerefPtr` is an anonymous pointer type (`^TFoo`). We unwrap the pointed-to type and
     * capture it — pointer indirection doesn't introduce a distinct used type. Per the
     * grammar, the operand is one of identifier / typerefDot / typerefTpl / typerefPtr
     * (not wrapped in `typeref`).
     */
    private fun pointerTarget(node: TSNode, sourceCode: String): UsedType? {
        val inner = node.children().firstOrNull { it.type in INNER_TYPES } ?: return null
        return toUsedType(inner, sourceCode)
    }

    /**
     * Extracts the simple type name from a `typerefTpl.entity`, which may itself be
     * `identifier`, `typerefDot`, or nested `typerefTpl`.
     */
    private fun entityName(entity: TSNode, sourceCode: String): String {
        if (entity.isNull) return ""
        return when (entity.type) {
            IDENTIFIER -> TreeTraversal.getNodeText(entity, sourceCode).trim()
            TYPEREF_DOT -> {
                val rhs = entity.getChildByFieldName(RHS_FIELD)
                if (!rhs.isNull) rightmostName(rhs, sourceCode) else ""
            }
            TYPEREF_TPL -> {
                val inner = entity.getChildByFieldName(ENTITY_FIELD)
                entityName(inner, sourceCode)
            }
            else -> ""
        }
    }

    /**
     * Descends through chained `typerefDot` / `typerefTpl` nodes to the rightmost identifier —
     * the simple type name of a qualified reference.
     */
    private fun rightmostName(node: TSNode, sourceCode: String): String {
        var current = node
        while (!current.isNull) {
            current = when (current.type) {
                IDENTIFIER -> return TreeTraversal.getNodeText(current, sourceCode).trim()
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
