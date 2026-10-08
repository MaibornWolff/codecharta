package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a Go declaration refers to. A function contributes, in this order: its parameter types, its result
 * types, the functions and methods it calls and the types it qualifies with a package. Every declaration then
 * contributes all type identifiers and qualified types below it, a qualified type both as written (`http.Client`)
 * and by its name. Called functions count as used types because a call across packages is how one Go file depends
 * on another without naming a type.
 */
internal object UsedTypeExtractor {
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val PARAMETER_DECLARATION = "parameter_declaration"
    private const val CALL_EXPRESSION = "call_expression"
    private const val SELECTOR_EXPRESSION = "selector_expression"
    private const val IDENTIFIER = "identifier"
    private const val FIELD_IDENTIFIER = "field_identifier"
    private const val PACKAGE_IDENTIFIER = "package_identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val QUALIFIED_TYPE = "qualified_type"
    private const val POINTER_TYPE = "pointer_type"
    private const val PARENTHESIZED_TYPE = "parenthesized_type"
    private const val RESULT_FIELD = "result"
    private const val FUNCTION_FIELD = "function"
    private const val FIELD_FIELD = "field"
    private const val PACKAGE_FIELD = "package"
    private const val NAME_FIELD = "name"

    private val FUNCTION_TYPES = setOf(FUNCTION_DECLARATION, METHOD_DECLARATION)
    private val TYPE_REFERENCES = setOf(TYPE_IDENTIFIER, QUALIFIED_TYPE)
    private val RELEVANT_TYPES = FUNCTION_TYPES + TYPE_REFERENCES + PARAMETER_DECLARATION + CALL_EXPRESSION

    fun extract(declaration: SyntaxNode): Set<UsedType> {
        val relevantNodes = TreeTraversal.findAllDescendantsOfType(declaration, *RELEVANT_TYPES.toTypedArray()).map { it.type to it }
        val typeReferences = relevantNodes.filter { (type, _) -> type in TYPE_REFERENCES }.map { (_, node) -> node.text }
        val names = if (declaration.type in
            FUNCTION_TYPES
        ) {
            namesUsedByFunction(declaration, relevantNodes) + typeReferences
        } else {
            typeReferences
        }
        return names.mapTo(LinkedHashSet()) { UsedType(it) }
    }

    private fun namesUsedByFunction(function: SyntaxNode, relevantNodes: List<Pair<String, SyntaxNode>>): List<String> {
        val nodesByType = relevantNodes.groupBy({ (type, _) -> type }, { (_, node) -> node })
        val calls = nodesByType[CALL_EXPRESSION].orEmpty()
        val qualifiedTypes = nodesByType[QUALIFIED_TYPE].orEmpty()
        return nodesByType[PARAMETER_DECLARATION].orEmpty().mapNotNull { parameterTypeName(it) } +
            resultTypeNames(function, nodesByType) +
            calledMethodNames(calls) +
            calledFunctionNames(calls) +
            qualifiedTypes.mapNotNull { nameOfPackageQualifiedType(it) }
    }

    private fun parameterTypeName(parameter: SyntaxNode): String? = parameter.children().firstNotNullOfOrNull { child ->
        when (child.type) {
            TYPE_IDENTIFIER -> child.text
            QUALIFIED_TYPE -> child.getChildByFieldName(NAME_FIELD).orNull()?.text
            POINTER_TYPE -> pointedAtTypeIdentifier(child)
            else -> null
        }
    }

    private fun pointedAtTypeIdentifier(pointerType: SyntaxNode): String? =
        pointerType.namedChildren().firstOrNull()?.takeIf { it.type == TYPE_IDENTIFIER }?.text

    private fun resultTypeNames(function: SyntaxNode, nodesByType: Map<String, List<SyntaxNode>>): List<String> =
        FUNCTION_TYPES.flatMap { functionType ->
            val functions = listOf(function).filter { it.type == functionType } + nodesByType[functionType].orEmpty()
            functions.mapNotNull { it.getChildByFieldName(RESULT_FIELD).orNull() }.flatMap { typeNamesOf(it) }
        }

    private fun typeNamesOf(type: SyntaxNode): List<String> = when (type.type) {
        TYPE_IDENTIFIER -> listOf(type.text)
        QUALIFIED_TYPE -> listOfNotNull(type.getChildByFieldName(NAME_FIELD).orNull()?.text)
        POINTER_TYPE -> type.namedChildren().firstOrNull()?.let { typeNamesOf(it) }.orEmpty()
        PARENTHESIZED_TYPE -> type.namedChildren().flatMap { typeNamesOf(it) }.toList()
        else -> emptyList()
    }

    // In the order the method names stand in the source, so `a.B().C()` yields B before C although the call of C
    // is the outer node
    private fun calledMethodNames(calls: List<SyntaxNode>): List<String> = calls
        .mapNotNull { call -> call.getChildByFieldName(FUNCTION_FIELD).orNull()?.takeIf { it.type == SELECTOR_EXPRESSION } }
        .mapNotNull { selector -> selector.getChildByFieldName(FIELD_FIELD).orNull()?.takeIf { it.type == FIELD_IDENTIFIER } }
        .map { methodName -> methodName.startByte to methodName.text }
        .sortedBy { (startByte, _) -> startByte }
        .map { (_, name) -> name }
        .filter { it.isNotEmpty() }

    private fun calledFunctionNames(calls: List<SyntaxNode>): List<String> = calls
        .mapNotNull { call -> call.getChildByFieldName(FUNCTION_FIELD).orNull()?.takeIf { it.type == IDENTIFIER }?.text }
        .filter { it.isNotEmpty() }

    private fun nameOfPackageQualifiedType(qualifiedType: SyntaxNode): String? {
        val packageName = qualifiedType.getChildByFieldName(PACKAGE_FIELD).orNull()
        val name = qualifiedType.getChildByFieldName(NAME_FIELD).orNull()
        if (packageName?.type != PACKAGE_IDENTIFIER || name?.type != TYPE_IDENTIFIER) return null
        return name.text
    }
}
