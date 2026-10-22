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
 *
 * A name written behind a selector on a plain name (`http.Client`, `util.New()`) carries that name as its
 * [UsedType.namespacePrefix], which may be an import or a value. A method called on anything else (`a.b.C()`,
 * `x().M()`) is a method of a value whose type is not inferred, so it is left out.
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
    private const val OPERAND_FIELD = "operand"

    private val FUNCTION_TYPES = setOf(FUNCTION_DECLARATION, METHOD_DECLARATION)
    private val TYPE_REFERENCES = setOf(TYPE_IDENTIFIER, QUALIFIED_TYPE)
    private val RELEVANT_TYPES = FUNCTION_TYPES + TYPE_REFERENCES + PARAMETER_DECLARATION + CALL_EXPRESSION

    fun extract(declaration: SyntaxNode): Set<UsedType> {
        val relevantNodes = TreeTraversal.findAllDescendantsOfType(declaration, *RELEVANT_TYPES.toTypedArray())
        val typeReferences = relevantNodes.filter { it.type in TYPE_REFERENCES }.map { typeReference(it) }
        val isFunction = declaration.type in FUNCTION_TYPES
        val usedTypes = if (isFunction) namesUsedByFunction(declaration, relevantNodes) + typeReferences else typeReferences
        return usedTypes.toCollection(LinkedHashSet())
    }

    // A qualified type itself stays as written; its name inside it carries the package
    private fun typeReference(node: SyntaxNode): UsedType = if (node.type == TYPE_IDENTIFIER) qualifiedName(node) else UsedType(node.text)

    /** The name with the package written before it, when its parent is a qualified type. */
    private fun qualifiedName(name: SyntaxNode): UsedType {
        val qualifiedType = name.parent.orNull()?.takeIf { it.type == QUALIFIED_TYPE } ?: return UsedType(name.text)
        val packageName = qualifiedType.fieldOfType(PACKAGE_FIELD, PACKAGE_IDENTIFIER) ?: return UsedType(name.text)
        return UsedType(name.text, namespacePrefix = listOf(packageName.text))
    }

    private fun namesUsedByFunction(function: SyntaxNode, relevantNodes: List<SyntaxNode>): List<UsedType> {
        val nodesByType = relevantNodes.groupBy { it.type }
        val calls = nodesByType[CALL_EXPRESSION].orEmpty()
        return parameterTypeNames(nodesByType[PARAMETER_DECLARATION].orEmpty()) +
            resultTypeNames(function, nodesByType) +
            calledMethodNames(calls) +
            calledFunctionNames(calls) +
            namesOfPackageQualifiedTypes(nodesByType[QUALIFIED_TYPE].orEmpty())
    }

    private fun parameterTypeNames(parameters: List<SyntaxNode>): List<UsedType> =
        parameters.mapNotNull { parameterTypeName(it) }.filter { it.name.isNotEmpty() }

    private fun parameterTypeName(parameter: SyntaxNode): UsedType? = parameter.children().firstNotNullOfOrNull { child ->
        when (child.type) {
            TYPE_IDENTIFIER -> UsedType(child.text)
            QUALIFIED_TYPE -> child.getChildByFieldName(NAME_FIELD).orNull()?.let { qualifiedName(it) }
            POINTER_TYPE -> pointedAtTypeIdentifier(child)?.let { UsedType(it) }
            else -> null
        }
    }

    private fun resultTypeNames(function: SyntaxNode, nodesByType: Map<String, List<SyntaxNode>>): List<UsedType> {
        val nestedFunctions = nodesByType[FUNCTION_DECLARATION].orEmpty() + nodesByType[METHOD_DECLARATION].orEmpty()
        val functionsBeforeMethods = (listOf(function) + nestedFunctions).sortedBy { it.type == METHOD_DECLARATION }
        return functionsBeforeMethods.mapNotNull { it.getChildByFieldName(RESULT_FIELD).orNull() }.flatMap { typeNamesOf(it) }
    }

    private fun typeNamesOf(type: SyntaxNode): List<UsedType> = when (type.type) {
        TYPE_IDENTIFIER -> listOf(UsedType(type.text))
        QUALIFIED_TYPE -> listOfNotNull(type.getChildByFieldName(NAME_FIELD).orNull()?.let { qualifiedName(it) })
        POINTER_TYPE -> type.namedChildren().firstOrNull()?.let { typeNamesOf(it) }.orEmpty()
        PARENTHESIZED_TYPE -> type.namedChildren().flatMap { typeNamesOf(it) }.toList()
        else -> emptyList()
    }

    private fun calledMethodNames(calls: List<SyntaxNode>): List<UsedType> = calls
        .mapNotNull { call -> call.fieldOfType(FUNCTION_FIELD, SELECTOR_EXPRESSION) }
        .filter { selector -> selector.fieldOfType(OPERAND_FIELD, IDENTIFIER) != null }
        .mapNotNull { selector -> selector.fieldOfType(FIELD_FIELD, FIELD_IDENTIFIER) }
        .let { methodNames -> inSourceOrder(methodNames) }
        .filter { it.text.isNotEmpty() }
        .map { methodName -> calledThroughPlainName(methodName) }

    private fun calledThroughPlainName(methodName: SyntaxNode): UsedType {
        val qualifier = methodName.parent.getChildByFieldName(OPERAND_FIELD).text
        return UsedType(methodName.text, namespacePrefix = listOf(qualifier))
    }

    private fun calledFunctionNames(calls: List<SyntaxNode>): List<UsedType> = calls
        .mapNotNull { call -> call.fieldOfType(FUNCTION_FIELD, IDENTIFIER)?.text }
        .filter { it.isNotEmpty() }
        .map { UsedType(it) }

    private fun namesOfPackageQualifiedTypes(qualifiedTypes: List<SyntaxNode>): List<UsedType> = qualifiedTypes
        .filter { qualifiedType -> qualifiedType.fieldOfType(PACKAGE_FIELD, PACKAGE_IDENTIFIER) != null }
        .mapNotNull { qualifiedType -> qualifiedType.fieldOfType(NAME_FIELD, TYPE_IDENTIFIER) }
        .let { names -> inSourceOrder(names) }
        .map { qualifiedName(it) }

    // The names stand behind what they belong to, so the outer of two nested nodes has the later name: `a.B().C()`
    // yields B before C although the call of C is the outer node
    private fun inSourceOrder(names: List<SyntaxNode>): List<SyntaxNode> = names.sortedBy { it.startByte }
}
