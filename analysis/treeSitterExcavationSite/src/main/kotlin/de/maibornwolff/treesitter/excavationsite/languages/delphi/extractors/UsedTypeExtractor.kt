package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object UsedTypeExtractor {
    private const val DECL_CLASS = "declClass"
    private const val DECL_INTF = "declIntf"
    private const val DECL_HELPER = "declHelper"

    private const val DECL_PROC = "declProc"
    private const val DEF_PROC = "defProc"
    private const val DECL_ARG = "declArg"
    private const val DECL_FIELD = "declField"
    private const val DECL_VAR = "declVar"
    private const val DECL_CONST = "declConst"
    private const val DECL_PROP = "declProp"

    private const val TYPE_FIELD = "type"
    private const val HEADER_FIELD = "header"

    private const val EXPR_CALL = "exprCall"
    private const val EXPR_DOT = "exprDot"
    private const val EXPR_TPL = "exprTpl"
    private const val EXPR_BINARY = "exprBinary"
    private const val ENTITY_FIELD = "entity"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val OPERATOR_FIELD = "operator"

    private const val RTTI_ATTRIBUTES = "rttiAttributes"

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

    // tree-sitter-pascal 0.10.2 wraps these constraint keywords (`TFoo<T: class>`) in a typeref.
    private val GENERIC_CONSTRAINT_KEYWORDS = setOf("class", "constructor", "record", "interface", "object")

    private val PASCAL_RESERVED_RECEIVERS = setOf("Self", "Result")

    private val ALL_NODE_TYPES = setOf(
        DECL_CLASS, DECL_INTF, DECL_HELPER,
        DECL_PROC, DEF_PROC, DECL_ARG,
        DECL_FIELD, DECL_VAR, DECL_CONST, DECL_PROP,
        EXPR_CALL, EXPR_DOT, EXPR_BINARY,
        RTTI_ATTRIBUTES, GENERIC_TPL
    )

    fun extract(declaration: SyntaxNode): Set<UsedType> = extractFromRoots(listOf(declaration))

    // Several roots because Delphi method bodies (`defProc` in `implementation`) live apart from the class.
    fun extractFromRoots(roots: List<SyntaxNode>): Set<UsedType> {
        val buckets = mergeBuckets(roots)

        val inheritance = extractInheritance(buckets)
        val parameters = extractWrappedTypes(buckets, DECL_ARG)
        val returnTypes = extractReturnTypes(buckets)
        val fieldTypes = extractWrappedTypes(buckets, DECL_FIELD)
        val propertyTypes = extractWrappedTypes(buckets, DECL_PROP)
        val constTypes = extractWrappedTypes(buckets, DECL_CONST)
        val variableTypes = extractWrappedTypes(buckets, DECL_VAR)
        val constructorCalls = extractConstructorCalls(buckets)
        val methodCalls = extractMethodCalls(buckets)
        val castTypes = extractCastTypes(buckets)
        val attributeTypes = extractAttributeTypes(buckets)
        val genericConstraintTypes = extractGenericConstraintTypes(buckets)

        // Kotlin's order (inheritance, data, callable, annotations, calls); the data block grows by Delphi's
        // field/const/var, and the Delphi-only cast and generic-constraint types go last.
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

    private fun mergeBuckets(roots: List<SyntaxNode>): Map<String, List<SyntaxNode>> {
        if (roots.size == 1) {
            return TreeTraversal.findAllDescendantsGroupedByType(roots.first(), ALL_NODE_TYPES)
        }
        val merged = linkedMapOf<String, MutableList<SyntaxNode>>()
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

    // `parent` is multi-valued, so every typeref child counts; a helper's `for` type is one of them, deliberately.
    private fun extractInheritance(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        val containers = buckets[DECL_CLASS].orEmpty() + buckets[DECL_INTF].orEmpty() + buckets[DECL_HELPER].orEmpty()
        return containers.flatMap { container ->
            container
                .children()
                .filter { it.type == TYPEREF }
                .mapNotNull { TyperefResolver.toUsedType(it) }
                .toList()
        }
    }

    private fun extractWrappedTypes(buckets: Map<String, List<SyntaxNode>>, nodeType: String): List<UsedType> =
        buckets[nodeType].orEmpty().mapNotNull {
            TyperefResolver.fromTypeWrapper(it.getChildByFieldName(TYPE_FIELD))
        }

    private fun extractReturnTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        val declProcReturns = buckets[DECL_PROC].orEmpty().mapNotNull { declProc ->
            TyperefResolver.fromTypeWrapperOrTyperef(declProc.getChildByFieldName(TYPE_FIELD))
        }
        val defProcReturns = buckets[DEF_PROC].orEmpty().mapNotNull { defProc ->
            val header = defProc.getChildByFieldName(HEADER_FIELD)
            if (header.isNull) null else TyperefResolver.fromTypeWrapperOrTyperef(header.getChildByFieldName(TYPE_FIELD))
        }
        return declProcReturns + defProcReturns
    }

    private fun extractConstructorCalls(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[EXPR_CALL].orEmpty().mapNotNull { callNode ->
            val entity = callNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull || entity.type != EXPR_DOT) return@mapNotNull null
            if (!isConstructorName(entity.getChildByFieldName(RHS_FIELD))) return@mapNotNull null
            val lhs = entity.getChildByFieldName(LHS_FIELD)
            chainHeadToUsedType(lhs)?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    private fun extractMethodCalls(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[EXPR_DOT].orEmpty().mapNotNull { dotNode ->
            if (isConstructorCallReceiver(dotNode)) return@mapNotNull null
            val lhs = dotNode.getChildByFieldName(LHS_FIELD)
            chainHeadToUsedType(lhs)?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    private fun isConstructorCallReceiver(dotNode: SyntaxNode): Boolean {
        val parent = dotNode.parent
        return !parent.isNull && parent.type == EXPR_CALL && isConstructorName(dotNode.getChildByFieldName(RHS_FIELD))
    }

    private fun isConstructorName(node: SyntaxNode): Boolean = !node.isNull && node.type == IDENTIFIER && node.text == CONSTRUCTOR_NAME

    private fun isPotentialTypeReceiver(name: String): Boolean {
        if (name.firstOrNull()?.isUpperCase() != true) return false
        return name !in PASCAL_RESERVED_RECEIVERS
    }

    private fun chainHeadToUsedType(node: SyntaxNode): UsedType? {
        if (node.isNull) return null
        return when (node.type) {
            IDENTIFIER -> UsedType(name = node.text.trim())
            EXPR_DOT -> chainHeadToUsedType(node.getChildByFieldName(LHS_FIELD))
            EXPR_CALL, EXPR_TPL -> chainHeadToUsedType(node.getChildByFieldName(ENTITY_FIELD))
            else -> null
        }
    }

    // The uppercase check keeps type-test guards like `Foo is nil` out.
    private fun extractCastTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[EXPR_BINARY].orEmpty().mapNotNull { binary ->
            val operator = binary.getChildByFieldName(OPERATOR_FIELD)
            if (operator.isNull || operator.type !in CAST_OPERATORS) return@mapNotNull null
            val rhs = binary.getChildByFieldName(RHS_FIELD)
            if (rhs.isNull) return@mapNotNull null
            val candidate = when (rhs.type) {
                IDENTIFIER -> UsedType(name = rhs.text.trim())
                TYPEREF -> TyperefResolver.toUsedType(rhs)
                else -> null
            }
            candidate?.takeIf { isPotentialTypeReceiver(it.name) }
        }

    // Only the attribute name counts, not its argument types, as in Java, Kotlin and C#.
    private fun extractAttributeTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[RTTI_ATTRIBUTES].orEmpty().flatMap { attributes ->
            attributes
                .namedChildren()
                .mapNotNull { attribute ->
                    val name = attributeNameNode(attribute)?.text?.trim() ?: return@mapNotNull null
                    if (name.isBlank()) null else UsedType(name = name)
                }.toList()
        }

    private fun attributeNameNode(attribute: SyntaxNode): SyntaxNode? = when (attribute.type) {
        IDENTIFIER -> attribute
        EXPR_CALL -> attribute.getChildByFieldName(ENTITY_FIELD).takeIf { !it.isNull && it.type == IDENTIFIER }
        else -> null
    }

    private fun extractGenericConstraintTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[GENERIC_TPL].orEmpty().flatMap { genericTpl ->
            val args = genericTpl.getChildByFieldName(ARGS_FIELD)
            if (args.isNull || args.type != GENERIC_ARGS) return@flatMap emptyList()
            args
                .children()
                .filter { it.type == GENERIC_ARG }
                .mapNotNull { firstConstraintType(it) }
                .toList()
        }

    // The `[type]` field also holds the `:` token, so getChildByFieldName would return that instead of the
    // constraint. tree-sitter-pascal drops all but the first of `<T: A, B>` into ERROR (see KNOWN_ISSUES.md).
    private fun firstConstraintType(genericArg: SyntaxNode): UsedType? = genericArg
        .namedChildren()
        .mapNotNull { child ->
            when (child.type) {
                TYPEREF -> TyperefResolver.toUsedType(child)
                TYPE_FIELD -> TyperefResolver.fromTypeWrapper(child)
                else -> null
            }
        }.firstOrNull { it.name !in GENERIC_CONSTRAINT_KEYWORDS }
}
