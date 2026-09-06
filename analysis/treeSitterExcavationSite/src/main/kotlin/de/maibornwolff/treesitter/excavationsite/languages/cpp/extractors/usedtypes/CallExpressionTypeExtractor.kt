package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object CallExpressionTypeExtractor {
    private const val CALL_EXPRESSION = "call_expression"
    private const val NEW_EXPRESSION = "new_expression"
    private const val THROW_STATEMENT = "throw_statement"
    private const val FIELD_INITIALIZER_LIST = "field_initializer_list"
    private const val FIELD_INITIALIZER = "field_initializer"
    private const val ARGUMENT_LIST = "argument_list"
    private const val INITIALIZER_LIST = "initializer_list"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val TEMPLATE_FUNCTION = "template_function"
    private const val TEMPLATE_ARGUMENT_LIST = "template_argument_list"
    private const val TYPE_DESCRIPTOR = "type_descriptor"
    private const val IDENTIFIER = "identifier"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val FUNCTION_FIELD = "function"
    private const val NAME_FIELD = "name"

    val nodeTypes: Set<String> = setOf(
        CALL_EXPRESSION,
        NEW_EXPRESSION,
        THROW_STATEMENT,
        FIELD_INITIALIZER_LIST
    )

    fun extractInstantiationTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val newTypes = buckets[NEW_EXPRESSION].orEmpty().mapNotNull { CppTypeHelper.extractTypeFromTypeField(it, sourceCode) }
        val throwCallees = buckets[THROW_STATEMENT].orEmpty().mapNotNull { throwStmt ->
            throwStmt.namedChildren().firstOrNull { it.type == CALL_EXPRESSION }
        }
        val callTypes = (buckets[CALL_EXPRESSION].orEmpty() + throwCallees).flatMap { call ->
            val function = call.getChildByFieldName(FUNCTION_FIELD).takeIf { !it.isNull } ?: return@flatMap emptyList()
            val parentType = call.parent.takeIf { !it.isNull }?.type
            val isInThrow = parentType == THROW_STATEMENT
            val isInArgList = parentType == ARGUMENT_LIST
            when (function.type) {
                TEMPLATE_FUNCTION -> {
                    val generics = extractTemplateArgumentTypes(function, sourceCode)
                    if (isInThrow) {
                        val name = function
                            .getChildByFieldName(NAME_FIELD)
                            .takeIf { !it.isNull }
                            ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }
                            .orEmpty()
                        if (name.isEmpty()) generics else generics + UsedType(name = name, genericTypes = generics)
                    } else {
                        generics
                    }
                }

                QUALIFIED_IDENTIFIER -> listOfNotNull(
                    CppTypeHelper.extractRightmostSegment(function, sourceCode),
                    CppTypeHelper.extractSingleSegmentScope(function, sourceCode)
                )
                /*
                Bare-name UsedType for nested-call arg-list and throw-statement contexts:
                mirrors DC's empty-namespace-wildcard fallthrough so a free function used
                as `someCall(helper(...))` or `throw helper(...)` still emits `helper`.
                 */
                IDENTIFIER -> if (isInThrow || isInArgList) {
                    val text = TreeTraversal.getNodeText(function, sourceCode).trim()
                    if (text.isEmpty()) emptyList() else listOf(UsedType(name = text))
                } else {
                    emptyList()
                }

                else -> emptyList()
            }
        }
        return newTypes + callTypes
    }

    fun extractConstructorInitializerTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[FIELD_INITIALIZER_LIST].orEmpty().flatMap { initList ->
            initList
                .namedChildren()
                .filter { it.type == FIELD_INITIALIZER }
                .flatMap { fieldInit ->
                    val argList = fieldInit.namedChildren().firstOrNull { it.type == ARGUMENT_LIST || it.type == INITIALIZER_LIST }
                    if (argList == null) emptySequence() else collectInitializerArgumentTypes(argList, sourceCode)
                }.toList()
        }

    private fun collectInitializerArgumentTypes(argList: TSNode, sourceCode: String): Sequence<UsedType> {
        val isBraceInit = argList.type == INITIALIZER_LIST
        return argList.namedChildren().flatMap { arg ->
            when (arg.type) {
                QUALIFIED_IDENTIFIER ->
                    listOfNotNull(CppTypeHelper.extractSecondToLastSegment(arg, sourceCode)).asSequence()

                CALL_EXPRESSION ->
                    if (isBraceInit) {
                        emptySequence()
                    } else {
                        arg
                            .children()
                            .filter { it.type == QUALIFIED_IDENTIFIER }
                            .mapNotNull { CppTypeHelper.extractSecondToLastSegment(it, sourceCode) }
                    }

                else -> emptySequence()
            }
        }
    }

    private fun extractTemplateArgumentTypes(templateFunction: TSNode, sourceCode: String): List<UsedType> {
        val argList = templateFunction
            .getChildByFieldName(ARGUMENTS_FIELD)
            .takeIf { !it.isNull && it.type == TEMPLATE_ARGUMENT_LIST }
            ?: return emptyList()
        return argList
            .namedChildren()
            .mapNotNull { arg ->
                val inner = if (arg.type == TYPE_DESCRIPTOR) {
                    arg.namedChildren().firstOrNull { CppTypeHelper.isTypeNode(it) }
                } else {
                    arg.takeIf { CppTypeHelper.isTypeNode(it) }
                }
                inner?.let { CppTypeHelper.extractType(it, sourceCode) }
            }.toList()
    }
}
