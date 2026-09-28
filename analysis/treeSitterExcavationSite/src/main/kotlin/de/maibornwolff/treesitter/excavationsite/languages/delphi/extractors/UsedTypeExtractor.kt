package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

/**
 * Extracts all types referenced inside a Delphi declaration.
 *
 * Source categories are collected in a single AST pass and concatenated in this order:
 *
 *     inheritance, fieldTypes, propertyTypes, constTypes, variableTypes,
 *     parameters, returnTypes, attributeTypes, constructorCalls, methodCalls,
 *     castTypes, genericConstraintTypes
 *
 * DC has no legacy Delphi analyzer, so the order is chosen once here. The order follows
 * Kotlin's `inheritance → data → callable → annotations → calls` philosophy; Kotlin has
 * no direct equivalent for Delphi's `field` / `const` / `var` declarations or for `cast` /
 * `genericConstraint` types, so the data block is expanded to cover Delphi's separate
 * categories and the Delphi-only categories are appended at the end.
 *
 * Constructor calls and method-invocation receivers use the same uppercase-first
 * heuristic as the Java / Kotlin extractors. Pascal-specific type-reference shapes
 * (`typeref`, `typerefTpl`, `typerefDot`, `typerefPtr`) are resolved via [TyperefResolver].
 */
internal object UsedTypeExtractor {
    // Inheritance — `class(Base, IFoo)` / `interface(IBase)` / `class helper for TFoo`.
    private const val DECL_CLASS = "declClass"
    private const val DECL_INTF = "declIntf"
    private const val DECL_HELPER = "declHelper"

    // Members and parameters.
    private const val DECL_PROC = "declProc"
    private const val DEF_PROC = "defProc"
    private const val DECL_ARG = "declArg"
    private const val DECL_FIELD = "declField"
    private const val DECL_VAR = "declVar"
    private const val DECL_CONST = "declConst"
    private const val DECL_PROP = "declProp"

    private const val TYPE_FIELD = "type"
    private const val HEADER_FIELD = "header"

    // Expressions.
    private const val EXPR_CALL = "exprCall"
    private const val EXPR_DOT = "exprDot"
    private const val EXPR_TPL = "exprTpl"
    private const val EXPR_BINARY = "exprBinary"
    private const val ENTITY_FIELD = "entity"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val OPERATOR_FIELD = "operator"

    // RTTI attributes (`[Inject]`, `[SomeAttr('x', 1)]`).
    private const val RTTI_ATTRIBUTES = "rttiAttributes"

    // Generic type-parameter declarations (`TFoo<T: TBase> = class`).
    private const val GENERIC_TPL = "genericTpl"
    private const val GENERIC_ARGS = "genericArgs"
    private const val GENERIC_ARG = "genericArg"
    private const val ARGS_FIELD = "args"

    private const val TYPEREF = "typeref"
    private const val IDENTIFIER = "identifier"
    private const val CONSTRUCTOR_NAME = "Create"

    private const val K_AS = "kAs"
    private const val K_IS = "kIs"
    private val CAST_OPERATORS = setOf(K_AS, K_IS)

    /**
     * Delphi reserved words that appear in generic constraint position but are constraint
     * markers, not type references. tree-sitter-pascal 0.10.2 wraps them in a `typeref`
     * (e.g. `TFoo<T: class>` parses as `typeref → identifier "class"`), so we filter by
     * name to avoid surfacing them as used types.
     */
    private val GENERIC_CONSTRAINT_KEYWORDS = setOf("class", "constructor", "record", "interface", "object")

    /**
     * Pascal reserved identifiers that look like types (uppercase-first) but never are.
     * `Self` is the implicit-receiver keyword (Java's `this`); `Result` is the implicit
     * return variable inside a function body. Filtering them here keeps the method-call /
     * constructor-call heuristic from over-reporting them as used types.
     */
    private val PASCAL_RESERVED_RECEIVERS = setOf("Self", "Result")

    private val ALL_NODE_TYPES = setOf(
        DECL_CLASS, DECL_INTF, DECL_HELPER,
        DECL_PROC, DEF_PROC, DECL_ARG,
        DECL_FIELD, DECL_VAR, DECL_CONST, DECL_PROP,
        EXPR_CALL, EXPR_DOT, EXPR_BINARY,
        RTTI_ATTRIBUTES, GENERIC_TPL
    )

    fun extract(declaration: TSNode, sourceCode: String): Set<UsedType> = extractFromRoots(listOf(declaration), sourceCode)

