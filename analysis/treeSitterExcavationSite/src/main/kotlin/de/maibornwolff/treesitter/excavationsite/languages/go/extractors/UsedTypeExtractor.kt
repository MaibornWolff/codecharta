package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a Go declaration refers to. A function contributes, in this order: its parameter types, its result
 * types, the methods it calls through a selector, the functions it calls directly and the types it qualifies with a
 * package. Every declaration then contributes all type identifiers and qualified types below it, a qualified type
 * both as written (`http.Client`) and by its name. Called functions count as used types because a call across
 * packages is how one Go file depends on another without naming a type.
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
        val relevantNodes = TreeTraversal.findAllDescendantsOfType(declaration, *RELEVANT_TYPES.toTypedArray())
        val typeReferences = relevantNodes.filter { it.type in TYPE_REFERENCES }.map { it.text }
        val isFunction = declaration.type in FUNCTION_TYPES
        val names = if (isFunction) namesUsedByFunction(declaration, relevantNodes) + typeReferences else typeReferences
        return names.mapTo(LinkedHashSet()) { UsedType(it) }
    }

    private fun namesUsedByFunction(function: SyntaxNode, relevantNodes: List<SyntaxNode>): List<String> {
        val nodesByType = relevantNodes.groupBy { it.type }
        val calls = nodesByType[CALL_EXPRESSION].orEmpty()
        return parameterTypeNames(nodesByType[PARAMETER_DECLARATION].orEmpty()) +
            resultTypeNames(function, nodesByType) +
            calledMethodNames(calls) +
            calledFunctionNames(calls) +
            namesOfPackageQualifiedTypes(nodesByType[QUALIFIED_TYPE].orEmpty())
    }

    private fun parameterTypeNames(parameters: List<SyntaxNode>): List<String> =
        parameters.mapNotNull { parameterTypeName(it) }.filter { it.isNotEmpty() }

    private fun parameterTypeName(parameter: SyntaxNode): String? = parameter.children().firstNotNullOfOrNull { child ->
        when (child.type) {
            TYPE_IDENTIFIER -> child.text
            QUALIFIED_TYPE -> child.getChildByFieldName(NAME_FIELD).orNull()?.text
            POINTER_TYPE -> pointedAtTypeIdentifier(child)
            else -> null
        }
    }

    private fun resultTypeNames(function: SyntaxNode, nodesByType: Map<String, List<SyntaxNode>>): List<String> {
        val nestedFunctions = nodesByType[FUNCTION_DECLARATION].orEmpty() + nodesByType[METHOD_DECLARATION].orEmpty()
        val functionsBeforeMethods = (listOf(function) + nestedFunctions).sortedBy { it.type == METHOD_DECLARATION }
        return functionsBeforeMethods.mapNotNull { it.getChildByFieldName(RESULT_FIELD).orNull() }.flatMap { typeNamesOf(it) }
    }

    private fun typeNamesOf(type: SyntaxNode): List<String> = when (type.type) {
        TYPE_IDENTIFIER -> listOf(type.text)
        QUALIFIED_TYPE -> listOfNotNull(type.getChildByFieldName(NAME_FIELD).orNull()?.text)
        POINTER_TYPE -> type.namedChildren().firstOrNull()?.let { typeNamesOf(it) }.orEmpty()
        PARENTHESIZED_TYPE -> type.namedChildren().flatMap { typeNamesOf(it) }.toList()
        else -> emptyList()
    }

    private fun calledMethodNames(calls: List<SyntaxNode>): List<String> = calls
        .mapNotNull { call -> call.fieldOfType(FUNCTION_FIELD, SELECTOR_EXPRESSION) }
        .mapNotNull { selector -> selector.fieldOfType(FIELD_FIELD, FIELD_IDENTIFIER) }
        .let { methodNames -> textsInSourceOrder(methodNames) }
        .filter { it.isNotEmpty() }

    private fun calledFunctionNames(calls: List<SyntaxNode>): List<String> = calls
        .mapNotNull { call -> call.fieldOfType(FUNCTION_FIELD, IDENTIFIER)?.text }
        .filter { it.isNotEmpty() }

    private fun namesOfPackageQualifiedTypes(qualifiedTypes: List<SyntaxNode>): List<String> = qualifiedTypes
        .filter { qualifiedType -> qualifiedType.fieldOfType(PACKAGE_FIELD, PACKAGE_IDENTIFIER) != null }
        .mapNotNull { qualifiedType -> qualifiedType.fieldOfType(NAME_FIELD, TYPE_IDENTIFIER) }
        .let { names -> textsInSourceOrder(names) }

    // The names stand behind what they belong to, so the outer of two nested nodes has the later name: `a.B().C()`
    // yields B before C although the call of C is the outer node
    private fun textsInSourceOrder(names: List<SyntaxNode>): List<String> = names
        .map { name -> name.startByte to name.text }
        .sortedBy { (startByte, _) -> startByte }
        .map { (_, text) -> text }
}
