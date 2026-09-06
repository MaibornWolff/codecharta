package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object SignatureTypeExtractor {
    private const val BASE_CLASS_CLAUSE = "base_class_clause"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val PARAMETER_LIST = "parameter_list"
    private const val PARAMETER_DECLARATION = "parameter_declaration"
    private const val TRAILING_RETURN_TYPE = "trailing_return_type"
    private const val TYPE_DESCRIPTOR = "type_descriptor"

    val nodeTypes: Set<String> = setOf(BASE_CLASS_CLAUSE, FUNCTION_DEFINITION, FUNCTION_DECLARATOR)

    fun extractInheritance(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[BASE_CLASS_CLAUSE].orEmpty().flatMap { baseClause ->
            baseClause
                .namedChildren()
                .filter { CppTypeHelper.isTypeNode(it) }
                .mapNotNull { CppTypeHelper.extractType(it, sourceCode) }
                .toList()
        }

    fun extractMethodReturnAndParamTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[FUNCTION_DEFINITION].orEmpty().flatMap { fnDef ->
            val leadingReturnType = fnDef
                .children()
                .takeWhile { it.type != FUNCTION_DECLARATOR }
                .firstOrNull { CppTypeHelper.isTypeNode(it) }
                ?.let { CppTypeHelper.extractType(it, sourceCode) }
            val fnDeclarator = fnDef.children().firstOrNull { it.type == FUNCTION_DECLARATOR }
            val paramTypes = fnDeclarator?.let { extractParameterTypes(it, sourceCode) } ?: emptyList()
            val trailingReturnType = fnDeclarator?.let { extractTrailingReturnType(it, sourceCode) }
            paramTypes + listOfNotNull(leadingReturnType, trailingReturnType)
        }

    fun extractDeclaratorParamTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[FUNCTION_DECLARATOR].orEmpty().flatMap { extractParameterTypes(it, sourceCode) }

    private fun extractParameterTypes(fnDeclarator: TSNode, sourceCode: String): List<UsedType> {
        val paramList = fnDeclarator.children().firstOrNull { it.type == PARAMETER_LIST } ?: return emptyList()
        return paramList
            .children()
            .filter { it.type == PARAMETER_DECLARATION }
            .mapNotNull { param ->
                val typeNode = param.children().firstOrNull { CppTypeHelper.isTypeNode(it) }
                typeNode?.let { CppTypeHelper.extractType(it, sourceCode) }
            }.toList()
    }

    private fun extractTrailingReturnType(fnDeclarator: TSNode, sourceCode: String): UsedType? {
        val trailing = fnDeclarator.children().firstOrNull { it.type == TRAILING_RETURN_TYPE } ?: return null
        val typeDescriptor = trailing.children().firstOrNull { it.type == TYPE_DESCRIPTOR } ?: return null
        val typeNode = typeDescriptor.namedChildren().firstOrNull { CppTypeHelper.isTypeNode(it) } ?: return null
        return CppTypeHelper.extractType(typeNode, sourceCode)
    }
}
