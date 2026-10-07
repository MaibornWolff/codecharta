package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.children
import de.maibornwolff.treesitter.excavationsite.shared.domain.namedChildren

/**
 * Shared Rust type parsing.
 *
 * Turns a type-bearing AST node into zero or more [UsedType]s:
 * - `type_identifier` → a plain named type (primitives, lifetimes and `Self` are skipped)
 * - `generic_type` → the base type with nested [UsedType.genericTypes] (never flat-duplicated)
 * - `scoped_type_identifier` → the final type name with its scope segments in [UsedType.namespacePrefix]
 * - `reference_type`/`pointer_type`/`array_type`/`slice_type`/`dynamic_type`/`abstract_type` → unwrapped to the inner type(s)
 * - `tuple_type` → each element type
 */
internal object RustTypeHelper {
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val SCOPED_TYPE_IDENTIFIER = "scoped_type_identifier"
    private const val GENERIC_TYPE = "generic_type"
    private const val TYPE_ARGUMENTS = "type_arguments"
    private const val REFERENCE_TYPE = "reference_type"
    private const val POINTER_TYPE = "pointer_type"
    private const val ARRAY_TYPE = "array_type"
    private const val SLICE_TYPE = "slice_type"
    private const val TUPLE_TYPE = "tuple_type"
    private const val DYNAMIC_TYPE = "dynamic_type"
    private const val ABSTRACT_TYPE = "abstract_type"
    private const val PRIMITIVE_TYPE = "primitive_type"
    private const val UNIT_TYPE = "unit_type"
    private const val NEVER_TYPE = "never_type"
    private const val FUNCTION_TYPE = "function_type"
    private const val QUALIFIED_TYPE = "qualified_type"
    private const val PARAMETERS = "parameters"
    private const val SCOPE_SEPARATOR = "::"
    private const val SELF_TYPE = "Self"

    private val UNWRAPPED_TYPES = setOf(REFERENCE_TYPE, POINTER_TYPE, ARRAY_TYPE, SLICE_TYPE, DYNAMIC_TYPE, ABSTRACT_TYPE)

    private val TYPE_NODE_TYPES = setOf(
        TYPE_IDENTIFIER, SCOPED_TYPE_IDENTIFIER, GENERIC_TYPE,
        REFERENCE_TYPE, POINTER_TYPE, ARRAY_TYPE, SLICE_TYPE, TUPLE_TYPE,
        DYNAMIC_TYPE, ABSTRACT_TYPE, PRIMITIVE_TYPE, UNIT_TYPE, NEVER_TYPE,
        FUNCTION_TYPE, QUALIFIED_TYPE
    )

    fun isTypeNode(node: SyntaxNode): Boolean = node.type in TYPE_NODE_TYPES

    /**
     * Extracts every user-defined [UsedType] reachable from a type position.
     * Primitives, lifetimes, the unit/never types and `Self` resolve to no entries.
     */
    fun extractTypes(node: SyntaxNode): List<UsedType> {
        if (node.isNull) return emptyList()
        return when (node.type) {
            TYPE_IDENTIFIER -> extractNamedType(node)
            SCOPED_TYPE_IDENTIFIER -> listOfNotNull(extractScopedType(node))
            GENERIC_TYPE -> listOfNotNull(extractGenericType(node))
            FUNCTION_TYPE -> extractFunctionType(node)
            TUPLE_TYPE -> node.namedChildren().flatMap { extractTypes(it) }.toList()
            in UNWRAPPED_TYPES -> node.namedChildren().flatMap { extractTypes(it) }.toList()
            else -> emptyList()
        }
    }

    /**
     * `fn(P) -> R` and `Fn(Arg) -> Inner`: collect the optional trait name, the parameter
     * types (nested inside a `parameters` node), and the return type.
     */
    private fun extractFunctionType(node: SyntaxNode): List<UsedType> = node
        .namedChildren()
        .flatMap { child ->
            if (child.type == PARAMETERS) {
                child.namedChildren().flatMap { extractTypes(it) }.toList()
            } else {
                extractTypes(child)
            }
        }.toList()

    private fun extractNamedType(node: SyntaxNode): List<UsedType> {
        val name = node.text.trim()
        if (name.isEmpty() || name == SELF_TYPE) return emptyList()
        return listOf(UsedType(name = name))
    }

    private fun extractScopedType(node: SyntaxNode): UsedType? {
        val nameNode = node.children().lastOrNull { it.type == TYPE_IDENTIFIER } ?: return null
        val name = nameNode.text.trim()
        if (name.isEmpty() || name == SELF_TYPE) return null
        val prefixNode = node.namedChildren().firstOrNull { it != nameNode }
        val prefix = prefixNode
            ?.let { segmentsOf(it) }
            ?.filter { it != SELF_TYPE && isPathSegment(it) }
            ?: emptyList()
        return UsedType(name = name, namespacePrefix = prefix)
    }

    private fun extractGenericType(node: SyntaxNode): UsedType? {
        val baseNode = node
            .namedChildren()
            .firstOrNull { it.type == TYPE_IDENTIFIER || it.type == SCOPED_TYPE_IDENTIFIER }
            ?: return null
        val base = when (baseNode.type) {
            SCOPED_TYPE_IDENTIFIER -> extractScopedType(baseNode)
            else -> extractNamedType(baseNode).firstOrNull()
        } ?: return null
        val typeArguments = node.children().firstOrNull { it.type == TYPE_ARGUMENTS }
        val genericTypes = typeArguments
            ?.namedChildren()
            ?.flatMap { extractTypes(it) }
            ?.toList()
            ?: emptyList()
        return base.copy(genericTypes = genericTypes)
    }

    private fun segmentsOf(node: SyntaxNode): List<String> = node.text
        .split(SCOPE_SEPARATOR)
        .map { it.trim() }
        .filter { it.isNotEmpty() }

    /**
     * A clean path identifier (`crate`, `self`, `super`, a module/type name). Filters out
     * `bracketed_type`/`qualified_type` prefixes such as `<T as Tr>` that aren't a namespace.
     */
    private fun isPathSegment(segment: String): Boolean =
        segment.first().let { it.isLetter() || it == '_' } && segment.all { it.isLetterOrDigit() || it == '_' }
}