    /**
     * Aggregates used types across multiple AST roots.
     *
     * Used when a declaration's implementation is split across sibling nodes —
     * most notably Delphi classes whose method bodies live in `defProc` nodes
     * under the `implementation` section while the class shape lives in a
     * `declType` under `interface`.
     */
    fun extractFromRoots(roots: List<TSNode>, sourceCode: String): Set<UsedType> {
        val buckets = mergeBuckets(roots)

        val inheritance = extractInheritance(buckets, sourceCode)
        val parameters = extractWrappedTypes(buckets, DECL_ARG, sourceCode)
        val returnTypes = extractReturnTypes(buckets, sourceCode)
        val fieldTypes = extractWrappedTypes(buckets, DECL_FIELD, sourceCode)
        val propertyTypes = extractWrappedTypes(buckets, DECL_PROP, sourceCode)
        val constTypes = extractWrappedTypes(buckets, DECL_CONST, sourceCode)
        val variableTypes = extractWrappedTypes(buckets, DECL_VAR, sourceCode)
        val constructorCalls = extractConstructorCalls(buckets, sourceCode)
        val methodCalls = extractMethodCalls(buckets, sourceCode)
        val castTypes = extractCastTypes(buckets, sourceCode)
        val attributeTypes = extractAttributeTypes(buckets, sourceCode)
        val genericConstraintTypes = extractGenericConstraintTypes(buckets, sourceCode)

        return (
            inheritance +
                fieldTypes + propertyTypes + constTypes + variableTypes +
                parameters + returnTypes +
                attributeTypes +
                constructorCalls + methodCalls +
                castTypes + genericConstraintTypes
        ).filter { it.name.isNotBlank() }
            .map { nonBlankGenerics(it) }
            .toSet()
    }

    private fun mergeBuckets(roots: List<TSNode>): Map<String, List<TSNode>> {
        if (roots.size == 1) {
            return TreeTraversal.findAllDescendantsGroupedByType(roots.first(), ALL_NODE_TYPES)
        }
        val merged = linkedMapOf<String, MutableList<TSNode>>()
        roots.forEach { root ->
            TreeTraversal.findAllDescendantsGroupedByType(root, ALL_NODE_TYPES).forEach { (type, nodes) ->
                merged.getOrPut(type) { mutableListOf() } += nodes
            }
        }
        return merged
    }

    private fun nonBlankGenerics(type: UsedType): UsedType {
        if (type.genericTypes.isEmpty()) return type
        val filtered = type.genericTypes.filter { it.name.isNotBlank() }.map { nonBlankGenerics(it) }
        return UsedType(name = type.name, genericTypes = filtered)
    }

    /**
     * The `parent` field on declClass/declIntf/declHelper is multi-valued, so we iterate the
     * container's direct children and pick every `typeref`. declHelper's helped type is also
     * a direct `typeref` child (reached via `kFor typeref`); capturing it too is acceptable —
     * it is a type used in the declaration.
     */
    private fun extractInheritance(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val containers = buckets[DECL_CLASS].orEmpty() + buckets[DECL_INTF].orEmpty() + buckets[DECL_HELPER].orEmpty()
        return containers.flatMap { container ->
            container
                .children()
                .filter { it.type == TYPEREF }
                .mapNotNull { TyperefResolver.toUsedType(it, sourceCode) }
                .toList()
        }
    }

    /**
     * Shared helper for declarations whose declared type lives on a `[type]` field that
     * wraps the actual `typeref` (or `declArray` / `declSet`) — `declArg`, `declField`,
     * `declVar`, `declConst`, `declProp`. The wrapper unwrapping (including nested
     * array-of-array shapes) is handled by [TyperefResolver.fromTypeWrapper].
     */
    private fun extractWrappedTypes(buckets: Map<String, List<TSNode>>, nodeType: String, sourceCode: String): List<UsedType> =
        buckets[nodeType].orEmpty().mapNotNull {
            TyperefResolver.fromTypeWrapper(it.getChildByFieldName(TYPE_FIELD), sourceCode)
        }

