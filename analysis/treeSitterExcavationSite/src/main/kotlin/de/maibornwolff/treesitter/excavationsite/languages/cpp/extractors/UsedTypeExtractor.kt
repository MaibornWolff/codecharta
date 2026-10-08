package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.AliasConstraintExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CallExpressionTypeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.ClassScopeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.DeclarationTypeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.SignatureTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object UsedTypeExtractor {
    private const val CLASS_SPECIFIER = "class_specifier"
    private const val STRUCT_SPECIFIER = "struct_specifier"
    private const val UNION_SPECIFIER = "union_specifier"
    private const val ENUM_SPECIFIER = "enum_specifier"

    private val DECLARATION_BOUNDARIES = setOf(CLASS_SPECIFIER, STRUCT_SPECIFIER, UNION_SPECIFIER, ENUM_SPECIFIER)

    private val ALL_NODE_TYPES: Set<String> =
        DeclarationTypeExtractor.nodeTypes +
            CallExpressionTypeExtractor.nodeTypes +
            ClassScopeExtractor.nodeTypes +
            SignatureTypeExtractor.nodeTypes +
            AliasConstraintExtractor.nodeTypes

    fun extract(declaration: SyntaxNode): Set<UsedType> {
        val buckets = groupDescendantsStoppingAtNestedDeclarations(declaration, ALL_NODE_TYPES)
        return (
            DeclarationTypeExtractor.extractFieldAndVariableTypes(buckets) +
                DeclarationTypeExtractor.extractCStyleCasts(buckets) +
                CallExpressionTypeExtractor.extractInstantiationTypes(buckets) +
                CallExpressionTypeExtractor.extractConstructorInitializerTypes(buckets) +
                DeclarationTypeExtractor.extractTypeOperandTypes(buckets) +
                ClassScopeExtractor.extractFriendAndUsingTypes(buckets) +
                SignatureTypeExtractor.extractInheritance(buckets) +
                SignatureTypeExtractor.extractMethodReturnAndParamTypes(buckets) +
                SignatureTypeExtractor.extractDeclaratorParamTypes(buckets) +
                AliasConstraintExtractor.extractAliasTypes(buckets) +
                AliasConstraintExtractor.extractConstraintTypes(declaration)
        ).toSet()
    }

    private fun groupDescendantsStoppingAtNestedDeclarations(root: SyntaxNode, targetTypes: Set<String>): Map<String, List<SyntaxNode>> {
        val buckets = mutableMapOf<String, MutableList<SyntaxNode>>()
        if (!root.isNull && root.type in targetTypes) {
            buckets.getOrPut(root.type) { mutableListOf() }.add(root)
        }
        val stack = ArrayDeque<SyntaxNode>()
        root.children().forEach(stack::addLast)
        while (stack.isNotEmpty()) {
            val node = stack.removeLast()
            if (!node.isNull) {
                if (node.type in targetTypes) {
                    buckets.getOrPut(node.type) { mutableListOf() }.add(node)
                }
                if (node.type !in DECLARATION_BOUNDARIES) {
                    node.children().forEach(stack::addLast)
                }
            }
        }
        return buckets
    }
}
