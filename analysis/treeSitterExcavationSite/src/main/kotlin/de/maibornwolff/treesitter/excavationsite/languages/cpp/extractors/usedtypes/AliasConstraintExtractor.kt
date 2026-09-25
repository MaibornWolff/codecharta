package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object AliasConstraintExtractor {
    private const val TYPE_DEFINITION = "type_definition"
    private const val ALIAS_DECLARATION = "alias_declaration"
    private const val TEMPLATE_DECLARATION = "template_declaration"
    private const val REQUIRES_CLAUSE = "requires_clause"
    private const val CONSTRAINT_FIELD = "constraint"
    private const val CONSTRAINT_DISJUNCTION = "constraint_disjunction"
    private const val CONSTRAINT_CONJUNCTION = "constraint_conjunction"
    private const val LEFT_FIELD = "left"
    private const val RIGHT_FIELD = "right"

    val nodeTypes: Set<String> = setOf(TYPE_DEFINITION, ALIAS_DECLARATION)

    fun extractAliasTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        (buckets[TYPE_DEFINITION].orEmpty() + buckets[ALIAS_DECLARATION].orEmpty())
            .mapNotNull { CppTypeHelper.extractTypeFromTypeField(it, sourceCode) }

    fun extractConstraintTypes(declaration: TSNode, sourceCode: String): List<UsedType> {
        val parent = declaration.parent
        if (parent.isNull || parent.type != TEMPLATE_DECLARATION) return emptyList()
        val requiresClause = parent.children().firstOrNull { it.type == REQUIRES_CLAUSE } ?: return emptyList()
        val constraint = requiresClause.getChildByFieldName(CONSTRAINT_FIELD).takeIf { !it.isNull } ?: return emptyList()
        return collectConstraintTypes(constraint, sourceCode)
    }

    private fun collectConstraintTypes(node: TSNode, sourceCode: String): List<UsedType> {
        if (node.type == CONSTRAINT_DISJUNCTION || node.type == CONSTRAINT_CONJUNCTION) {
            val left = node.getChildByFieldName(LEFT_FIELD).takeIf { !it.isNull }
            val right = node.getChildByFieldName(RIGHT_FIELD).takeIf { !it.isNull }
            return listOfNotNull(left, right).flatMap { collectConstraintTypes(it, sourceCode) }
        }
        if (CppTypeHelper.isTypeNode(node)) {
            return listOfNotNull(CppTypeHelper.extractType(node, sourceCode))
        }
        return node
            .namedChildren()
            .filter { CppTypeHelper.isTypeNode(it) }
            .mapNotNull { CppTypeHelper.extractType(it, sourceCode) }
            .toList()
    }
}