    private fun extractReturnTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val declProcReturns = buckets[DECL_PROC].orEmpty().mapNotNull { declProc ->
            TyperefResolver.fromTypeWrapperOrTyperef(declProc.getChildByFieldName(TYPE_FIELD), sourceCode)
        }
        val defProcReturns = buckets[DEF_PROC].orEmpty().mapNotNull { defProc ->
            val header = defProc.getChildByFieldName(HEADER_FIELD)
            if (header.isNull) null else TyperefResolver.fromTypeWrapperOrTyperef(header.getChildByFieldName(TYPE_FIELD), sourceCode)
        }
        return declProcReturns + defProcReturns
    }

    private fun extractConstructorCalls(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[EXPR_CALL].orEmpty().mapNotNull { callNode ->
            val entity = callNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull || entity.type != EXPR_DOT) return@mapNotNull null
            val rhs = entity.getChildByFieldName(RHS_FIELD)
            if (rhs.isNull || rhs.type != IDENTIFIER) return@mapNotNull null
            if (TreeTraversal.getNodeText(rhs, sourceCode) != CONSTRUCTOR_NAME) return@mapNotNull null
            val lhs = entity.getChildByFieldName(LHS_FIELD)
            expressionToUsedType(lhs, sourceCode)?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    private fun extractMethodCalls(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[EXPR_DOT].orEmpty().mapNotNull { dotNode ->
            // Exclude receivers that belong to a constructor call captured above.
            val parent = dotNode.parent
            if (!parent.isNull && parent.type == EXPR_CALL) {
                val rhs = dotNode.getChildByFieldName(RHS_FIELD)
                if (!rhs.isNull && rhs.type == IDENTIFIER && TreeTraversal.getNodeText(rhs, sourceCode) == CONSTRUCTOR_NAME) {
                    return@mapNotNull null
                }
            }
            val lhs = dotNode.getChildByFieldName(LHS_FIELD)
            expressionToUsedType(lhs, sourceCode)?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    /**
     * A method/constructor-call receiver is treated as a potential type reference when its
     * first character is uppercase. Pascal-specific reserved identifiers (`Self`, `Result`)
     * pass that check but are never user types, so we filter them here.
     */
    private fun isPotentialTypeReceiver(name: String): Boolean {
        if (name.firstOrNull()?.isUpperCase() != true) return false
        return name !in PASCAL_RESERVED_RECEIVERS
    }

    /**
     * For call / dot receivers the LHS can be an identifier, another exprDot, an exprCall,
     * or an exprTpl (generic invocation like `TList<string>`). We want the left-most identifier
     * (the head of the chain), which is treated as a type when its first letter is uppercase.
     */
    private fun expressionToUsedType(node: TSNode, sourceCode: String): UsedType? {
        if (node.isNull) return null
        return when (node.type) {
            IDENTIFIER -> UsedType(name = TreeTraversal.getNodeText(node, sourceCode).trim())
            EXPR_DOT -> expressionToUsedType(node.getChildByFieldName(LHS_FIELD), sourceCode)
            EXPR_CALL, EXPR_TPL -> expressionToUsedType(node.getChildByFieldName(ENTITY_FIELD), sourceCode)
            else -> null
        }
    }

    /**
     * `as` / `is` casts and type-tests parse as `exprBinary` with `[operator]=kAs|kIs`. The
     * RHS is a bare `identifier` (not wrapped in `typeref`), so we read it directly. The
     * uppercase-first heuristic prevents pattern guards like `Foo is nil` from leaking
     * non-types into usedTypes.
     */
    private fun extractCastTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[EXPR_BINARY].orEmpty().mapNotNull { binary ->
            val operator = binary.getChildByFieldName(OPERATOR_FIELD)
            if (operator.isNull || operator.type !in CAST_OPERATORS) return@mapNotNull null
            val rhs = binary.getChildByFieldName(RHS_FIELD)
            if (rhs.isNull) return@mapNotNull null
            val candidate = when (rhs.type) {
                IDENTIFIER -> UsedType(name = TreeTraversal.getNodeText(rhs, sourceCode).trim())
                TYPEREF -> TyperefResolver.toUsedType(rhs, sourceCode)
                else -> null
            }
            candidate?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    /**
     * RTTI attributes (`[Inject]`, `[SomeAttr('x', 1)]`) live on `rttiAttributes` nodes
     * attached to `declType` (class-level) or `declProc` (member-level). Each named child
     * is either a bare `identifier` or an `exprCall(entity=identifier, args=...)`. We
     * surface the attribute name only — argument types are intentionally not captured
     * (mirrors Java/Kotlin/C#).
     */
    private fun extractAttributeTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[RTTI_ATTRIBUTES].orEmpty().flatMap { attributes ->
            attributes
                .namedChildren()
                .mapNotNull { attribute ->
                    val nameNode = when (attribute.type) {
                        IDENTIFIER -> attribute
                        EXPR_CALL -> attribute.getChildByFieldName(ENTITY_FIELD).takeIf { !it.isNull && it.type == IDENTIFIER }
                        else -> null
                    } ?: return@mapNotNull null
                    val name = TreeTraversal.getNodeText(nameNode, sourceCode).trim()
                    if (name.isBlank()) null else UsedType(name = name)
                }.toList()
        }

    /**
     * Generic type-parameter constraints (`TFoo<T: TBase> = class`) parse as
     * `genericTpl(args=genericArgs(genericArg(name=…, type=…)))`. The `[type]` field
     * actually carries multiple children in tree-sitter-pascal — both the `:` punctuation
     * and the constraint itself — so [TSNode.getChildByFieldName] would return the `:`
     * token first. We walk named children instead and pick the first `typeref` (or `type`
     * wrapper that contains a `typeref`/`declArray`/`declSet`) per genericArg. Multi-
     * constraint (`<T: A, B>`) drops everything past the first into ERROR siblings —
     * strict capture is documented in `KNOWN_ISSUES.md`. Keyword constraints
     * (`<T: class>`) emit no `typeref` so we silently skip.
     */
    private fun extractGenericConstraintTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[GENERIC_TPL].orEmpty().flatMap { genericTpl ->
            val args = genericTpl.getChildByFieldName(ARGS_FIELD)
            if (args.isNull || args.type != GENERIC_ARGS) return@flatMap emptyList()
            args
                .children()
                .filter { it.type == GENERIC_ARG }
                .mapNotNull { genericArg ->
                    genericArg
                        .namedChildren()
                        .mapNotNull { child ->
                            when (child.type) {
                                TYPEREF -> TyperefResolver.toUsedType(child, sourceCode)
                                TYPE_FIELD -> TyperefResolver.fromTypeWrapper(child, sourceCode)
                                else -> null
                            }
                        }.firstOrNull { it.name !in GENERIC_CONSTRAINT_KEYWORDS }
                }.toList()
        }
}
