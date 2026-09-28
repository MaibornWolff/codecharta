package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.treesitter.TSNode

internal object DeclarationTypeExtractor {
    private const val FIELD_DECLARATION = "field_declaration"
    private const val DECLARATION = "declaration"
    private const val CAST_EXPRESSION = "cast_expression"
    private const val SIZEOF_EXPRESSION = "sizeof_expression"
    private const val ALIGNOF_EXPRESSION = "alignof_expression"

    private val TYPE_OPERAND_EXPRESSIONS = setOf(SIZEOF_EXPRESSION, ALIGNOF_EXPRESSION)

    val nodeTypes: Set<String> = setOf(
        FIELD_DECLARATION,
        DECLARATION,
        CAST_EXPRESSION,
        SIZEOF_EXPRESSION,
        ALIGNOF_EXPRESSION
    )

    fun extractFieldAndVariableTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        (buckets[FIELD_DECLARATION].orEmpty() + buckets[DECLARATION].orEmpty())
            .mapNotNull { CppTypeHelper.extractTypeFromTypeField(it, sourceCode) }

    fun extractCStyleCasts(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[CAST_EXPRESSION].orEmpty().mapNotNull { CppTypeHelper.extractTypeFromTypeField(it, sourceCode) }

    fun extractTypeOperandTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> = TYPE_OPERAND_EXPRESSIONS
        .flatMap { buckets[it].orEmpty() }
        .mapNotNull { CppTypeHelper.extractTypeFromTypeField(it, sourceCode) }
}
